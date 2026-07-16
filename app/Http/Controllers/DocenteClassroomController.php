<?php

namespace App\Http\Controllers;

use App\Models\AcademicLoad;
use App\Models\CriterioEvaluacion;
use App\Models\Grade;
use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class DocenteClassroomController extends Controller
{
    /**
     * Obtiene la configuración de criterios y calificaciones de una clase/parcial.
     */
    public function getConfig(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();
        $parcial = (int) $request->query('parcial', 1);

        // 1. Obtener criterios
        $criteria = CriterioEvaluacion::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->nombre,
                    'percentage' => $c->porcentaje,
                    'syncTasks' => (bool)$c->sync_tasks,
                ];
            });

        $configured = $criteria->count() > 0;

        // 2. Obtener alumnos y calificaciones del grupo
        $enrollments = Enrollment::where('academic_group_id', $load->academic_group_id)
            ->where('status', 'active')
            ->with('user')
            ->get();

        $gradesData = [];
        foreach ($enrollments as $enrollment) {
            $studentScores = [];
            foreach ($criteria as $c) {
                $grade = Grade::where('criterio_id', $c['id'])
                    ->where('user_id', $enrollment->user_id)
                    ->first();
                $studentScores[$c['id']] = $grade ? $grade->score : '';
            }

            // [OPTIMIZACIÓN] Obtener promedios ya consolidados
            $consolidado = \App\Models\ConsolidadoCalificacion::where('user_id', $enrollment->user_id)
                ->where('carga_id', $load->id)
                ->first();

            $gradesData[] = [
                'id' => $enrollment->user_id,
                'name' => $enrollment->user->name ?? 'Sin nombre',
                'matricula' => $enrollment->student_code ?? 'N/A',
                'scores' => $studentScores,
                'consolidado' => $consolidado ? [
                    'p1' => $consolidado->p1,
                    'p2' => $consolidado->p2,
                    'p3' => $consolidado->p3,
                    'final' => $consolidado->final,
                    'estatus' => $consolidado->estatus,
                ] : null
            ];
        }

        return response()->json([
            'configured' => $configured,
            'criteria' => $criteria,
            'grades' => $gradesData
        ]);
    }

    /**
     * Guarda o actualiza los criterios de evaluación de un parcial.
     */
    public function saveCriterios(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'parcial' => 'required|integer',
            'criteria' => 'required|array',
            'criteria.*.name' => 'required|string',
            'criteria.*.percentage' => 'required|integer',
        ]);

        $parcial = $request->input('parcial');
        $criteriaData = $request->input('criteria');

        // Borrar criterios anteriores para este parcial
        CriterioEvaluacion::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->delete();

        // Crear nuevos criterios
        $newCriteria = [];
        foreach ($criteriaData as $c) {
            $newCrit = CriterioEvaluacion::create([
                'carga_id' => $load->id,
                'parcial' => $parcial,
                'nombre' => $c['name'],
                'porcentaje' => $c['percentage'],
                'sync_tasks' => isset($c['syncTasks']) ? (bool)$c['syncTasks'] : false,
            ]);
            $newCriteria[] = [
                'id' => $newCrit->id,
                'name' => $newCrit->nombre,
                'percentage' => $newCrit->porcentaje,
                'syncTasks' => (bool)$newCrit->sync_tasks,
            ];
        }

        return response()->json([
            'message' => 'Criterios guardados correctamente',
            'criteria' => $newCriteria
        ]);
    }

    /**
     * Guarda las calificaciones asentadas por el docente.
     */
    public function saveCalificaciones(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'parcial' => 'required|integer',
            'grades' => 'required|array',
        ]);

        $grades = $request->input('grades');

        foreach ($grades as $studentGrade) {
            $userId = $studentGrade['id'];
            $scores = $studentGrade['scores'];

            foreach ($scores as $criterionId => $score) {
                Grade::updateOrCreate(
                    [
                        'criterio_id' => $criterionId,
                        'user_id' => $userId
                    ],
                    [
                        'score' => $score !== null ? (string)$score : ''
                    ]
                );
            }

            // [OPTIMIZACIÓN] Consolidar promedios en la tabla caché para reportes rápidos
            \App\Services\GradeConsolidator::consolidate($userId, $load->id);
        }

        return response()->json([
            'message' => 'Calificaciones asentadas correctamente'
        ]);
    }

    /**
     * Obtiene las tareas y calificaciones de una clase/parcial.
     */
    public function getTareas(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();
        $parcial = (int) $request->query('parcial', 1);

        $tareas = Tarea::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->orderBy('id', 'asc')
            ->get();

        $tasksData = [];
        foreach ($tareas as $t) {
            $grades = [];
            $entregas = EntregaTarea::where('tarea_id', $t->id)->get();
            foreach ($entregas as $entrega) {
                $grades[$entrega->user_id] = $entrega->score;
            }
            $tasksData[] = [
                'id' => $t->id,
                'name' => $t->name,
                'description' => $t->description,
                'deadline' => $t->deadline,
                'points' => $t->points,
                'grades' => $grades,
            ];
        }

        return response()->json([
            'tasks' => $tasksData
        ]);
    }

    /**
     * Sincroniza y guarda las tareas de un parcial en Supabase.
     */
    public function saveTareas(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'parcial' => 'required|integer',
            'tasks' => 'required|array',
        ]);

        $parcial = $request->input('parcial');
        $tasksData = $request->input('tasks');

        $activeIds = [];

        foreach ($tasksData as $taskItem) {
            $taskId = isset($taskItem['id']) && is_numeric($taskItem['id']) ? $taskItem['id'] : null;

            $tarea = Tarea::updateOrCreate(
                [
                    'id' => $taskId,
                ],
                [
                    'carga_id' => $load->id,
                    'parcial' => $parcial,
                    'name' => $taskItem['name'],
                    'description' => $taskItem['description'] ?? '',
                    'deadline' => $taskItem['deadline'] ?? null,
                    'points' => $taskItem['points'] ?? 10,
                ]
            );

            $activeIds[] = $tarea->id;

            // Guardar calificaciones de los alumnos para esta tarea
            if (isset($taskItem['grades']) && is_array($taskItem['grades'])) {
                foreach ($taskItem['grades'] as $userId => $score) {
                    if (is_numeric($userId)) {
                        EntregaTarea::updateOrCreate(
                            [
                                'tarea_id' => $tarea->id,
                                'user_id' => $userId
                            ],
                            [
                                'score' => $score !== null ? (string)$score : '',
                                'status' => $score !== null && $score !== '' ? 'graded' : 'pending'
                            ]
                        );
                    }
                }
            }
        }

        // Eliminar tareas que el docente quitó en el listado
        Tarea::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->whereNotIn('id', $activeIds)
            ->delete();

        // Retornar las tareas frescas actualizadas con sus IDs reales
        return $this->getTareas($request, $uuid);
    }
}

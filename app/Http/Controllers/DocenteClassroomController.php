<?php

namespace App\Http\Controllers;

use App\Models\AcademicLoad;
use App\Models\CriterioEvaluacion;
use App\Models\Grade;
use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Models\Enrollment;
use App\Services\AcademicPeriodService;
use Illuminate\Http\Request;

class DocenteClassroomController extends Controller
{
    /**
     * Obtiene la configuración de criterios y calificaciones de una clase/parcial.
     */
    public function getConfig(Request $request, $uuid)
    {
        $load = AcademicLoad::with('academicPeriod')->where('uuid', $uuid)->firstOrFail();
        $parcial = (int) $request->query('parcial', 1);

        // [DETALLE v3.19] Separar bloqueo de configuración y operación
        $lockConfig = AcademicPeriodService::isCapturaHabilitada($load->academicPeriod, $parcial, 'config');
        $lockOperacion = AcademicPeriodService::isCapturaHabilitada($load->academicPeriod, $parcial, 'operacion');

        // 1. Obtener criterios
        $criteria = CriterioEvaluacion::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'nombre' => $c->nombre,
                    'porcentaje' => $c->porcentaje,
                    'sincronizar_tareas' => (bool)$c->sincronizar_tareas,
                ];
            });

        $configurado = $criteria->count() > 0;

        // 2. Obtener alumnos y calificaciones del grupo
        $enrollments = Enrollment::where('grupo_id', $load->grupo_id)
            ->where('estatus', 'active')
            ->with('user')
            ->get();

        $studentIds = $enrollments->pluck('usuario_id');
        $criteriaIds = $criteria->pluck('id');

        // [OPTIMIZACIÓN] Obtener todas las calificaciones de una vez para evitar N+1
        $allGrades = Grade::whereIn('usuario_id', $studentIds)
            ->whereIn('criterio_id', $criteriaIds)
            ->get()
            ->groupBy('usuario_id');

        // [OPTIMIZACIÓN] Obtener todos los promedios consolidados de una vez
        $allConsolidados = Grade::whereIn('usuario_id', $studentIds)
            ->where('carga_id', $load->id)
            ->whereNull('criterio_id')
            ->get()
            ->keyBy('usuario_id');

        $gradesData = [];
        foreach ($enrollments as $enrollment) {
            $studentScores = [];
            $studentGrades = $allGrades->get($enrollment->usuario_id, collect());

            foreach ($criteria as $c) {
                $grade = $studentGrades->where('criterio_id', $c['id'])->first();
                $studentScores[$c['id']] = $grade ? $grade->calificacion : '';
            }

            $consolidado = $allConsolidados->get($enrollment->usuario_id);

            $gradesData[] = [
                'id' => $enrollment->usuario_id,
                'nombre' => $enrollment->user?->nombre_completo ?? 'Sin nombre',
                'matricula' => $enrollment->codigo_alumno ?? 'N/A',
                'calificaciones' => $studentScores,
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
            'configurado' => $configurado,
            'criterios' => $criteria,
            'alumnos' => $gradesData,
            'color_tema' => $load->color_tema ?? 'blue',
            'lock_info' => $lockOperacion,
            'lock_config' => $lockConfig
        ]);
    }

    /**
     * Actualiza el tema visual (color) de la clase.
     */
    public function updateTheme(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'color' => 'required|string'
        ]);

        $load->update(['color_tema' => $request->input('color')]);

        // [IMPORTANTE] Limpiar el caché de los alumnos de este grupo para que vean el cambio al instante
        $studentIds = \App\Models\Enrollment::where('grupo_id', $load->grupo_id)
            ->where('estatus', 'active')
            ->pluck('usuario_id');

        foreach ($studentIds as $id) {
            \Cache::forget("student_kardex_{$id}");
            \Cache::forget("student_tasks_{$id}");
        }

        return response()->json(['message' => 'Tema actualizado']);
    }

    /**
     * Guarda o actualiza los criterios de evaluación de un parcial.
     */
    public function saveCriterios(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'parcial' => 'required|integer',
            'criterios' => 'required|array',
            'criterios.*.nombre' => 'required|string',
            'criterios.*.porcentaje' => 'required|integer',
        ]);

        $parcial = $request->input('parcial');
        $criteriaData = $request->input('criterios');

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
                'nombre' => $c['nombre'],
                'porcentaje' => $c['porcentaje'],
                'sincronizar_tareas' => isset($c['sincronizar_tareas']) ? (bool)$c['sincronizar_tareas'] : false,
            ]);
            $newCriteria[] = [
                'id' => $newCrit->id,
                'nombre' => $newCrit->nombre,
                'porcentaje' => $newCrit->porcentaje,
                'sincronizar_tareas' => (bool)$newCrit->sincronizar_tareas,
            ];
        }

        return response()->json([
            'message' => 'Criterios guardados correctamente',
            'criterios' => $newCriteria
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
            'alumnos' => 'required|array',
        ]);

        $grades = $request->input('alumnos');

        foreach ($grades as $studentGrade) {
            $userId = $studentGrade['id'];
            $scores = $studentGrade['calificaciones'];

            foreach ($scores as $criterionId => $score) {
                Grade::updateOrCreate(
                    [
                        'criterio_id' => $criterionId,
                        'usuario_id'  => $userId
                    ],
                    [
                        'calificacion' => $score !== null ? (string)$score : '',
                        'carga_id' => $load->id // Asegurar carga_id en cada fila
                    ]
                );
            }

            // [OPTIMIZACIÓN] Consolidar promedios
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
            ->with('entregas')
            ->orderBy('id', 'asc')
            ->get();

        $tasksData = [];
        foreach ($tareas as $t) {
            $grades = [];
            foreach ($t->entregas as $entrega) {
                $grades[$entrega->usuario_id] = $entrega->calificacion;
            }
            $tasksData[] = [
                'id' => $t->id,
                'nombre' => $t->nombre,
                'descripcion' => $t->descripcion,
                'fecha_entrega' => $t->fecha_entrega,
                'puntos' => $t->puntos,
                'calificaciones' => $grades,
            ];
        }

        return response()->json([
            'tareas' => $tasksData
        ]);
    }

    /**
     * Sincroniza y guarda las tareas de un parcial.
     */
    public function saveTareas(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'parcial' => 'required|integer',
            'tareas' => 'required|array',
        ]);

        $parcial = $request->input('parcial');
        $tasksData = $request->input('tareas');

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
                    'nombre' => $taskItem['nombre'],
                    'descripcion' => $taskItem['descripcion'] ?? '',
                    'fecha_entrega' => $taskItem['fecha_entrega'] ?? null,
                    'puntos' => $taskItem['puntos'] ?? 10,
                ]
            );

            $activeIds[] = $tarea->id;

            // Guardar calificaciones de los alumnos para esta tarea
            if (isset($taskItem['calificaciones']) && is_array($taskItem['calificaciones'])) {
                foreach ($taskItem['calificaciones'] as $userId => $score) {
                    if (is_numeric($userId)) {
                        EntregaTarea::updateOrCreate(
                            [
                                'tarea_id'   => $tarea->id,
                                'usuario_id' => $userId
                            ],
                            [
                                'calificacion' => $score !== null ? (string)$score : '',
                                'estatus'      => $score !== null && $score !== '' ? 'graded' : 'pending'
                            ]
                        );
                    }
                }
            }
        }

        Tarea::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->whereNotIn('id', $activeIds)
            ->delete();

        return $this->getTareas($request, $uuid);
    }
}

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
use Inertia\Inertia;

class DocenteClassroomController extends Controller
{
    /**
     * Muestra la vista principal del aula virtual con toda la verdad inyectada.
     * [ARQUITECTURA ATÓMICA v5.0]
     */
    public function show(Request $request)
    {
        $uuid = $request->query('id');

        return Inertia::render('Docente/Grupos/Show', [
            'classInfo' => Inertia::defer(fn() => $this->assembleFullClassData($uuid))
        ]);
    }

    /**
     * Ensambla el objeto de "Verdad Total" para el aula virtual.
     */
    private function assembleFullClassData($uuid)
    {
        $load = AcademicLoad::with(['academicPeriod', 'academicGroup', 'course', 'criterios', 'tareas.entregas'])
            ->where('uuid', $uuid)
            ->first();

        if (!$load) return null;

        $parciales = [1, 2, 3];
        $enrollments = Enrollment::where('grupo_id', $load->grupo_id)
            ->where('estatus', 'active')
            ->with('user')
            ->get();

        $studentIds = $enrollments->pluck('usuario_id');
        $allGrades = Grade::whereIn('usuario_id', $studentIds)
            ->where('carga_id', $load->id)
            ->get();

        $fullData = [
            'id'             => $load->uuid,
            'nombre_grupo'   => $load->academicGroup->nombre ?? 'N/A',
            'nombre_materia' => $load->course->nombre ?? 'N/A',
            'codigo_materia' => $load->course->codigo ?? 'N/A',
            'especialidad'   => $load->academicGroup->especialidad ?? 'N/A',
            'semestre'       => $load->course->semestre ?? 1,
            'ciclo_id'       => $load->ciclo_id,
            'color_tema'     => $load->color_tema ?? 'blue',

            // Datos Estructurados por Parcial
            'parciales' => []
        ];

        foreach ($parciales as $p) {
            $criteria = $load->criterios->where('parcial', $p)->values();

            // Alumnos y sus notas para este parcial
            $studentsData = [];
            foreach ($enrollments as $enrollment) {
                $studentScores = [];
                $studentGrades = $allGrades->where('usuario_id', $enrollment->usuario_id);

                foreach ($criteria as $c) {
                    $grade = $studentGrades->where('criterio_id', $c->id)->first();
                    $rawScore = $grade ? $grade->calificacion : '';
                    // Formatear nota de criterio como entero (.6 sube)
                    $studentScores[$c->id] = ($rawScore !== '' && $rawScore !== null)
                        ? (string)\App\Services\GradeService::formatGrade($rawScore)
                        : '';
                }

                $consolidado = $studentGrades->whereNull('criterio_id')->first();

                $studentsData[] = [
                    'id'             => $enrollment->usuario_id,
                    'nombre'         => $enrollment->user?->nombre_completo ?? 'Sin nombre',
                    'matricula'      => $enrollment->codigo_alumno ?? 'N/A',
                    'calificaciones' => $studentScores,
                    'consolidado'    => $consolidado ? [
                        'p1'     => \App\Services\GradeService::formatGrade($consolidado->p1),
                        'p2'     => \App\Services\GradeService::formatGrade($consolidado->p2),
                        'p3'     => \App\Services\GradeService::formatGrade($consolidado->p3),
                        'final'  => \App\Services\GradeService::formatGrade($consolidado->final),
                        'estatus' => $consolidado->estatus
                    ] : null
                ];
            }

            $lockConfig = ['allowed' => false, 'reason' => 'Ciclo no definido'];
            $lockOperacion = ['allowed' => false, 'reason' => 'Ciclo no definido'];

            if ($load->academicPeriod) {
                $lockConfig = AcademicPeriodService::isCapturaHabilitada($load->academicPeriod, $p, 'config', $load);
                $lockOperacion = AcademicPeriodService::isCapturaHabilitada($load->academicPeriod, $p, 'operacion', $load);
            }

            $fullData['parciales'][$p] = [
                'lock_info'   => $lockOperacion,
                'lock_config' => $lockConfig,
                'config'      => [
                    'configured' => $criteria->count() > 0,
                    'criteria'   => $criteria->map(fn($c) => [
                        'id' => $c->id,
                        'nombre' => $c->nombre,
                        'porcentaje' => $c->porcentaje,
                        'sincronizar_tareas' => (bool)$c->sincronizar_tareas
                    ])
                ],
                'tasks' => $load->tareas->where('parcial', $p)->values()->map(fn($t) => [
                    'id' => $t->id,
                    'nombre' => $t->nombre,
                    'descripcion' => $t->descripcion,
                    'fecha_entrega' => $t->fecha_entrega,
                    'puntos' => $t->puntos,
                    'calificaciones' => $t->entregas->mapWithKeys(fn($e) => [
                        $e->usuario_id => (string)\App\Services\GradeService::formatGrade($e->calificacion)
                    ])->toArray(),
                    'archivos' => $t->entregas->mapWithKeys(fn($e) => [
                        $e->usuario_id => $e->archivo_url ? [
                            'url' => $e->archivo_url,
                            'nombre' => $e->archivo_nombre,
                            'estatus' => $e->estatus
                        ] : null
                    ])->toArray()
                ]),
                'students' => $studentsData
            ];
        }

        // Compatibilidad con la lista plana para el banner
        $fullData['alumnos'] = $fullData['parciales'][1]['students'];

        return $fullData;
    }

    /**
     * Obtiene la verdad total de la clase (Para refrescos RT).
     */
    public function getFullData(Request $request, $uuid)
    {
        return response()->json($this->assembleFullClassData($uuid));
    }

    /**
     * Actualiza el tema visual (color) de la clase.
     */
    public function updateTheme(Request $request, $uuid)
    {
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();
        $request->validate(['color' => 'required|string']);
        $load->update(['color_tema' => $request->input('color')]);
        $this->clearStudentsCache($load);
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

        CriterioEvaluacion::where('carga_id', $load->id)->where('parcial', $parcial)->delete();

        foreach ($criteriaData as $c) {
            CriterioEvaluacion::create([
                'carga_id' => $load->id,
                'parcial' => $parcial,
                'nombre' => $c['nombre'],
                'porcentaje' => $c['porcentaje'],
                'sincronizar_tareas' => isset($c['sincronizar_tareas']) ? (bool)$c['sincronizar_tareas'] : false,
            ]);
        }

        // [CONSOLIDACIÓN AUTOMÁTICA] Recalcular el consolidado de cada alumno de la clase
        $studentUserIds = \App\Models\Enrollment::where('grupo_id', $load->grupo_id)
            ->where('ciclo_id', $load->ciclo_id)
            ->where('estatus', 'active')
            ->pluck('usuario_id');

        foreach ($studentUserIds as $sUserId) {
            \App\Services\GradeConsolidator::consolidate($sUserId, $load->id);
        }

        $this->clearStudentsCache($load);

        $updatedCriteria = CriterioEvaluacion::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->get()
            ->map(fn($c) => [
                'id' => $c->id, 'nombre' => $c->nombre, 'porcentaje' => $c->porcentaje,
                'sincronizar_tareas' => (bool)$c->sincronizar_tareas
            ]);

        return response()->json([
            'message' => 'Criterios guardados',
            'criterios' => $updatedCriteria
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
                $finalScore = ($score !== '' && $score !== null) ? (int)round(floatval($score)) : '';
                Grade::updateOrCreate(
                    ['criterio_id' => $criterionId, 'usuario_id'  => $userId],
                    ['calificacion' => (string)$finalScore, 'carga_id' => $load->id]
                );
            }
            \App\Services\GradeConsolidator::consolidate($userId, $load->id);
        }

        $this->clearStudentsCache($load);
        return response()->json(['message' => 'Calificaciones asentadas']);
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
                ['id' => $taskId],
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

            if (isset($taskItem['calificaciones']) && is_array($taskItem['calificaciones'])) {
                foreach ($taskItem['calificaciones'] as $userId => $score) {
                    if (is_numeric($userId)) {
                        $finalScore = ($score !== null && $score !== '') ? (int)round(floatval($score)) : '';
                        EntregaTarea::updateOrCreate(
                            ['tarea_id' => $tarea->id, 'usuario_id' => $userId],
                            [
                                'calificacion' => (string)$finalScore,
                                'status' => ($finalScore !== '') ? 'graded' : 'pending'
                            ]
                        );
                    }
                }
            }
        }

        Tarea::where('carga_id', $load->id)->where('parcial', $parcial)->whereNotIn('id', $activeIds)->delete();

        // [CONSOLIDACIÓN AUTOMÁTICA] Recalcular el consolidado de cada alumno de la clase
        $studentUserIds = \App\Models\Enrollment::where('grupo_id', $load->grupo_id)
            ->where('ciclo_id', $load->ciclo_id)
            ->where('estatus', 'active')
            ->pluck('usuario_id');

        foreach ($studentUserIds as $sUserId) {
            \App\Services\GradeConsolidator::consolidate($sUserId, $load->id);
        }

        $this->clearStudentsCache($load);

        $updatedTasks = Tarea::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->with('entregas')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id, 'nombre' => $t->nombre, 'descripcion' => $t->descripcion,
                'fecha_entrega' => $t->fecha_entrega, 'puntos' => $t->puntos,
                'calificaciones' => $t->entregas->mapWithKeys(fn($e) => [
                    $e->usuario_id => (string)\App\Services\GradeService::formatGrade($e->calificacion)
                ])->toArray()
            ]);

        return response()->json([
            'message' => 'Tareas guardadas',
            'tareas' => $updatedTasks
        ]);
    }

    /**
     * Devuelve una calificación oficialmente al alumno y le notifica.
     * [ACCION v6.0] Confirmación manual de guardado + Notificación.
     */
    public function returnGrade(Request $request, $uuid)
    {
        $request->validate([
            'tarea_id' => 'required|integer',
            'usuario_id' => 'required|integer',
            'calificacion' => 'required|string',
        ]);

        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();

        // 1. Guardar calificación
        $score = \App\Services\GradeService::formatGrade($request->calificacion);

        EntregaTarea::updateOrCreate(
            ['tarea_id' => $request->tarea_id, 'usuario_id' => $request->usuario_id],
            [
                'calificacion' => (string)$score,
                'status' => 'graded'
            ]
        );

        // 2. Notificar al alumno
        $task = Tarea::findOrFail($request->tarea_id);
        \App\Models\Notificacion::create([
            'usuario_id' => $request->usuario_id,
            'titulo' => 'Actividad Calificada',
            'mensaje' => "Tu actividad '{$task->nombre}' ha sido evaluada con {$score} puntos.",
            'leido' => false
        ]);

        // 3. Consolidar promedios
        \App\Services\GradeConsolidator::consolidate($request->usuario_id, $load->id);

        $this->clearStudentsCache($load);

        return response()->json([
            'message' => 'Calificación devuelta correctamente',
            'score'   => $score
        ]);
    }

    /**
     * Concluye oficialmente un parcial para una clase.
     */
    public function concludeParcial(Request $request, $uuid)
    {
        $request->validate([
            'parcial' => 'required|integer|in:1,2,3'
        ]);

        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();
        $parcial = $request->input('parcial');
        $field = "p{$parcial}_cerrado";

        $load->update([$field => true]);

        // Registrar en Auditoría
        \App\Models\AdminAuditLog::create([
            'usuario_id' => auth()->id(),
            'accion' => 'CONCLUIR_PARCIAL_DOCENTE',
            'descripcion' => "El docente concluyó oficialmente el Parcial {$parcial} para la materia {$load->course->nombre}.",
            'metadata' => ['carga_id' => $load->id, 'parcial' => $parcial]
        ]);

        // [ThunderSync] Limpiar cache de alumnos para que vean el estatus de "Calificado"
        $this->clearStudentsCache($load);

        return response()->json(['message' => "Parcial {$parcial} concluido con éxito."]);
    }

    private function clearStudentsCache(AcademicLoad $load)
    {
        // Incrementar versión de cache global de estudiantes para invalidar instantáneamente
        \Cache::increment('student_cache_version');

        $studentIds = Enrollment::where('grupo_id', $load->grupo_id)->where('estatus', 'active')->pluck('usuario_id');
        foreach ($studentIds as $id) {
            \Cache::forget("student_kardex_{$id}");
            \Cache::forget("student_tasks_{$id}");
            \Cache::forget("sidebar_alumno_{$id}");
        }
    }
}

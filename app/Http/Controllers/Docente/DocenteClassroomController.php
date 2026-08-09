<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;

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
            'grupo_id'       => $load->grupo_id,
            'color_tema'     => $load->color_tema ?? 'blue',

            // Datos Estructurados por Parcial
            'parciales' => []
        ];

        // Indexar calificaciones en memoria O(1) para eliminar loops anidados lentos
        $gradesLookup = [];
        $consolidadoLookup = [];
        foreach ($allGrades as $g) {
            if ($g->criterio_id !== null) {
                $gradesLookup[$g->usuario_id][$g->criterio_id] = $g->calificacion;
            } else {
                $consolidadoLookup[$g->usuario_id] = $g;
            }
        }

        foreach ($parciales as $p) {
            $criteria = $load->criterios->where('parcial', $p)->values();

            // Alumnos y sus notas para este parcial (Optimizado O(1))
            $studentsData = [];
            foreach ($enrollments as $enrollment) {
                $uId = $enrollment->usuario_id;
                $studentScores = [];

                foreach ($criteria as $c) {
                    $rawScore = $gradesLookup[$uId][$c->id] ?? '';
                    $studentScores[$c->id] = ($rawScore !== '' && $rawScore !== null)
                        ? (string)\App\Services\GradeService::formatGrade($rawScore)
                        : '';
                }

                $consolidado = $consolidadoLookup[$uId] ?? null;

                $studentsData[] = [
                    'id'             => $uId,
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
                    'hora_entrega' => $t->fecha_entrega ? (str_contains($t->fecha_entrega, ' ') ? explode(' ', $t->fecha_entrega)[1] : '') : '',
                    'puntos' => $t->puntos,
                    'calificaciones' => $t->entregas->mapWithKeys(fn($e) => [
                        $e->usuario_id => (string)\App\Services\GradeService::formatGrade($e->calificacion)
                    ])->toArray(),
                    'archivos' => $t->entregas
                        ->filter(fn($e) => in_array($e->estatus, ['submitted', 'graded', 'entregado']))
                        ->mapWithKeys(fn($e) => [
                            $e->usuario_id => [
                                'url' => $e->archivo_url ?: $e->google_drive_url,
                                'nombre' => $e->archivo_nombre ?: 'Documento de Entrega',
                                'estatus' => $e->estatus,
                                'raw_url' => $e->archivo_url
                            ]
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
        
        // Notificar cambio de tema en tiempo real a todos los alumnos del grupo
        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'theme'));

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
            'criterios' => 'present|array',
            'criterios.*.nombre' => 'required_with:criterios|string',
            'criterios.*.porcentaje' => 'required_with:criterios|integer',
        ]);

        $parcial = $request->input('parcial');
        $criteriaData = $request->input('criterios');

        CriterioEvaluacion::where('carga_id', $load->id)->where('parcial', $parcial)->delete();

        // Si se reinicia el parcial (sin criterios), borrar también las tareas del parcial
        if (empty($criteriaData)) {
            $taskIds = Tarea::where('carga_id', $load->id)->where('parcial', $parcial)->pluck('id');
            EntregaTarea::whereIn('tarea_id', $taskIds)->delete();
            Tarea::whereIn('id', $taskIds)->delete();
        }

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

        \App\Services\GradeConsolidator::consolidateGroup($load->id);

        // Notificar actualización masiva
        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'grades'));

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
        $upsertGrades = [];

        foreach ($grades as $studentGrade) {
            $userId = $studentGrade['id'];
            $scores = $studentGrade['calificaciones'];

            foreach ($scores as $criterionId => $score) {
                $finalScore = ($score !== '' && $score !== null) ? (int)round(floatval($score)) : '';
                $upsertGrades[] = [
                    'usuario_id' => $userId,
                    'carga_id' => $load->id,
                    'criterio_id' => $criterionId,
                    'calificacion' => (string)$finalScore,
                    'updated_at' => now(),
                ];
            }
        }

        if (!empty($upsertGrades)) {
            Grade::upsert($upsertGrades, ['usuario_id', 'carga_id', 'criterio_id'], ['calificacion', 'updated_at']);
        }

        // Consolidación masiva (Optimizado)
        \App\Services\GradeConsolidator::consolidateGroup($load->id);

        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'grades'));

        $this->clearStudentsCache($load);
        return response()->json(['message' => 'Calificaciones asentadas']);
    }

    /**
     * Sincroniza y guarda las tareas de un parcial.
     */
    public function saveTareas(Request $request, $uuid)
    {
        \Illuminate\Support\Facades\Log::info("RT_DEBUG: saveTareas started for UUID: $uuid");
        $load = AcademicLoad::where('uuid', $uuid)->firstOrFail();
        $request->validate([
            'parcial' => 'required|integer',
            'tareas' => 'present|array',
        ]);

        $parcial = $request->input('parcial');
        $tasksData = $request->input('tareas');
        $activeIds = [];
        $upsertSubmissions = [];

        foreach ($tasksData as $taskItem) {
            $taskId = isset($taskItem['id']) && is_numeric($taskItem['id']) ? $taskItem['id'] : null;
            $rawFecha = $taskItem['fecha_entrega'] ?? null;
            $rawHora = $taskItem['hora_entrega'] ?? '';

            $fechaEntrega = null;
            if ($rawFecha) {
                $onlyDate = explode(' ', $rawFecha)[0];
                $fechaEntrega = !empty($rawHora) ? ($onlyDate . ' ' . (strlen($rawHora) === 5 ? $rawHora . ':00' : $rawHora)) : ($onlyDate . ' 23:59:00');
            }

            $tareaExistente = Tarea::find($taskId);
            $nombreAnterior = $tareaExistente?->nombre;

            $tarea = Tarea::updateOrCreate(
                ['id' => $taskId],
                [
                    'carga_id' => $load->id,
                    'parcial' => $parcial,
                    'nombre' => $taskItem['nombre'],
                    'descripcion' => $taskItem['descripcion'] ?? '',
                    'fecha_entrega' => $fechaEntrega,
                    'hora_entrega' => $rawHora,
                    'puntos' => $taskItem['puntos'] ?? 10,
                ]
            );
            $activeIds[] = $tarea->id;

            // ⚡ Sincronizar cambio de nombre en la carpeta de Google Drive si existe
            if ($tarea->drive_folder_id && $nombreAnterior && $nombreAnterior !== $taskItem['nombre']) {
                try {
                    $driveService = app(\App\Services\GoogleDriveService::class);
                    $driveService->renameFolder($tarea->drive_folder_id, $taskItem['nombre']);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error("Error al renombrar carpeta en Drive: " . $e->getMessage());
                }
            }

            if (isset($taskItem['calificaciones']) && is_array($taskItem['calificaciones'])) {
                foreach ($taskItem['calificaciones'] as $userId => $score) {
                    if (is_numeric($userId)) {
                        $finalScore = ($score !== null && $score !== '') ? (int)round(floatval($score)) : '';
                        
                        $entregaPrevia = EntregaTarea::where('tarea_id', $tarea->id)->where('usuario_id', $userId)->first();
                        $estatusActual = $entregaPrevia?->estatus ?? 'pending';
                        $nuevoEstatus = ($finalScore !== '') ? 'graded' : (($estatusActual === 'submitted' || $estatusActual === 'entregado') ? $estatusActual : 'pending');

                        EntregaTarea::updateOrCreate(
                            ['tarea_id' => $tarea->id, 'usuario_id' => $userId],
                            [
                                'calificacion' => (string)$finalScore,
                                'estatus' => $nuevoEstatus,
                                'updated_at' => now(),
                            ]
                        );
                    }
                }
            }
        }

        $tasksToDelete = Tarea::where('carga_id', $load->id)->where('parcial', $parcial)->whereNotIn('id', $activeIds)->get();
        foreach ($tasksToDelete as $taskToDelete) {
            // ⚡ Borrar la carpeta correspondiente en Google Drive si existe
            if ($taskToDelete->drive_folder_id) {
                try {
                    $driveService = app(\App\Services\GoogleDriveService::class);
                    $driveService->deleteFile($taskToDelete->drive_folder_id);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error("Error al eliminar carpeta en Drive: " . $e->getMessage());
                }
            }
            $taskToDelete->delete();
        }

        // [CONSOLIDACIÓN RÁPIDA]
        try {
            \App\Services\GradeConsolidator::consolidateGroup($load->id);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("RT_DEBUG: Error in consolidateGroup: " . $e->getMessage());
        }

        // Notificar actualización masiva limpia de una sola vez
        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'all'));

        $this->clearStudentsCache($load);

        $updatedTasks = Tarea::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->with('entregas')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id, 'nombre' => $t->nombre, 'descripcion' => $t->descripcion,
                'fecha_entrega' => $t->fecha_entrega,
                'hora_entrega' => $t->hora_entrega ?: ($t->fecha_entrega ? (str_contains($t->fecha_entrega, ' ') ? explode(' ', $t->fecha_entrega)[1] : '') : ''),
                'puntos' => $t->puntos,
                'calificaciones' => $t->entregas->mapWithKeys(fn($e) => [
                    $e->usuario_id => (string)\App\Services\GradeService::formatGrade($e->calificacion)
                ])->toArray()
            ]);

        \Illuminate\Support\Facades\Log::info("RT_DEBUG: saveTareas finished successfully");
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
        \App\Models\Grade::withoutEvents(function () use ($request, $load) {
            \App\Services\GradeConsolidator::consolidate($request->usuario_id, $load->id);
        });

        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'grades'));

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
        $version = \Cache::get('student_cache_version', 1);
        \Cache::increment('student_cache_version');

        $studentIds = Enrollment::where('grupo_id', $load->grupo_id)->where('estatus', 'active')->pluck('usuario_id');
        foreach ($studentIds as $id) {
            \Cache::forget("student_kardex_{$id}_v{$version}");
            \Cache::forget("student_tasks_{$id}_v{$version}");
            \Cache::forget("student_kardex_{$id}");
            \Cache::forget("student_tasks_{$id}");
            \Cache::forget("sidebar_alumno_{$id}");
        }
    }
}

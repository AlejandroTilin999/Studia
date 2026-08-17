<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;

use App\Models\AcademicLoad;
use App\Models\CriterioEvaluacion;
use App\Models\Grade;
use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Models\Enrollment;
use App\Models\Teacher;
use App\Services\AcademicPeriodService;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MateriaDocenteController extends Controller
{
    private function obtenerCargaAutorizada(string $uuid): AcademicLoad
    {
        $docenteId = Teacher::where('usuario_id', auth()->id())->value('id');
        abort_unless($docenteId, 403, 'No se encontró el perfil docente.');

        return AcademicLoad::where('uuid', $uuid)
            ->where('docente_id', $docenteId)
            ->firstOrFail();
    }

    /**
     * Muestra la vista principal del aula virtual con toda la verdad inyectada.
     * [ARQUITECTURA ATÓMICA v5.0]
     */
    public function show(Request $request, ?string $uuid = null, ?int $parcial = null, ?int $task = null)
    {
        $uuid = $uuid ?: $request->query('id');

        if (!$uuid) {
            return redirect()->route('docente.dashboard');
        }

        $carga = $this->obtenerCargaAutorizada($uuid);

        // La ruta anterior sigue siendo válida, pero se normaliza de inmediato
        // al formato canónico y compartible de la clase.
        if ($request->route()->getName() === 'docente.grupos.show') {
            $path = '/docente/clases/' . rawurlencode($uuid);
            $legacyParcial = $request->query('parcial');
            if (ctype_digit((string) $legacyParcial)) {
                $path .= '/parcial/' . $legacyParcial;
            }
            return redirect()->to($path);
        }

        if ($task && !Tarea::where('id', $task)->where('carga_id', $carga->id)->exists()) {
            abort(404);
        }

        return Inertia::render('Docente/Grupos/Show', [
            'classInfo' => $this->assembleFullClassData($uuid)
        ]);
    }

    /**
     * Ensambla el objeto de "Verdad Total" para el aula virtual.
     */
    private function assembleFullClassData($uuid)
    {
        $this->obtenerCargaAutorizada($uuid);
        $version = \Cache::get("docente_class_version_{$uuid}", 1);
        return \Cache::remember("full_class_data_{$uuid}_v{$version}", 300, function() use ($uuid) {
            $load = AcademicLoad::with(['academicPeriod', 'academicGroup', 'course', 'criterios', 'tareas.entregas'])
                ->where('uuid', $uuid)
                ->first();

            if (!$load) return null;

        $parciales = [1, 2, 3];
        $enrollments = Enrollment::where('grupo_id', $load->grupo_id)
            ->where('estatus', 'active')
            ->select('id', 'grupo_id', 'usuario_id', 'codigo_alumno', 'estatus')
            ->with('user:id,nombre,apellido_paterno,apellido_materno')
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
                    'hora_entrega' => $t->hora_entrega ?: ($t->fecha_entrega ? (str_contains($t->fecha_entrega, ' ') ? explode(' ', $t->fecha_entrega)[1] : '') : ''),
                    'puntos' => $t->puntos,
                    'attachments' => is_array($t->archivos) ? $t->archivos : (json_decode($t->archivos, true) ?: []),
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
        });
    }

    public function getFullData(Request $request, $uuid)
    {
        return response()->json($this->assembleFullClassData($uuid));
    }

    /**
     * Actualiza el tema visual (color) de la clase.
     */
    public function updateTheme(Request $request, $uuid)
    {
        $load = $this->obtenerCargaAutorizada($uuid);
        $request->validate(['color' => 'required|string']);
        $load->update(['color_tema' => $request->input('color')]);
        
        // Invalidate student cache version & group_loads cache so students receive new color instantly
        $this->clearStudentsCache($load, true);

        // Notificar cambio de tema en tiempo real a todos los alumnos del grupo
        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'theme', [
            'loadId' => $load->uuid,
            'colorTema' => $load->color_tema,
        ]));

        return response()->json(['message' => 'Tema actualizado']);
    }

    /**
     * Guarda o actualiza los criterios de evaluación de un parcial.
     */
    public function saveCriterios(Request $request, $uuid)
    {
        $load = $this->obtenerCargaAutorizada($uuid);
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

        // Limpiar caché primero para que la petición del WebSocket obtenga datos frescos
        $this->clearStudentsCache($load);

        // Notificar actualización masiva en tiempo real
        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'grades'));

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
        $load = $this->obtenerCargaAutorizada($uuid);
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

        $this->clearStudentsCache($load);
        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'grades'));
        return response()->json(['message' => 'Calificaciones asentadas']);
    }

    /**
     * Sincroniza y guarda las tareas de un parcial.
     */
    public function saveTareas(Request $request, $uuid)
    {
        $load = $this->obtenerCargaAutorizada($uuid);
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
            $rawHora = trim((string) ($taskItem['hora_entrega'] ?? ''));
            $deadline = Tarea::parseDeadline($rawFecha, $rawHora);
            $fechaEntrega = $deadline?->format('Y-m-d H:i:s');
            $horaEntrega = $rawHora !== '' ? $deadline?->format('H:i:s') : null;

            // Una tarea temporal del frontend no debe poder modificar una
            // tarea de otra carga académica que tenga el mismo ID.
            $tareaExistente = $taskId
                ? Tarea::where('carga_id', $load->id)->find($taskId)
                : null;
            $nombreAnterior = $tareaExistente?->nombre;

            $attachments = isset($taskItem['attachments']) && is_array($taskItem['attachments']) ? $taskItem['attachments'] : (isset($taskItem['archivos']) ? $taskItem['archivos'] : null);

            $tarea = $tareaExistente ?: new Tarea();
            $tarea->forceFill([
                'carga_id' => $load->id,
                'parcial' => $parcial,
                'nombre' => $taskItem['nombre'],
                'descripcion' => $taskItem['descripcion'] ?? '',
                'fecha_entrega' => $fechaEntrega,
                'hora_entrega' => $horaEntrega,
                'puntos' => $taskItem['puntos'] ?? 10,
                'archivos' => $attachments,
            ])->saveQuietly();
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
            $taskToDelete->deleteQuietly();
        }

        // [CONSOLIDACIÓN RÁPIDA]
        $this->clearStudentsCache($load);

        // Notificar actualización masiva limpia de una sola vez
        $load->loadMissing('course');
        $updatedTasks = Tarea::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->with('entregas')
            ->get()
            ->map(function (Tarea $t) {
                $deadlineAt = $t->deadlineAt();

                return [
                    'id' => $t->id, 'nombre' => $t->nombre, 'descripcion' => $t->descripcion,
                    'fecha_entrega' => $t->fecha_entrega,
                    'hora_entrega' => $t->hora_entrega ?: ($deadlineAt?->format('H:i:s') ?? ''),
                    'deadline' => $deadlineAt?->format('d/m/Y h:i A') ?? 'Sin fecha',
                    'deadlineAt' => $deadlineAt?->toIso8601String(),
                    'isOverdue' => $t->isOverdue(),
                    'puntos' => $t->puntos,
                    'attachments' => is_array($t->archivos) ? $t->archivos : (json_decode($t->archivos, true) ?: []),
                    'calificaciones' => $t->entregas->mapWithKeys(fn($e) => [
                    $e->usuario_id => (string)\App\Services\GradeService::formatGrade($e->calificacion)
                    ])->toArray()
                ];
            });

        $realtimeTasks = $updatedTasks->map(fn($task) => [
            'id' => $task['id'],
            'hash' => strtoupper(substr(md5('t_' . $task['id']), 0, 6)),
            'carga_id' => $load->uuid,
            'subjectName' => $load->course?->nombre ?? 'Materia Desconocida',
            'parcial' => $parcial,
            'title' => $task['nombre'],
            'status' => 'Pendiente',
            'desc' => $task['descripcion'] ?? 'Sin descripcion',
            'points' => ($task['puntos'] ?: 10) . ' puntos',
            'deadline' => $task['deadline'],
            'deadlineAt' => $task['deadlineAt'],
            'isOverdue' => $task['isOverdue'],
            'attachments' => $task['attachments'],
        ])->values()->all();

        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'tasks', [
            'loadId' => $load->uuid,
            'parcial' => $parcial,
            'tasks' => $realtimeTasks,
        ]));

        dispatch(function () use ($load) {
            try {
                \App\Services\GradeConsolidator::consolidateGroup($load->id);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Error al consolidar calificaciones: " . $e->getMessage());
            }
        })->afterResponse();

        return response()->json([
            'message' => 'Tareas guardadas',
            'tareas' => $updatedTasks
        ]);
    }

    /**
     * Suba archivos de material de apoyo (PDF, documentos) a Google Drive y devuelve la URL.
     */
    public function uploadTaskMaterial(Request $request, $uuid, GoogleDriveService $driveService)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,zip,rar|max:20480'
        ]);

        // `id` es bigint en PostgreSQL. Sólo debe compararse cuando el
        // identificador recibido es realmente numérico; los UUID alfanuméricos
        // provocaban un error SQL antes de iniciar la carga.
        $loadQuery = AcademicLoad::with(['academicPeriod', 'academicGroup', 'course'])
            ->where('uuid', $uuid);

        if (ctype_digit((string) $uuid)) {
            $loadQuery->orWhere('id', (int) $uuid);
        }

        $load = $this->obtenerCargaAutorizada($uuid)->load(['academicPeriod', 'academicGroup', 'course']);
        $file = $request->file('archivo');
        $fileName = $file->getClientOriginalName();
        $fullPath = $file->getRealPath();

        $googleDriveFileId = null;
        $googleDriveUrl = null;
        $url = null;

        try {
            // Intentar organizar en carpeta de la materia en Google Drive (optimizado con Cache 24h)
            $cacheKey = "drive_folder_materiales_load_{$load->id}";
            $materialesFolderId = \Illuminate\Support\Facades\Cache::remember($cacheKey, 86400, function () use ($driveService, $load) {
                $cicloNombre = $load->academicPeriod ? $load->academicPeriod->nombre : 'General';
                $grupoNombre = $load->academicGroup ? $load->academicGroup->nombre : 'Sin_Grupo';
                $materiaNombre = $load->course ? $load->course->nombre : 'Materia';

                $rootId = $driveService->findOrCreateFolder('Prepahid');
                $academicoFolderId = $driveService->findOrCreateFolder('Académico', $rootId);
                $cicloFolderId = $driveService->findOrCreateFolder($cicloNombre, $academicoFolderId);
                $grupoFolderId = $driveService->findOrCreateFolder($grupoNombre, $cicloFolderId);
                $materiaFolderId = $driveService->findOrCreateFolder($materiaNombre, $grupoFolderId);
                return $driveService->findOrCreateFolder('Materiales_de_Apoyo', $materiaFolderId);
            });

            $driveFile = $driveService->uploadFileToFolder($fullPath, "Material_" . $fileName, $materialesFolderId);
            $googleDriveFileId = $driveFile->getId();
            // La API no siempre devuelve webViewLink inmediatamente después de
            // crear el archivo. Construirlo con el ID garantiza un enlace usable.
            $googleDriveUrl = $driveFile->getWebViewLink()
                ?: "https://drive.google.com/file/d/{$googleDriveFileId}/view";
            $url = $googleDriveUrl;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Error subiendo material de apoyo a Drive: " . $e->getMessage());
            // Fallback local en almacenamiento público si Drive no estuviese vinculado
            $path = $file->store('materiales', 'public');
            $url = asset('storage/' . $path);
        }

        return response()->json([
            'name' => $fileName,
            'url' => $url ?: $googleDriveUrl,
            'google_drive_file_id' => $googleDriveFileId,
            'google_drive_url' => $googleDriveUrl,
            'type' => $file->getClientMimeType(),
            'size' => number_format($file->getSize() / 1024 / 1024, 2) . ' MB'
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

        $load = $this->obtenerCargaAutorizada($uuid);

        $task = Tarea::where('id', $request->tarea_id)
            ->where('carga_id', $load->id)
            ->firstOrFail();

        abort_unless(Enrollment::where('usuario_id', $request->usuario_id)
            ->where('grupo_id', $load->grupo_id)
            ->where('ciclo_id', $load->ciclo_id)
            ->where('estatus', 'active')
            ->exists(), 403, 'El alumno no pertenece a esta carga académica.');

        // 1. Guardar calificación
        $score = \App\Services\GradeService::formatGrade($request->calificacion);

        EntregaTarea::updateOrCreate(
            ['tarea_id' => $request->tarea_id, 'usuario_id' => $request->usuario_id],
            [
                'calificacion' => (string)$score,
                'status' => 'graded'
            ]
        );

        // 2. Consolidar promedios. El alumno ya recibe el cambio por el
        // canal académico en tiempo real; no se crea una notificación duplicada.
        $consolidatedGrade = \App\Models\Grade::withoutEvents(function () use ($request, $load) {
            return \App\Services\GradeConsolidator::consolidate($request->usuario_id, $load->id);
        });

        $this->clearStudentsCache($load);
        // La consolidación se ejecuta sin eventos para evitar emisiones internas
        // duplicadas. Emitimos una única actualización privada al alumno cuando
        // el docente devuelve oficialmente la calificación de la tarea.
        event(new \App\Events\GradeUpdated($consolidatedGrade, $task->id, (string) $score));
        event(new \App\Events\GroupDataUpdated($load->grupo_id, 'grades'));

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

        $load = $this->obtenerCargaAutorizada($uuid);
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

    private function clearStudentsCache(AcademicLoad $load, bool $clearSidebar = false)
    {
        $version = \Cache::get('student_cache_version', 1);
        \App\Services\GradeService::invalidateStudentCache();
        \Cache::increment("docente_class_version_{$load->uuid}");
        // Las claves de tareas y kardex incluyen versión. Incrementarla las
        // invalida sin recorrer cada alumno ni borrar archivos uno por uno.
        if (!$clearSidebar) return;

        \Cache::forget("group_loads_{$load->grupo_id}_{$load->ciclo_id}");
        $studentIds = Enrollment::where('grupo_id', $load->grupo_id)->where('estatus', 'active')->pluck('usuario_id');
        foreach ($studentIds as $id) {
            \Cache::forget("sidebar_alumno_{$id}");
            \Cache::forget("sidebar_alumno_{$id}_v{$version}");
        }
    }
}

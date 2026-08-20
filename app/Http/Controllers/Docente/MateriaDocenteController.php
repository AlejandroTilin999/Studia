<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;

use App\Models\AcademicLoad;
use App\Models\AdminAuditLog;
use App\Models\CriterioEvaluacion;
use App\Models\Grade;
use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Models\Enrollment;
use App\Models\Teacher;
use App\Events\GradeUpdated;
use App\Events\GroupDataUpdated;
use App\Services\AcademicPeriodService;
use App\Services\GoogleDriveService;
use App\Services\GradeConsolidator;
use App\Services\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
        $version = Cache::get("docente_class_version_{$uuid}", 1);
        $periodRevision = Cache::get('academic_period_revision', 1);
        $globalRevision = Cache::get('docente_class_revision_global', 1);

        return Cache::remember("full_class_data_{$uuid}_v{$version}_r{$periodRevision}_g{$globalRevision}", 300, function() use ($uuid) {
            $load = AcademicLoad::with(['academicPeriod', 'academicGroup', 'course', 'criterios', 'tareas.entregas'])
                ->where('uuid', $uuid)
                ->first();

            if (!$load) return null;

            $parciales = [1, 2, 3];
            $enrollments = Enrollment::where('grupo_id', $load->grupo_id)
                ->where('estatus', 'active')
                ->select('id', 'grupo_id', 'usuario_id', 'codigo_alumno', 'estatus')
                ->with('user:id,nombre,apellido_paterno,apellido_materno')
                ->get()
                ->unique('usuario_id')
                ->values();

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

                'parciales' => []
            ];

            // Indexar calificaciones en memoria O(1) con casteos seguros
            $gradesLookup = [];
            $consolidadoLookup = [];
            foreach ($allGrades as $g) {
                $uId = (int) $g->usuario_id;
                if ($g->criterio_id !== null) {
                    $cId = (int) $g->criterio_id;
                    $gradesLookup[$uId][$cId] = $g->calificacion;
                } else {
                    $consolidadoLookup[$uId] = $g;
                }
            }

            $freshPeriod = AcademicPeriodService::findCached($load->ciclo_id) ?: $load->academicPeriod;

            foreach ($parciales as $p) {
                $criteria = $load->criterios->where('parcial', $p)->values();

                $studentsData = [];
                foreach ($enrollments as $enrollment) {
                    $uId = (int) $enrollment->usuario_id;
                    $studentScores = [];

                    foreach ($criteria as $c) {
                        $rawScore = $gradesLookup[$uId][$c->id] ?? '';
                        $studentScores[$c->id] = ($rawScore !== '' && $rawScore !== null)
                            ? (string)GradeService::formatGrade($rawScore)
                            : '';
                    }

                    $consolidado = $consolidadoLookup[$uId] ?? null;

                    $studentsData[] = [
                        'id'             => $uId,
                        'nombre'         => $enrollment->user?->nombre_completo ?? 'Sin nombre',
                        'matricula'      => $enrollment->codigo_alumno ?? 'N/A',
                        'calificaciones' => $studentScores,
                        'consolidado'    => $consolidado ? [
                            'p1'      => GradeService::formatGrade($consolidado->p1),
                            'p2'      => GradeService::formatGrade($consolidado->p2),
                            'p3'      => GradeService::formatGrade($consolidado->p3),
                            'final'   => GradeService::formatGrade($consolidado->final),
                            'estatus' => $consolidado->estatus
                        ] : null
                    ];
                }

                $lockConfig = ['allowed' => false, 'reason' => 'Ciclo no definido'];
                $lockOperacion = ['allowed' => false, 'reason' => 'Ciclo no definido'];

                if ($freshPeriod) {
                    $lockConfig = AcademicPeriodService::isCapturaHabilitada($freshPeriod, $p, 'config', $load);
                    $lockOperacion = AcademicPeriodService::isCapturaHabilitada($freshPeriod, $p, 'operacion', $load);
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
                            $e->usuario_id => (string)GradeService::formatGrade($e->calificacion)
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
        
        $this->clearStudentsCache($load, true);

        event(new GroupDataUpdated($load->grupo_id, 'theme', [
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

        DB::transaction(function () use ($load, $parcial, $criteriaData) {
            CriterioEvaluacion::where('carga_id', $load->id)->where('parcial', $parcial)->delete();

            if (empty($criteriaData)) {
                $taskIds = Tarea::where('carga_id', $load->id)->where('parcial', $parcial)->pluck('id');
                EntregaTarea::whereIn('tarea_id', $taskIds)->delete();
                Tarea::whereIn('id', $taskIds)->delete();
            } else {
                foreach ($criteriaData as $c) {
                    CriterioEvaluacion::create([
                        'carga_id' => $load->id,
                        'parcial' => $parcial,
                        'nombre' => $c['nombre'],
                        'porcentaje' => $c['porcentaje'],
                        'sincronizar_tareas' => isset($c['sincronizar_tareas']) ? (bool)$c['sincronizar_tareas'] : false,
                    ]);
                }
            }
        });

        $this->clearStudentsCache($load);

        event(new GroupDataUpdated($load->grupo_id, 'grades'));

        $updatedCriteria = CriterioEvaluacion::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->get()
            ->map(fn($c) => [
                'id' => $c->id, 
                'nombre' => $c->nombre, 
                'porcentaje' => $c->porcentaje,
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

        GradeConsolidator::consolidateGroup($load->id);

        $this->clearStudentsCache($load);
        event(new GroupDataUpdated($load->grupo_id, 'grades'));
        
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

        DB::transaction(function () use ($load, $parcial, $tasksData, &$activeIds) {
            foreach ($tasksData as $taskItem) {
                $taskId = isset($taskItem['id']) && is_numeric($taskItem['id']) ? $taskItem['id'] : null;
                $rawFecha = $taskItem['fecha_entrega'] ?? null;
                $rawHora = trim((string) ($taskItem['hora_entrega'] ?? ''));
                $deadline = Tarea::parseDeadline($rawFecha, $rawHora);
                $fechaEntrega = $deadline?->format('Y-m-d H:i:s');
                $horaEntrega = $rawHora !== '' ? $deadline?->format('H:i:s') : null;

                $tareaExistente = $taskId
                    ? Tarea::where('carga_id', $load->id)->find($taskId)
                    : null;
                $nombreAnterior = $tareaExistente?->nombre;

                $attachments = isset($taskItem['attachments']) && is_array($taskItem['attachments']) 
                    ? $taskItem['attachments'] 
                    : ($taskItem['archivos'] ?? null);

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

                if ($tarea->drive_folder_id && $nombreAnterior && $nombreAnterior !== $taskItem['nombre']) {
                    try {
                        $driveService = app(GoogleDriveService::class);
                        $driveService->renameFolder($tarea->drive_folder_id, $taskItem['nombre']);
                    } catch (\Throwable $e) {
                        Log::error("Error al renombrar carpeta en Drive: " . $e->getMessage());
                    }
                }

                if (isset($taskItem['calificaciones']) && is_array($taskItem['calificaciones'])) {
                    foreach ($taskItem['calificaciones'] as $userId => $score) {
                        if (is_numeric($userId)) {
                            $finalScore = ($score !== null && $score !== '') ? (int)round(floatval($score)) : '';
                            
                            $entregaPrevia = EntregaTarea::where('tarea_id', $tarea->id)->where('usuario_id', $userId)->first();
                            $estatusActual = $entregaPrevia?->estatus ?? 'pending';
                            $hasSubmitted = in_array($estatusActual, ['submitted', 'graded', 'entregado', 'entregada']);
                            
                            if (!$hasSubmitted && $finalScore !== '') {
                                continue;
                            }

                            $nuevoEstatus = ($finalScore !== '') ? 'graded' : (($hasSubmitted) ? $estatusActual : 'pending');

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

            $tasksToDelete = Tarea::where('carga_id', $load->id)
                ->where('parcial', $parcial)
                ->whereNotIn('id', $activeIds)
                ->get();

            foreach ($tasksToDelete as $taskToDelete) {
                if ($taskToDelete->drive_folder_id) {
                    try {
                        $driveService = app(GoogleDriveService::class);
                        $driveService->deleteFile($taskToDelete->drive_folder_id);
                    } catch (\Throwable $e) {
                        Log::error("Error al eliminar carpeta en Drive: " . $e->getMessage());
                    }
                }
                $taskToDelete->deleteQuietly();
            }
        });

        $this->clearStudentsCache($load);

        $load->loadMissing('course');
        $updatedTasks = Tarea::where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->with('entregas')
            ->get()
            ->map(function (Tarea $t) {
                $deadlineAt = $t->deadlineAt();

                return [
                    'id' => $t->id, 
                    'nombre' => $t->nombre, 
                    'descripcion' => $t->descripcion,
                    'fecha_entrega' => $t->fecha_entrega,
                    'hora_entrega' => $t->hora_entrega ?: ($deadlineAt?->format('H:i:s') ?? ''),
                    'deadline' => $deadlineAt?->format('d/m/Y h:i A') ?? 'Sin fecha',
                    'deadlineAt' => $deadlineAt?->toIso8601String(),
                    'isOverdue' => $t->isOverdue(),
                    'puntos' => $t->puntos,
                    'attachments' => is_array($t->archivos) ? $t->archivos : (json_decode($t->archivos, true) ?: []),
                    'calificaciones' => $t->entregas->mapWithKeys(fn($e) => [
                        $e->usuario_id => (string)GradeService::formatGrade($e->calificacion)
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

        event(new GroupDataUpdated($load->grupo_id, 'tasks', [
            'loadId' => $load->uuid,
            'parcial' => $parcial,
            'tasks' => $realtimeTasks,
        ]));

        dispatch(function () use ($load) {
            try {
                GradeConsolidator::consolidateGroup($load->id);
            } catch (\Throwable $e) {
                Log::error("Error al consolidar calificaciones: " . $e->getMessage());
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

        $load = $this->obtenerCargaAutorizada($uuid)->load(['academicPeriod', 'academicGroup', 'course']);
        $file = $request->file('archivo');
        $fileName = $file->getClientOriginalName();
        $fullPath = $file->getRealPath();

        $googleDriveFileId = null;
        $googleDriveUrl = null;
        $url = null;

        $cacheKey = "drive_folder_materiales_load_{$load->id}";

        try {
            $getFolderId = function () use ($driveService, $load, $cacheKey) {
                return Cache::remember($cacheKey, 86400, function () use ($driveService, $load) {
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
            };

            $materialesFolderId = $getFolderId();

            try {
                $driveFile = $driveService->uploadFileToFolder($fullPath, "Material_" . $fileName, $materialesFolderId);
            } catch (\Throwable $uploadErr) {
                Cache::forget($cacheKey);
                $materialesFolderId = $getFolderId();
                $driveFile = $driveService->uploadFileToFolder($fullPath, "Material_" . $fileName, $materialesFolderId);
            }

            $googleDriveFileId = $driveFile->getId();
            $googleDriveUrl = $driveFile->getWebViewLink()
                ?: "https://drive.google.com/file/d/{$googleDriveFileId}/view";
            $url = $googleDriveUrl;
        } catch (\Throwable $e) {
            Cache::forget($cacheKey);
            Log::error("Error subiendo material de apoyo a Drive: " . $e->getMessage());
            
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

        $score = GradeService::formatGrade($request->calificacion);

        EntregaTarea::updateOrCreate(
            ['tarea_id' => $request->tarea_id, 'usuario_id' => $request->usuario_id],
            [
                'calificacion' => (string)$score,
                'estatus' => 'graded'
            ]
        );

        $consolidatedGrade = Grade::withoutEvents(function () use ($request, $load) {
            return GradeConsolidator::consolidate($request->usuario_id, $load->id);
        });

        $this->clearStudentsCache($load);

        event(new GradeUpdated($consolidatedGrade, $task->id, (string) $score));
        event(new GroupDataUpdated($load->grupo_id, 'grades'));

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

        AdminAuditLog::create([
            'usuario_id' => auth()->id(),
            'accion' => 'CONCLUIR_PARCIAL_DOCENTE',
            'descripcion' => "El docente concluyó oficialmente el Parcial {$parcial} para la materia {$load->course->nombre}.",
            'metadata' => ['carga_id' => $load->id, 'parcial' => $parcial]
        ]);

        $this->clearStudentsCache($load);

        return response()->json(['message' => "Parcial {$parcial} concluido con éxito."]);
    }

    /**
     * Elimina un archivo de material de apoyo en Google Drive de forma segura.
     */
    public function deleteTaskMaterial(Request $request, GoogleDriveService $driveService, $uuid)
    {
        $fileUrl = (string) $request->input('file_url');
        $driveFileId = (string) $request->input('google_drive_file_id');

        if (!$driveFileId && preg_match('#/d/([^/?]+)#', $fileUrl, $m)) {
            $driveFileId = $m[1];
        }

        if (!$driveFileId && preg_match('#[?&]id=([^&]+)#', $fileUrl, $m)) {
            $driveFileId = $m[1];
        }

        if (!$driveFileId && preg_match('#^[a-zA-Z0-9_-]{25,}$#', trim($fileUrl))) {
            $driveFileId = trim($fileUrl);
        }

        Log::info("BORRADO_MATERIAL_DRIVE: DriveID='{$driveFileId}', FileURL='{$fileUrl}'");

        $deleted = false;
        if (!empty($driveFileId)) {
            try {
                $deleted = $driveService->deleteFile($driveFileId);
                Log::info("RESULTADO_BORRADO_DRIVE: FileID='{$driveFileId}' status=" . ($deleted ? 'EXITOSO' : 'FALLIDO'));
            } catch (\Throwable $e) {
                Log::warning("ERROR_BORRADO_DRIVE: FileID='{$driveFileId}' msg=" . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Material eliminado de Google Drive con éxito',
            'drive_file_id' => $driveFileId,
            'deleted' => $deleted
        ]);
    }

    private function clearStudentsCache(AcademicLoad $load, bool $clearSidebar = false)
    {
        $version = Cache::get('student_cache_version', 1);
        GradeService::invalidateStudentCache();
        Cache::add("docente_class_version_{$load->uuid}", 1, now()->addDays(30));
        Cache::increment("docente_class_version_{$load->uuid}");
        Cache::add('docente_class_revision_global', 1, now()->addDays(30));
        Cache::increment('docente_class_revision_global');

        if (!$clearSidebar) return;

        Cache::forget("group_loads_{$load->grupo_id}_{$load->ciclo_id}");
        $studentIds = Enrollment::where('grupo_id', $load->grupo_id)->where('estatus', 'active')->pluck('usuario_id');
        foreach ($studentIds as $id) {
            Cache::forget("sidebar_alumno_{$id}");
            Cache::forget("sidebar_alumno_{$id}_v{$version}");
        }
    }
}
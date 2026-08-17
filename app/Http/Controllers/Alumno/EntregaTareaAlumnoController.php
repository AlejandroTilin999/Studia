<?php

namespace App\Http\Controllers\Alumno;

use App\Http\Controllers\Controller;

use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Models\Enrollment;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class EntregaTareaAlumnoController extends Controller
{
    private function ensureTaskIsOpen(Tarea $tarea)
    {
        if ($tarea->isOverdue()) {
            return response()->json([
                'error' => 'La fecha límite de esta actividad ya venció. Ya no es posible realizar una entrega.'
            ], 422);
        }

        return null;
    }

    private function getAuthorizedTask(int $taskId): Tarea
    {
        $task = Tarea::with(['academicLoad.academicPeriod', 'academicLoad.academicGroup', 'academicLoad.course'])
            ->findOrFail($taskId);

        $isEnrolled = $task->academicLoad && Enrollment::where('usuario_id', auth()->id())
            ->where('estatus', 'active')
            ->where('grupo_id', $task->academicLoad->grupo_id)
            ->where('ciclo_id', $task->academicLoad->ciclo_id)
            ->exists();

        abort_unless($isEnrolled, 403, 'No tienes acceso a esta tarea.');

        return $task;
    }

    private function invalidateStudentAcademicCache(int $userId, ?Tarea $tarea = null): void
    {
        Cache::add("student_cache_version_{$userId}", 1, now()->addDays(30));
        Cache::increment("student_cache_version_{$userId}");

        // La vista del docente usa una caché independiente de la del alumno.
        // Invalidarla antes de emitir el WebSocket garantiza que la consulta
        // silenciosa del docente ya incluya la entrega recién registrada.
        $loadUuid = $tarea?->academicLoad?->uuid;
        if ($loadUuid) {
            $key = "docente_class_version_{$loadUuid}";
            Cache::add($key, 1, now()->addDays(30));
            Cache::increment($key);
        }
    }

    /** @return string[] */
    private function obtenerIdsDriveDeEntrega(EntregaTarea $entrega): array
    {
        $files = json_decode($entrega->archivo_url, true);
        $ids = [];

        if (is_array($files)) {
            foreach ($files as $file) {
                if (is_array($file) && !empty($file['google_drive_file_id'])) {
                    $ids[] = (string) $file['google_drive_file_id'];
                }
            }
        }

        if (!empty($entrega->google_drive_file_id)) {
            $ids[] = (string) $entrega->google_drive_file_id;
        }

        return array_values(array_unique($ids));
    }

    private function eliminarArchivosDrive(array $fileIds, GoogleDriveService $driveService): bool
    {
        foreach ($fileIds as $fileId) {
            if (!$driveService->deleteFile($fileId)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Registra un archivo (subido a Google Drive) o enlace como entrega de tarea.
     */
    public function submitTask(Request $request, GoogleDriveService $driveService)
    {
        $request->validate([
            'tarea_id' => 'required|exists:tareas,id',
            'enlace'   => 'nullable|url',
            'archivo'  => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,zip,rar|max:20480', // Máx 20MB
            'nombre'   => 'nullable|string|max:255'
        ]);

        $userId = auth()->id();
        $tareaId = $request->tarea_id;
        $tarea = $this->getAuthorizedTask((int) $tareaId);
        if ($response = $this->ensureTaskIsOpen($tarea)) {
            return $response;
        }

        $googleDriveFileId = null;
        $googleDriveUrl = null;
        $url = $request->enlace;
        $fileName = $request->nombre ?? 'Documento de Entrega';

        // 1. Si viene un archivo físico, subir a Google Drive
        if ($request->hasFile('archivo')) {
            $file = $request->file('archivo');
            $fileName = $file->getClientOriginalName();
            $fullPath = $file->getRealPath();

            try {
                // Subir directamente a Google Drive en la jerarquía del curso
                $taskFolderId = $driveService->getOrCreateTaskFolder($tarea);

                $user = auth()->user();
                $studentPrefix = $user ? str_replace(' ', '_', $user->nombre_completo) : "Alumno_{$userId}";
                $driveFileName = "{$studentPrefix}_{$fileName}";

                $driveFile = $driveService->uploadFileToFolder($fullPath, $driveFileName, $taskFolderId);

                $googleDriveFileId = $driveFile->getId();
                // Drive puede omitir webViewLink justo después de crear el
                // archivo; el ID siempre permite construir un enlace válido.
                $googleDriveUrl = $driveFile->getWebViewLink()
                    ?: "https://drive.google.com/file/d/{$googleDriveFileId}/view";
                $url = $googleDriveUrl;
            } catch (\Exception $e) {
                Log::error("Google Drive Error: " . $e->getMessage());
                return response()->json(['error' => 'No se pudo subir a Google Drive. Asegúrate de haber vinculado la cuenta en /google/auth.'], 500);
            }
        }

        if (!$url) {
            $entregaExistente = EntregaTarea::where('tarea_id', $tareaId)->where('usuario_id', $userId)->first();
            if ($entregaExistente && !empty($entregaExistente->archivo_url)) {
                $entregaExistente->update([
                    'estatus' => 'submitted',
                    'updated_at' => now()
                ]);

                $this->invalidateStudentAcademicCache($userId, $tarea);
                $groupId = $tarea->academicLoad?->grupo_id;
                if ($groupId) {
                    try {
                        event(new \App\Events\GroupDataUpdated($groupId, 'submission'));
                    } catch (\Exception $ex) {}
                }

                return response()->json(['message' => 'Entrega confirmada con éxito']);
            }

            return response()->json(['error' => 'Debes adjuntar un archivo o proporcionar un enlace.'], 422);
        }

        try {
            Log::info("Registrando entrega de Tarea $tareaId para Alumno $userId");

            $entregaExistente = EntregaTarea::where('tarea_id', $tareaId)->where('usuario_id', $userId)->first();
            
            if ($entregaExistente && in_array($entregaExistente->estatus, ['submitted', 'graded'], true)) {
                return response()->json(['error' => 'No puedes modificar una tarea ya entregada o calificada.'], 403);
            }

            $listaArchivos = [];
            if ($entregaExistente && $entregaExistente->archivo_url) {
                $decoded = json_decode($entregaExistente->archivo_url, true);
                if (is_array($decoded)) {
                    $listaArchivos = $decoded;
                } else {
                    $listaArchivos[] = [
                        'url' => $entregaExistente->archivo_url,
                        'nombre' => $entregaExistente->archivo_nombre ?: 'Documento previo'
                    ];
                }
            }

            $listaArchivos[] = [
                'url' => $url,
                'nombre' => $fileName,
                'google_drive_file_id' => $googleDriveFileId,
                'google_drive_url' => $googleDriveUrl
            ];

            $entrega = EntregaTarea::updateOrCreate(
                ['tarea_id' => $tareaId, 'usuario_id' => $userId],
                [
                    'archivo_url'          => json_encode($listaArchivos),
                    'archivo_nombre'       => $fileName,
                    'google_drive_file_id' => $googleDriveFileId,
                    'google_drive_url'     => $googleDriveUrl,
                    'estatus'              => 'pending',
                    'updated_at'           => now()
                ]
            );

            $this->invalidateStudentAcademicCache($userId, $tarea);

            // Transmitir evento en tiempo real para que el docente vea el cambio instantáneamente
            $groupId = $tarea->academicLoad?->grupo_id;
            if ($groupId) {
                try {
                    Log::info("RT_BROADCAST: Emitiendo GroupDataUpdated para Grupo ID $groupId");
                    event(new \App\Events\GroupDataUpdated($groupId, 'submission'));
                } catch (\Exception $ex) {
                    Log::warning("No se pudo transmitir GroupDataUpdated: " . $ex->getMessage());
                }
            }

            return response()->json([
                'message'              => 'Tarea entregada con éxito',
                'url'                  => $url,
                'nombre'               => $fileName,
                'archivos'             => $listaArchivos,
                'google_drive_file_id' => $googleDriveFileId,
                'google_drive_url'     => $googleDriveUrl
            ]);

        } catch (\Exception $e) {
            Log::error("Error al registrar entrega: " . $e->getMessage());
            return response()->json(['error' => 'Error en el servidor al registrar la entrega.'], 500);
        }
    }

    /** Confirma una entrega después de que el alumno terminó de adjuntar archivos. */
    public function confirmSubmission(Request $request)
    {
        $request->validate(['tarea_id' => 'required|exists:tareas,id']);

        $userId = auth()->id();
        $tarea = $this->getAuthorizedTask((int) $request->tarea_id);
        if ($response = $this->ensureTaskIsOpen($tarea)) {
            return $response;
        }
        $entrega = EntregaTarea::where('tarea_id', $tarea->id)
            ->where('usuario_id', $userId)
            ->first();

        if (!$entrega || empty($entrega->archivo_url)) {
            return response()->json(['error' => 'Adjunta al menos un archivo o enlace antes de entregar.'], 422);
        }

        if ($entrega->estatus === 'graded') {
            return response()->json(['error' => 'No se puede modificar una tarea ya calificada.'], 403);
        }

        $entrega->update(['estatus' => 'submitted']);
        $this->invalidateStudentAcademicCache($userId, $tarea);

        if ($tarea->academicLoad?->grupo_id) {
            event(new \App\Events\GroupDataUpdated($tarea->academicLoad->grupo_id, 'submission'));
        }

        return response()->json(['message' => 'Tarea entregada con exito']);
    }

    /**
     * Anula una entrega previa (opcionalmente elimina de Google Drive).
     */
    public function cancelSubmission(Request $request, GoogleDriveService $driveService)
    {
        $request->validate(['tarea_id' => 'required|exists:tareas,id']);

        $userId = auth()->id();
        $tarea = $this->getAuthorizedTask((int) $request->tarea_id);

        $entrega = EntregaTarea::where('tarea_id', $request->tarea_id)
            ->where('usuario_id', $userId)
            ->first();

        if ($entrega && $entrega->estatus !== 'graded') {
            $fileIds = $this->obtenerIdsDriveDeEntrega($entrega);
            if (!$this->eliminarArchivosDrive($fileIds, $driveService)) {
                return response()->json([
                    'error' => 'No se pudo eliminar uno de los archivos en Google Drive. La entrega se conservó para que puedas reintentar sin perder información.'
                ], 502);
            }

            $entrega->delete();

            $this->invalidateStudentAcademicCache($userId, $tarea);
            $groupId = $tarea?->academicLoad?->grupo_id;
            if ($groupId) {
                try {
                    Log::info("RT_BROADCAST: Emitiendo GroupDataUpdated cancelacion para Grupo ID $groupId");
                    event(new \App\Events\GroupDataUpdated($groupId, 'submission'));
                } catch (\Exception $ex) {}
            }

            return response()->json(['message' => 'Entrega anulada con éxito']);
        }

        return response()->json(['error' => 'No se puede anular una tarea ya calificada.'], 403);
    }

    /**
     * Remueve un archivo específico de la lista de adjuntos de la entrega.
     */
    public function removeSingleFile(Request $request, GoogleDriveService $driveService)
    {
        $request->validate([
            'tarea_id'  => 'required|exists:tareas,id',
            'file_url'  => 'required|string'
        ]);

        $userId = auth()->id();
        $tareaId = $request->tarea_id;
        $fileUrl = $request->file_url;
        $tarea = $this->getAuthorizedTask((int) $tareaId);

        $entrega = EntregaTarea::where('tarea_id', $tareaId)
            ->where('usuario_id', $userId)
            ->first();

        if (!$entrega || $entrega->estatus === 'graded') {
            return response()->json(['error' => 'No se puede modificar una entrega ya calificada.'], 403);
        }

        $decoded = json_decode($entrega->archivo_url, true);
        $archivosActuales = [];
        if (is_array($decoded)) {
            $archivosActuales = $decoded;
        } else if (!empty($entrega->archivo_url)) {
            $archivosActuales = [[
                'url' => $entrega->archivo_url,
                'nombre' => $entrega->archivo_nombre ?: 'Documento'
            ]];
        }

        // Filtrar quitando el archivo objetivo (soporta URLs codificadas, exactas o por nombre de archivo)
        $targetBasename = basename(urldecode($fileUrl));

        $archivosFiltrados = array_values(array_filter($archivosActuales, function($item) use ($fileUrl, $targetBasename) {
            $itemUrl = is_array($item) ? ($item['url'] ?? '') : $item;
            $itemName = is_array($item) ? ($item['nombre'] ?? '') : '';

            $decodedItemUrl = urldecode($itemUrl);
            $decodedFileUrl = urldecode($fileUrl);
            $itemBasename = basename($decodedItemUrl);

            // Si coincide la URL completa, la URL decodificada, o el nombre de archivo del disco
            if ($itemUrl === $fileUrl || $decodedItemUrl === $decodedFileUrl) {
                return false;
            }
            if (!empty($targetBasename) && ($itemBasename === $targetBasename || urldecode($itemBasename) === $targetBasename)) {
                return false;
            }
            if (!empty($itemName) && ($itemName === $fileUrl || $itemName === $targetBasename || $itemName === urldecode($targetBasename))) {
                return false;
            }

            return true;
        }));

        $driveFileId = null;
        foreach ($archivosActuales as $item) {
            $itemUrl = is_array($item) ? ($item['url'] ?? '') : (string) $item;
            $itemId = is_array($item) ? ($item['google_drive_file_id'] ?? null) : null;
            $matchesUrl = $itemUrl === $fileUrl || urldecode($itemUrl) === urldecode($fileUrl);

            if ($matchesUrl) {
                $driveFileId = $itemId;
                if (!$driveFileId && preg_match('#/d/([^/]+)#', $itemUrl, $matches)) {
                    $driveFileId = $matches[1];
                }
                break;
            }
        }

        if ($driveFileId && !$driveService->deleteFile($driveFileId)) {
            return response()->json([
                'error' => 'No se pudo eliminar el archivo en Google Drive. La entrega se conservó para que puedas reintentar.'
            ], 502);
        }

        if (count($archivosFiltrados) === 0) {
            // Si ya no quedan archivos, eliminar el registro de la entrega por completo
            $entrega->delete();
        } else {
            $ultimoNombre = $archivosFiltrados[count($archivosFiltrados) - 1]['nombre'] ?? 'Documento';
            $entrega->update([
                'archivo_url' => json_encode($archivosFiltrados),
                'archivo_nombre' => $ultimoNombre
            ]);
        }

        // Si es archivo de la carpeta local, opcionalmente eliminarlo del disco
        if (str_contains($fileUrl, '/storage/entregas/')) {
            $pathInStorage = str_replace(asset('storage/'), '', $fileUrl);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($pathInStorage);
        }

        // Invalidar caché antes de avisar para que el docente reciba datos frescos.
        $this->invalidateStudentAcademicCache($userId, $tarea);

        // Transmitir cambio en tiempo real al docente
        $groupId = $tarea?->academicLoad?->grupo_id;
        if ($groupId) {
            try {
                event(new \App\Events\GroupDataUpdated($groupId, 'submission'));
            } catch (\Exception $ex) {}
        }

        return response()->json([
            'message' => 'Archivo eliminado con éxito',
            'archivos' => $archivosFiltrados
        ]);
    }
}

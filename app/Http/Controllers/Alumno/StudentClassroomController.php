<?php

namespace App\Http\Controllers\Alumno;

use App\Http\Controllers\Controller;

use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StudentClassroomController extends Controller
{
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
        $tarea = Tarea::with(['academicLoad.academicPeriod', 'academicLoad.academicGroup', 'academicLoad.course'])->findOrFail($tareaId);

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
                $googleDriveUrl = $driveFile->getWebViewLink();
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

                $groupId = $tarea->academicLoad?->grupo_id;
                if ($groupId) {
                    try {
                        event(new \App\Events\GroupDataUpdated($groupId));
                    } catch (\Exception $ex) {}
                }

                Cache::forget("student_tasks_{$userId}");
                return response()->json(['message' => 'Entrega confirmada con éxito']);
            }

            return response()->json(['error' => 'Debes adjuntar un archivo o proporcionar un enlace.'], 422);
        }

        try {
            Log::info("Registrando entrega de Tarea $tareaId para Alumno $userId");

            $entregaExistente = EntregaTarea::where('tarea_id', $tareaId)->where('usuario_id', $userId)->first();
            
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
                    'estatus'              => 'submitted',
                    'updated_at'           => now()
                ]
            );

            Cache::forget("student_tasks_{$userId}");

            // Transmitir evento en tiempo real para que el docente vea el cambio instantáneamente
            $groupId = $tarea->academicLoad?->grupo_id;
            if ($groupId) {
                try {
                    Log::info("RT_BROADCAST: Emitiendo GroupDataUpdated para Grupo ID $groupId");
                    event(new \App\Events\GroupDataUpdated($groupId));
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

    /**
     * Anula una entrega previa (opcionalmente elimina de Google Drive).
     */
    public function cancelSubmission(Request $request, GoogleDriveService $driveService)
    {
        $request->validate(['tarea_id' => 'required|exists:tareas,id']);

        $userId = auth()->id();

        $entrega = EntregaTarea::where('tarea_id', $request->tarea_id)
            ->where('usuario_id', $userId)
            ->first();

        if ($entrega && $entrega->estatus !== 'graded') {
            if ($entrega->google_drive_file_id) {
                try {
                    $driveService->deleteFile($entrega->google_drive_file_id);
                } catch (\Exception $e) {
                    // Si ya fue borrado en Drive, continuar
                }
            }

            $entrega->update([
                'estatus'              => 'pending',
                'google_drive_file_id' => null,
                'google_drive_url'     => null,
            ]);

            $tarea = Tarea::with('academicLoad')->find($request->tarea_id);
            $groupId = $tarea?->academicLoad?->grupo_id;
            if ($groupId) {
                try {
                    Log::info("RT_BROADCAST: Emitiendo GroupDataUpdated cancelacion para Grupo ID $groupId");
                    event(new \App\Events\GroupDataUpdated($groupId));
                } catch (\Exception $ex) {}
            }

            Cache::forget("student_tasks_{$userId}");
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

        // Identificar si el objeto removido cuenta con google_drive_file_id
        foreach ($archivosActuales as $item) {
            $itemUrl = is_array($item) ? ($item['url'] ?? '') : $item;
            $decodedItemUrl = urldecode($itemUrl);
            $decodedFileUrl = urldecode($fileUrl);

            if ($itemUrl === $fileUrl || $decodedItemUrl === $decodedFileUrl || (is_array($item) && ($item['nombre'] ?? '') === $fileUrl)) {
                if (is_array($item) && !empty($item['google_drive_file_id'])) {
                    try {
                        $driveService->deleteFile($item['google_drive_file_id']);
                    } catch (\Exception $ex) {}
                }
            }
        }

        // Si es archivo de la carpeta local, opcionalmente eliminarlo del disco
        if (str_contains($fileUrl, '/storage/entregas/')) {
            $pathInStorage = str_replace(asset('storage/'), '', $fileUrl);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($pathInStorage);
        }

        // Transmitir cambio en tiempo real al docente
        $tarea = Tarea::with('academicLoad')->find($tareaId);
        $groupId = $tarea?->academicLoad?->grupo_id;
        if ($groupId) {
            try {
                event(new \App\Events\GroupDataUpdated($groupId));
            } catch (\Exception $ex) {}
        }

        Cache::forget("student_tasks_{$userId}");

        return response()->json([
            'message' => 'Archivo eliminado con éxito',
            'archivos' => $archivosFiltrados
        ]);
    }
}


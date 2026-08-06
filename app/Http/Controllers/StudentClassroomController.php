<?php

namespace App\Http\Controllers;

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
                // Obtener o crear carpeta de la tarea en Drive
                $taskFolderId = $driveService->getOrCreateTaskFolder($tarea);

                // Nombre personalizado del archivo en Drive: NombreAlumno_NombreArchivo
                $user = auth()->user();
                $studentPrefix = $user ? str_replace(' ', '_', $user->nombre_completo) : "Alumno_{$userId}";
                $driveFileName = "{$studentPrefix}_{$fileName}";

                $driveFile = $driveService->uploadFileToFolder($fullPath, $driveFileName, $taskFolderId);

                $googleDriveFileId = $driveFile->getId();
                $googleDriveUrl = $driveFile->getWebViewLink();
                $url = $googleDriveUrl;
            } catch (\Exception $e) {
                Log::error("Error al subir tarea a Google Drive: " . $e->getMessage());
                return response()->json(['error' => 'Error al subir el archivo a Google Drive: ' . $e->getMessage()], 500);
            }
        }

        if (!$url) {
            return response()->json(['error' => 'Debes adjuntar un archivo o proporcionar un enlace.'], 422);
        }

        try {
            Log::info("Registrando entrega de Tarea $tareaId para Alumno $userId");

            $entrega = EntregaTarea::updateOrCreate(
                ['tarea_id' => $tareaId, 'usuario_id' => $userId],
                [
                    'archivo_url'          => $url,
                    'archivo_nombre'       => $fileName,
                    'google_drive_file_id' => $googleDriveFileId,
                    'google_drive_url'     => $googleDriveUrl,
                    'estatus'              => 'submitted',
                    'updated_at'           => now()
                ]
            );

            Cache::forget("student_tasks_{$userId}");

            return response()->json([
                'message'              => 'Tarea entregada con éxito en Google Drive',
                'url'                  => $url,
                'nombre'               => $fileName,
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

            Cache::forget("student_tasks_{$userId}");
            return response()->json(['message' => 'Entrega anulada con éxito']);
        }

        return response()->json(['error' => 'No se puede anular una tarea ya calificada.'], 403);
    }
}


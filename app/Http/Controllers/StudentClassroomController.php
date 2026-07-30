<?php

namespace App\Http\Controllers;

use App\Models\Tarea;
use App\Models\EntregaTarea;
use Illuminate\Http\Request;

class StudentClassroomController extends Controller
{
    /**
     * Registra un enlace de Google Drive (o cualquier nube) como entrega de tarea.
     */
    public function submitTask(Request $request)
    {
        $request->validate([
            'tarea_id' => 'required|integer',
            'enlace'   => 'required|url',
            'nombre'   => 'nullable|string|max:255'
        ]);

        $userId = auth()->id();
        $tareaId = $request->tarea_id;
        $url = $request->enlace;
        $name = $request->nombre ?? 'Documento de Entrega';

        try {
            \Log::info("Registrando entrega por Link para Alumno $userId - Tarea $tareaId");

            // Registrar en base de datos
            EntregaTarea::updateOrCreate(
                ['tarea_id' => $tareaId, 'usuario_id' => $userId],
                [
                    'archivo_url'    => $url,
                    'archivo_nombre' => $name,
                    'estatus'        => 'submitted',
                    'updated_at'     => now()
                ]
            );

            // Limpiar caché
            \Cache::forget("student_tasks_{$userId}");

            return response()->json([
                'message' => 'Tarea entregada con éxito',
                'url' => $url,
                'nombre' => $name
            ]);

        } catch (\Exception $e) {
            \Log::error("Error Fatal en Entrega por Link: " . $e->getMessage());
            return response()->json(['error' => 'Error en el servidor al registrar el enlace.'], 500);
        }
    }

    /**
     * Anula una entrega previa.
     */
    public function cancelSubmission(Request $request)
    {
        $request->validate(['tarea_id' => 'required|exists:tareas,id']);

        $userId = auth()->id();

        $entrega = EntregaTarea::where('tarea_id', $request->tarea_id)
            ->where('usuario_id', $userId)
            ->first();

        if ($entrega && $entrega->estatus !== 'graded') {
            $entrega->update([
                'estatus' => 'pending',
            ]);

            \Cache::forget("student_tasks_{$userId}");
            return response()->json(['message' => 'Entrega anulada']);
        }

        return response()->json(['error' => 'No se puede anular una tarea ya calificada.'], 403);
    }
}

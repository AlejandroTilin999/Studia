<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\{AcademicGroup, AcademicPeriod, AdminAuditLog, Enrollment, Student};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    /**
     * Procesa la promoción masiva de alumnos (Optimizado con Bulk Upsert en `inscripciones`)
     */
    public function promote(Request $request)
    {
        $request->validate([
            'grupo_origen_id' => 'required|exists:grupos,id',
            'grupo_destino_id' => 'required|exists:grupos,id',
            'ciclo_destino_id' => 'required|exists:ciclos_escolares,id',
            'alumnos_ids' => 'required|array',
            'marcar_egresados' => 'boolean'
        ]);

        $grupoOrigen = AcademicGroup::findOrFail($request->grupo_origen_id);
        $grupoDestino = AcademicGroup::findOrFail($request->grupo_destino_id);
        $cicloDestino = AcademicPeriod::findOrFail($request->ciclo_destino_id);

        // Validación de semestre
        if ($grupoDestino->semestre != ($grupoOrigen->semestre + 1) && !$request->marcar_egresados) {
            return response()->json([
                'error' => "Operación no permitida. El grupo destino debe pertenecer al semestre " . ($grupoOrigen->semestre + 1) . "."
            ], 422);
        }

        try {
            DB::transaction(function () use ($request, $grupoOrigen, $grupoDestino, $cicloDestino) {
                $status = $request->marcar_egresados ? 'graduated' : 'active';
                $alumnosIds = $request->alumnos_ids;

                // 1. Obtener matrículas actuales masivamente desde inscripciones
                $matriculas = Enrollment::whereIn('usuario_id', $alumnosIds)
                    ->pluck('codigo_alumno', 'usuario_id');

                // 2. Preparar datos para BULK UPSERT en la tabla `inscripciones`
                $dataToUpsert = [];
                $now = now();
                foreach ($alumnosIds as $userId) {
                    $dataToUpsert[] = [
                        'usuario_id'    => $userId,
                        'ciclo_id'      => $cicloDestino->id,
                        'grupo_id'      => $grupoDestino->id,
                        'estatus'       => $status,
                        'codigo_alumno' => $matriculas[$userId] ?? ('ALU-' . $userId),
                        'created_at'    => $now,
                        'updated_at'    => $now
                    ];
                }

                // 3. Inserción/Actualización masiva (Requiere índice único UNIQUE(usuario_id, ciclo_id))
                Enrollment::upsert(
                    $dataToUpsert, 
                    ['usuario_id', 'ciclo_id'], 
                    ['grupo_id', 'estatus', 'codigo_alumno', 'updated_at']
                );

                // 4. Actualización masiva de estatus en Students
                if ($request->marcar_egresados) {
                    Student::whereIn('usuario_id', $alumnosIds)->update([
                        'estatus' => 'graduated',
                        'folio_egreso' => DB::raw("CONCAT('FE-', EXTRACT(YEAR FROM CURRENT_DATE), '-', LPAD(usuario_id::text, 5, '0'))")
                    ]);
                }

                // 5. Auditoría
                AdminAuditLog::create([
                    'usuario_id' => auth()->id(),
                    'accion' => 'PROMOCION_GRUPAL',
                    'descripcion' => "Se promovieron " . count($alumnosIds) . " alumnos de {$grupoOrigen->nombre} a {$grupoDestino->nombre}.",
                    'metadata' => [
                        'origen' => $grupoOrigen->id, 
                        'destino' => $grupoDestino->id, 
                        'ciclo' => $cicloDestino->id, 
                        'cantidad' => count($alumnosIds)
                    ]
                ]);
            });

            return response()->json(['message' => 'Promoción procesada masivamente con éxito.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar: ' . $e->getMessage()], 500);
        }
    }
}
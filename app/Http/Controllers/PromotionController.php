<?php

namespace App\Http\Controllers;

use App\Models\AcademicGroup;
use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    /**
     * Procesa la promoción masiva de alumnos de un grupo a otro.
     */
    public function promote(Request $request)
    {
        $request->validate([
            'grupo_origen_id' => 'required|exists:grupos,id',
            'grupo_destino_id' => 'required|exists:grupos,id',
            'ciclo_destino_id' => 'required|exists:ciclos_escolares,id',
            'alumnos_ids' => 'required|array', // IDs de los usuarios (alumnos) a promover
            'marcar_egresados' => 'boolean'
        ]);

        $grupoOrigen = AcademicGroup::findOrFail($request->grupo_origen_id);
        $grupoDestino = AcademicGroup::findOrFail($request->grupo_destino_id);
        $cicloDestino = AcademicPeriod::findOrFail($request->ciclo_destino_id);

        // Regla de Negocio: Solo permitir N + 1
        if ($grupoDestino->semestre != ($grupoOrigen->semestre + 1) && !$request->marcar_egresados) {
            return response()->json([
                'error' => "Operación no permitida. El grupo destino debe pertenecer al semestre " . ($grupoOrigen->semestre + 1) . "."
            ], 422);
        }

        try {
            DB::transaction(function () use ($request, $grupoOrigen, $grupoDestino, $cicloDestino) {
                $status = $request->marcar_egresados ? 'graduated' : 'active';
                $count = 0;

                foreach ($request->alumnos_ids as $userId) {
                    // 1. Crear nueva inscripción en el ciclo/grupo destino
                    Enrollment::updateOrCreate(
                        [
                            'usuario_id' => $userId,
                            'ciclo_id' => $cicloDestino->id,
                        ],
                        [
                            'grupo_id' => $grupoDestino->id,
                            'estatus' => $status,
                            'codigo_alumno' => Enrollment::where('usuario_id', $userId)->value('codigo_alumno') // Mantener matrícula
                        ]
                    );

                    // 2. Si se marca como egresado, actualizar perfil de alumno
                    if ($request->marcar_egresados) {
                        \App\Models\Student::where('usuario_id', $userId)->update([
                            'estatus' => 'graduated',
                            'folio_egreso' => 'FE-' . date('Y') . '-' . str_pad($userId, 5, '0', STR_PAD_LEFT)
                        ]);
                    }
                    $count++;
                }

                // 3. Registrar en Auditoría
                AdminAuditLog::create([
                    'usuario_id' => auth()->id(),
                    'accion' => 'PROMOCION_GRUPAL',
                    'descripcion' => "Se promovieron {$count} alumnos del grupo {$grupoOrigen->nombre} al grupo {$grupoDestino->nombre} (" . ($request->marcar_egresados ? 'EGRESO' : 'AVANCE') . ").",
                    'metadata' => [
                        'origen' => $grupoOrigen->id,
                        'destino' => $grupoDestino->id,
                        'ciclo' => $cicloDestino->id,
                        'cantidad' => $count
                    ]
                ]);
            });

            return response()->json(['message' => 'Promoción procesada con éxito.']);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar la promoción: ' . $e->getMessage()], 500);
        }
    }
}

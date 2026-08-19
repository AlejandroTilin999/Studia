<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicGroup;
use App\Models\AcademicPeriod;
use App\Models\AdminAuditLog;
use App\Models\Enrollment;
use App\Models\Student;
use App\Services\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PromocionController extends Controller
{
    public function promote(Request $request)
    {
        $validated = $request->validate([
            'grupo_origen_id' => 'required|exists:grupos,id',
            'grupo_destino_id' => 'nullable|exists:grupos,id',
            'ciclo_origen_id' => 'required|exists:ciclos_escolares,id',
            'ciclo_destino_id' => 'nullable|exists:ciclos_escolares,id',
            'alumnos_ids' => 'required|array|min:1',
            'alumnos_ids.*' => 'integer|distinct',
            'marcar_egresados' => 'required|boolean',
        ]);

        $graduate = $request->boolean('marcar_egresados');
        $sourceGroup = AcademicGroup::findOrFail($validated['grupo_origen_id']);
        $sourcePeriod = AcademicPeriod::findOrFail($validated['ciclo_origen_id']);
        $targetPeriod = $graduate ? null : AcademicPeriod::findOrFail($validated['ciclo_destino_id'] ?? 0);
        $targetGroup = $graduate ? null : AcademicGroup::findOrFail($validated['grupo_destino_id'] ?? 0);

        $this->validateTransition($sourceGroup, $sourcePeriod, $targetGroup, $targetPeriod, $graduate);

        DB::transaction(function () use ($validated, $sourceGroup, $targetGroup, $targetPeriod, $graduate) {
            $studentIds = $validated['alumnos_ids'];
            $sourceEnrollments = Enrollment::query()
                ->where('grupo_id', $sourceGroup->id)
                ->where('ciclo_id', $validated['ciclo_origen_id'])
                ->where('estatus', 'active')
                ->whereIn('usuario_id', $studentIds)
                ->lockForUpdate()
                ->get(['id', 'usuario_id', 'codigo_alumno']);

            if ($sourceEnrollments->count() !== count($studentIds)) {
                throw ValidationException::withMessages([
                    'alumnos_ids' => 'Uno o más alumnos no tienen una inscripción activa en el grupo y ciclo de origen.',
                ]);
            }

            if ($graduate) {
                Student::whereIn('usuario_id', $studentIds)->update([
                    'estatus' => 'graduated',
                    'folio_egreso' => DB::raw("CONCAT('FE-', EXTRACT(YEAR FROM CURRENT_DATE), '-', LPAD(usuario_id::text, 5, '0'))"),
                ]);

                Enrollment::whereIn('id', $sourceEnrollments->pluck('id'))
                    ->update(['estatus' => 'graduated', 'updated_at' => now()]);

                $action = 'EGRESO_GRUPAL';
                $description = 'Se registró el egreso de ' . count($studentIds) . " alumno(s) del grupo {$sourceGroup->nombre}.";
                $metadata = ['origen' => $sourceGroup->id, 'ciclo_origen' => $validated['ciclo_origen_id'], 'cantidad' => count($studentIds)];
            } else {
                $codesByUser = $sourceEnrollments->pluck('codigo_alumno', 'usuario_id');
                $now = now();
                $newEnrollments = collect($studentIds)->map(fn (int $userId) => [
                    'usuario_id' => $userId,
                    'ciclo_id' => $targetPeriod->id,
                    'grupo_id' => $targetGroup->id,
                    'estatus' => 'active',
                    'codigo_alumno' => $codesByUser[$userId],
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all();

                Enrollment::upsert(
                    $newEnrollments,
                    ['usuario_id', 'ciclo_id'],
                    ['grupo_id', 'estatus', 'codigo_alumno', 'updated_at'],
                );

                Enrollment::whereIn('id', $sourceEnrollments->pluck('id'))
                    ->update(['estatus' => 'promoted', 'updated_at' => now()]);

                $action = 'PROMOCION_GRUPAL';
                $description = 'Se promovieron ' . count($studentIds) . " alumno(s) de {$sourceGroup->nombre} a {$targetGroup->nombre}.";
                $metadata = [
                    'origen' => $sourceGroup->id,
                    'destino' => $targetGroup->id,
                    'ciclo_origen' => $validated['ciclo_origen_id'],
                    'ciclo_destino' => $targetPeriod->id,
                    'cantidad' => count($studentIds),
                ];
            }

            AdminAuditLog::create([
                'usuario_id' => auth()->id(),
                'accion' => $action,
                'descripcion' => $description,
                'metadata' => $metadata,
            ]);
        });

        GradeService::invalidateStudentCache();
        return response()->json(['message' => $graduate ? 'Egreso procesado correctamente.' : 'Promoción procesada correctamente.']);
    }

    private function validateTransition(
        AcademicGroup $sourceGroup,
        AcademicPeriod $sourcePeriod,
        ?AcademicGroup $targetGroup,
        ?AcademicPeriod $targetPeriod,
        bool $graduate,
    ): void {
        if (!in_array($sourcePeriod->status, [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_CLOSED], true)) {
            throw ValidationException::withMessages(['ciclo_origen_id' => 'Las promociones se resuelven sobre el ciclo vigente o recién concluido.']);
        }

        if ($graduate) {
            if ((int) $sourceGroup->semestre !== 6) {
                throw ValidationException::withMessages(['grupo_origen_id' => 'Solo los alumnos de sexto semestre pueden egresar.']);
            }
            return;
        }

        if (!$targetPeriod || !$targetGroup) {
            throw ValidationException::withMessages(['promocion' => 'Debes seleccionar un ciclo y grupo destino.']);
        }

        if (!in_array($targetPeriod->status, [AcademicPeriod::STATUS_PLANNING, AcademicPeriod::STATUS_ACTIVE], true)
            || $targetPeriod->id === $sourcePeriod->id
            || $targetPeriod->fecha_inicio <= $sourcePeriod->fecha_inicio) {
            throw ValidationException::withMessages(['ciclo_destino_id' => 'El destino debe ser un ciclo posterior, activo o en planificación.']);
        }

        $sameRoute = $targetGroup->generacion === $sourceGroup->generacion
            && $targetGroup->especialidad === $sourceGroup->especialidad
            && $targetGroup->seccion === $sourceGroup->seccion
            && (int) $targetGroup->semestre === ((int) $sourceGroup->semestre + 1);

        if (!$sameRoute) {
            throw ValidationException::withMessages(['grupo_destino_id' => 'El destino debe ser la misma generación, especialidad y sección, en el semestre inmediato superior.']);
        }
    }
}

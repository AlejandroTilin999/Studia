<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use Illuminate\Validation\ValidationException;

class SemesterLifecycleService
{
    /** An active enrollment must be promoted, repeated, withdrawn, transferred, or graduated. */
    public function unresolvedEnrollments(AcademicPeriod $period): int
    {
        return Enrollment::query()
            ->where('ciclo_id', $period->id)
            ->where('estatus', 'active')
            ->count();
    }

    public function ensurePeriodCanClose(AcademicPeriod $period): void
    {
        $pending = $this->unresolvedEnrollments($period);

        if ($pending > 0) {
            throw ValidationException::withMessages([
                'ciclo' => "No puedes concluir el ciclo {$period->nombre}: quedan {$pending} alumno(s) sin promoción, repetición, baja, traslado o egreso.",
            ]);
        }
    }

    public function ensureNextPeriodCanBePrepared(): void
    {
        $activePeriod = AcademicPeriod::query()
            ->where('status', AcademicPeriod::STATUS_ACTIVE)
            ->orderByDesc('fecha_inicio')
            ->first();

        if ($activePeriod) {
            $this->ensurePeriodCanClose($activePeriod);
        }

        if (AcademicPeriod::where('status', AcademicPeriod::STATUS_PLANNING)->exists()) {
            throw ValidationException::withMessages([
                'ciclo' => 'Ya existe un ciclo en planificación. Configúralo o actívalo antes de abrir otro.',
            ]);
        }
    }

    public function activate(AcademicPeriod $target): void
    {
        $activePeriod = AcademicPeriod::query()
            ->where('status', AcademicPeriod::STATUS_ACTIVE)
            ->whereKeyNot($target->id)
            ->lockForUpdate()
            ->first();

        if ($activePeriod) {
            $this->ensurePeriodCanClose($activePeriod);
            $activePeriod->update([
                'status' => AcademicPeriod::STATUS_CLOSED,
                'activo' => false,
                'p1_activo' => false,
                'p2_activo' => false,
                'p3_activo' => false,
            ]);
        }

        if ($target->status === AcademicPeriod::STATUS_CLOSED) {
            throw ValidationException::withMessages([
                'ciclo' => 'No se puede activar un ciclo concluido.',
            ]);
        }

        $target->update([
            'status' => AcademicPeriod::STATUS_ACTIVE,
            'activo' => true,
        ]);
    }
}

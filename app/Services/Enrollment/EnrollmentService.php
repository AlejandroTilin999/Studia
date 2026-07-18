<?php

namespace App\Services\Enrollment;

use App\Models\Enrollment;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class EnrollmentService
{
    /**
     * Registra un alumno en un ciclo escolar y genera su cargo financiero.
     */
    public function registerStudentInCycle(int $userId, int $periodId, float $tuitionFee)
    {
        return DB::transaction(function () use ($userId, $periodId, $tuitionFee) {

            $enrollment = Enrollment::create([
                'usuario_id' => $userId,
                'ciclo_id'   => $periodId,
                'estatus'    => 'active'
            ]);

            if ($tuitionFee > 0) {
                Invoice::create([
                    'usuario_id' => $userId,
                    'concepto'   => 'Inscripción Ciclo Escolar',
                    'monto'      => $tuitionFee,
                    'estatus'    => 'pending'
                ]);
            }

            return $enrollment;
        });
    }
}

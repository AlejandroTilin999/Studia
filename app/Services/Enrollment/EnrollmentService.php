<?php

namespace App\Services\Enrollment;

use App\Models\Enrollment;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class EnrollmentService
{
    /**
     * Registra un alumno en un ciclo escolar y genera automáticamente su cargo financiero.
     */
    public function registerStudentInCycle(int $userId, int $periodId, float $tuitionFee)
    {
        // Usamos una transacción de base de datos para asegurar consistencia en Supabase.
        // Si la inscripción pasa pero el cobro falla, todo se revierte automáticamente.
        return DB::transaction(function () use ($userId, $periodId, $tuitionFee) {
            
            // 1. Crear el registro de inscripción académica
            $enrollment = Enrollment::create([
                'user_id' => $userId,
                'academic_period_id' => $periodId,
                'status' => 'active'
            ]);

            // 2. Vincular con finanzas generando su cuenta por pagar (Inscripción / Matrícula)
            if ($tuitionFee > 0) {
                Invoice::create([
                    'user_id' => $userId,
                    'concept' => 'Inscripción Ciclo Escolar',
                    'amount' => $tuitionFee,
                    'status' => 'pending'
                ]);
            }

            return $enrollment;
        });
    }
}
<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use Carbon\Carbon;

class AcademicPeriodService
{
    /**
     * Valida si la captura de calificaciones o tareas está habilitada para un parcial específico.
     * Basado en las 4 reglas de oro definidas en el plan de arquitectura.
     *
     * @param AcademicPeriod $period El ciclo escolar actual
     * @param int $parcial El número de parcial (1, 2, 3)
     * @return array ['allowed' => boolean, 'reason' => string]
     */
    public static function isCapturaHabilitada(AcademicPeriod $period, $parcial)
    {
        // 1. Ciclo escolar debe estar activo
        if (!$period->activo) {
            return [
                'allowed' => false,
                'reason' => 'El ciclo escolar se encuentra cerrado/concluido.'
            ];
        }

        $now = Carbon::now();
        $prefix = "p{$parcial}";

        $inicio = $period->{"{$prefix}_inicio"};
        $fin = $period->{"{$prefix}_fin"};
        $switchActivo = (bool)$period->{"{$prefix}_activo"};

        // 2. Validación de Switch Manual del Admin (Prioridad alta para excepciones)
        if (!$switchActivo) {
            return [
                'allowed' => false,
                'reason' => "El Parcial {$parcial} ha sido cerrado manualmente por la administración."
            ];
        }

        // 3. Validación de Rango de Fechas
        if ($inicio && $now->lt($inicio)) {
            return [
                'allowed' => false,
                'reason' => "El periodo de captura para el Parcial {$parcial} inicia el " . $inicio->format('d/m/Y') . "."
            ];
        }

        if ($fin && $now->gt($fin)) {
            return [
                'allowed' => false,
                'reason' => "El periodo de captura para el Parcial {$parcial} concluyó el " . $fin->format('d/m/Y') . "."
            ];
        }

        return [
            'allowed' => true,
            'reason' => 'Captura habilitada.'
        ];
    }
}

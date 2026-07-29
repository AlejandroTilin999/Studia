<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use Carbon\Carbon;

class AcademicPeriodService
{
    /**
     * Valida si la captura de calificaciones o tareas está habilitada para un parcial específico.
     * SOPORTA DOS MODOS:
     * - 'config': Para definir criterios. Permitido en Planeación y Activo.
     * - 'operacion': Para subir notas. Solo permitido en Activo.
     *
     * @param AcademicPeriod $period El ciclo escolar actual
     * @param int $parcial El número de parcial (1, 2, 3)
     * @param string $tipo El tipo de acción ('config' o 'operacion')
     * @return array ['allowed' => boolean, 'reason' => string]
     */
    public static function isCapturaHabilitada(AcademicPeriod $period, $parcial, $tipo = 'operacion')
    {
        // 1. Validación de Estado de Ciclo
        if ($tipo === 'config') {
            // Permitido si el ciclo está en Planificación o Activo
            if (!in_array($period->status, [AcademicPeriod::STATUS_PLANNING, AcademicPeriod::STATUS_ACTIVE])) {
                return [
                    'allowed' => false,
                    'reason' => 'El ciclo escolar se encuentra cerrado. No se pueden modificar criterios.'
                ];
            }

            // En modo 'config', si el ciclo está listo para operar, no aplicamos restricciones de fechas todavía
            return [
                'allowed' => true,
                'reason' => 'Configuración habilitada.'
            ];
        }

        // --- LÓGICA DE OPERACIÓN (Notas / Tareas) ---

        // 1. El ciclo DEBE ser el vigente (activo)
        if ($period->status !== AcademicPeriod::STATUS_ACTIVE) {
            $msg = ($period->status === AcademicPeriod::STATUS_PLANNING)
                ? 'El ciclo escolar aún se encuentra en fase de Planeación. La captura de notas se habilitará al iniciar clases.'
                : 'El ciclo escolar se encuentra concluido / cerrado.';
            return [
                'allowed' => false,
                'reason' => $msg
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

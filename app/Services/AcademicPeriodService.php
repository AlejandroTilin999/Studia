<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class AcademicPeriodService
{
    /** Obtiene el ciclo operativo sin repetir la misma consulta en cada vista. */
    public static function workingPeriod(?int $selectedCycleId = null): ?AcademicPeriod
    {
        if ($selectedCycleId) {
            return AcademicPeriod::find($selectedCycleId);
        }

        return Cache::remember('academic-period:working', now()->addSeconds(15), function () {
            return AcademicPeriod::query()
                ->whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])
                ->orderByRaw("CASE WHEN status = ? THEN 0 ELSE 1 END", [AcademicPeriod::STATUS_ACTIVE])
                ->orderByDesc('fecha_inicio')
                ->first();
        });
    }

    public static function clearWorkingPeriodCache(): void
    {
        Cache::forget('academic-period:working');
    }

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
    public static function isCapturaHabilitada(AcademicPeriod $period, $parcial, $tipo = 'operacion', $load = null)
    {
        // 1. Validación de Estado de Ciclo
        if ($period->status !== AcademicPeriod::STATUS_ACTIVE && $period->status !== AcademicPeriod::STATUS_PLANNING) {
            return [
                'allowed' => false,
                'reason' => 'El ciclo escolar se encuentra concluido / cerrado.'
            ];
        }

        $prefix = "p{$parcial}";
        $switchActivo = $period->{"{$prefix}_activo"};

        // 2. Validación Pura del Switch del Admin: Si el Admin lo tiene en false, se bloquea.
        $isAllowed = ($switchActivo === null) ? true : (bool)$switchActivo;

        if (!$isAllowed) {
            return [
                'allowed' => false,
                'reason' => "El Parcial {$parcial} se encuentra bloqueado por la administración."
            ];
        }

        return [
            'allowed' => true,
            'reason' => 'Habilitado.'
        ];
    }
}

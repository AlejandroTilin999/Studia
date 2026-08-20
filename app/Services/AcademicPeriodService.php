<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use Illuminate\Support\Facades\Cache;

class AcademicPeriodService
{
    /*
    |--------------------------------------------------------------------------
    | Cache keys
    |--------------------------------------------------------------------------
    */

    private const WORKING_PERIOD_CACHE_KEY = 'academic-period:working';

    private const ACTIVE_PERIOD_CACHE_KEY = 'academic-period:active';

    /*
    |--------------------------------------------------------------------------
    | TTL
    |--------------------------------------------------------------------------
    |
    | Los ciclos escolares cambian muy poco.
    |
    | Usamos una hora como protección, pero normalmente el dato se
    | actualiza inmediatamente porque CicloEscolarController invalida
    | estas claves cuando se modifica un ciclo.
    |
    */

    private const CACHE_TTL_SECONDS = 3600;

    /**
     * Obtiene el ciclo operativo.
     *
     * Prioridad:
     * 1. ACTIVE
     * 2. PLANNING
     *
     * Si se proporciona un ID específico, obtiene ese ciclo utilizando
     * su caché individual.
     */
    public static function workingPeriod(
        ?int $selectedCycleId = null
    ): ?AcademicPeriod {
        if ($selectedCycleId !== null) {
            return self::findCached($selectedCycleId);
        }

        return Cache::remember(
            self::WORKING_PERIOD_CACHE_KEY,
            self::CACHE_TTL_SECONDS,
            static function (): ?AcademicPeriod {
                return AcademicPeriod::query()
                    ->whereIn('status', [
                        AcademicPeriod::STATUS_ACTIVE,
                        AcademicPeriod::STATUS_PLANNING,
                    ])
                    ->orderByRaw(
                        'CASE WHEN status = ? THEN 0 ELSE 1 END',
                        [
                            AcademicPeriod::STATUS_ACTIVE,
                        ]
                    )
                    ->orderByDesc('fecha_inicio')
                    ->first();
            }
        );
    }

    /**
     * Obtiene exclusivamente el ciclo realmente ACTIVO.
     *
     * Este método debe utilizarse en:
     *
     * - Alumno
     * - Docente
     * - Middleware global
     *
     * cuando la aplicación necesita saber si existe un ciclo activo.
     */
    public static function activePeriod(): ?AcademicPeriod
    {
        return Cache::remember(
            self::ACTIVE_PERIOD_CACHE_KEY,
            self::CACHE_TTL_SECONDS,
            static function (): ?AcademicPeriod {
                return AcademicPeriod::query()
                    ->where(
                        'status',
                        AcademicPeriod::STATUS_ACTIVE
                    )
                    ->where('activo', true)
                    ->first();
            }
        );
    }

    /**
     * Obtiene un ciclo específico utilizando caché.
     *
     * Útil cuando distintas vistas solicitan repetidamente el mismo ciclo.
     */
    public static function findCached(
        int $id
    ): ?AcademicPeriod {
        return Cache::remember(
            self::periodCacheKey($id),
            self::CACHE_TTL_SECONDS,
            static fn (): ?AcademicPeriod =>
                AcademicPeriod::find($id)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Invalidación de caché
    |--------------------------------------------------------------------------
    */

    /**
     * Invalida el ciclo operativo.
     */
    public static function clearWorkingPeriodCache(): void
    {
        Cache::forget(
            self::WORKING_PERIOD_CACHE_KEY
        );
    }

    /**
     * Invalida el ciclo activo.
     */
    public static function clearActivePeriodCache(): void
    {
        Cache::forget(
            self::ACTIVE_PERIOD_CACHE_KEY
        );
    }

    /**
     * Invalida un ciclo específico.
     */
    public static function clearPeriodCache(
        int $id
    ): void {
        Cache::forget(
            self::periodCacheKey($id)
        );
    }

    /**
     * Invalida todas las cachés que podrían verse afectadas
     * después de modificar un ciclo.
     *
     * Debe ejecutarse después de:
     *
     * - editar ciclo;
     * - activar ciclo;
     * - cerrar ciclo;
     * - modificar un parcial.
     */
    public static function invalidatePeriod(
        int $id
    ): void {
        self::clearPeriodCache($id);

        self::clearWorkingPeriodCache();

        self::clearActivePeriodCache();

        Cache::add('academic_period_revision', 1, now()->addDays(30));
        Cache::increment('academic_period_revision');
    }

    /**
     * Invalida las cachés globales relacionadas con ciclos.
     *
     * Útil cuando se crea un ciclo nuevo y todavía no existía
     * una caché individual asociada.
     */
    public static function invalidateGlobalCaches(): void
    {
        self::clearWorkingPeriodCache();

        self::clearActivePeriodCache();

        Cache::add('academic_period_revision', 1, now()->addDays(30));
        Cache::increment('academic_period_revision');
    }

    /**
     * Construye la clave de caché de un ciclo individual.
     */
    private static function periodCacheKey(
        int $id
    ): string {
        return "academic-period:{$id}";
    }

    /*
    |--------------------------------------------------------------------------
    | Captura de parciales
    |--------------------------------------------------------------------------
    */

    /**
     * Determina si un parcial permite captura.
     *
     * $tipo y $load permanecen para conservar compatibilidad
     * con las llamadas existentes del proyecto.
     *
     * @return array{
     *     allowed: bool,
     *     reason: string
     * }
     */
    public static function isCapturaHabilitada(
        AcademicPeriod $period,
        int $parcial,
        string $tipo = 'operacion',
        mixed $load = null
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Validar parcial
        |--------------------------------------------------------------------------
        */

        if (
            $parcial < 1 ||
            $parcial > 3
        ) {
            return [
                'allowed' => false,
                'reason' => 'El parcial especificado no es válido.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Validar estado del ciclo
        |--------------------------------------------------------------------------
        */

        if (
            $period->status !== AcademicPeriod::STATUS_ACTIVE &&
            $period->status !== AcademicPeriod::STATUS_PLANNING
        ) {
            return [
                'allowed' => false,
                'reason' =>
                    'El ciclo escolar se encuentra concluido / cerrado.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Campo correspondiente al parcial
        |--------------------------------------------------------------------------
        |
        | p1_activo
        | p2_activo
        | p3_activo
        |
        */

        $field = "p{$parcial}_activo";

        $switchActivo = $period->{$field};

        /*
        |--------------------------------------------------------------------------
        | Compatibilidad histórica
        |--------------------------------------------------------------------------
        |
        | Si está NULL se conserva el comportamiento anterior:
        | se considera habilitado.
        |
        */

        $isAllowed = $switchActivo === null
            ? true
            : (bool) $switchActivo;

        if (!$isAllowed) {
            return [
                'allowed' => false,
                'reason' =>
                    "El Parcial {$parcial} se encuentra bloqueado por la administración.",
            ];
        }

        return [
            'allowed' => true,
            'reason' => 'Habilitado.',
        ];
    }
}
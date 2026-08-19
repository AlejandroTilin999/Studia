<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use Illuminate\Validation\ValidationException;

class SemesterLifecycleService
{
    /**
     * Cuenta inscripciones activas pendientes de resolver
     * dentro de un ciclo.
     */
    public function unresolvedEnrollments(
        AcademicPeriod $period
    ): int {
        return Enrollment::query()
            ->where('ciclo_id', $period->id)
            ->where('estatus', 'active')
            ->count();
    }

    /**
     * Actualmente el flujo permite cerrar el ciclo directamente.
     *
     * Se conserva este método para mantener la regla de negocio
     * centralizada y poder agregar validaciones futuras aquí.
     */
    public function ensurePeriodCanClose(
        AcademicPeriod $period
    ): void {
        // Intencionalmente vacío por el flujo actual del sistema.
    }

    /**
     * Evita crear un nuevo ciclo si ya existe uno
     * en estado de planificación.
     */
    public function ensureNextPeriodCanBePrepared(): void
    {
        $planningExists = AcademicPeriod::query()
            ->where(
                'status',
                AcademicPeriod::STATUS_PLANNING
            )
            ->exists();

        if ($planningExists) {
            throw ValidationException::withMessages([
                'ciclo' =>
                    'Ya existe un ciclo en planificación. Configúralo o actívalo antes de abrir otro.',
            ]);
        }
    }

    /**
     * Activa un ciclo y garantiza que no exista otro ciclo operativo.
     *
     * IMPORTANTE:
     * Este método debe ejecutarse dentro de una transacción
     * desde el controlador.
     */
    public function activate(
        AcademicPeriod $target
    ): void {
        /*
        |--------------------------------------------------------------------------
        | 1. Cerrar solamente otros ciclos operativos
        |--------------------------------------------------------------------------
        |
        | Antes se hacía UPDATE a TODOS los ciclos distintos del target.
        |
        | Eso incluía ciclos históricos que ya estaban cerrados.
        |
        | Ahora solo tocamos ciclos que realmente pueden competir
        | con el ciclo seleccionado:
        |
        | - ACTIVE
        | - PLANNING
        |
        */
        AcademicPeriod::query()
            ->whereKeyNot($target->id)
            ->whereIn('status', [
                AcademicPeriod::STATUS_ACTIVE,
                AcademicPeriod::STATUS_PLANNING,
            ])
            ->update([
                'status' =>
                    AcademicPeriod::STATUS_CLOSED,

                'activo' => false,

                'p1_activo' => false,
                'p2_activo' => false,
                'p3_activo' => false,
            ]);

        /*
        |--------------------------------------------------------------------------
        | 2. Activar el target solamente si necesita cambios
        |--------------------------------------------------------------------------
        |
        | Evitamos:
        |
        | $target->update(...)
        |
        | cuando ya está exactamente en ese estado.
        |
        */
        $target->fill([
            'status' =>
                AcademicPeriod::STATUS_ACTIVE,

            'activo' => true,
        ]);

        if ($target->isDirty()) {
            $target->save();
        }
    }
}
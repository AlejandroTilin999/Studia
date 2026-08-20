<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\AdminAuditLog;
use App\Services\AcademicPeriodService;
use App\Services\GradeService;
use App\Services\SemesterLifecycleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CicloEscolarController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Invalidación de cachés
    |--------------------------------------------------------------------------
    */

    /**
     * Invalida catálogos de ciclos usados por módulos administrativos.
     *
     * Se usa cuando cambia la estructura del ciclo:
     * - crear
     * - editar
     * - activar
     * - cerrar
     */
    private function invalidateCycleCatalogCaches(): void
    {
        Cache::forget('admin_academic_periods_catalog');
        Cache::forget('admin_alumnos_cycles_catalog');
        Cache::forget('admin_docentes_cycles_catalog');
        Cache::add('admin:cargas:list:revision', 1, now()->addDays(30));
        Cache::increment('admin:cargas:list:revision');
    }

    /**
     * Invalida caché académica de alumnos.
     */
    private function invalidateStudentAcademicCaches(): void
    {
        GradeService::invalidateStudentCache();
    }

    /**
     * Invalidación completa después de cambios estructurales.
     */
    private function invalidateFullPeriodCaches(
        ?int $periodId = null
    ): void {
        if ($periodId !== null) {
            AcademicPeriodService::invalidatePeriod($periodId);
        } else {
            AcademicPeriodService::invalidateGlobalCaches();
        }

        $this->invalidateCycleCatalogCaches();
        $this->invalidateStudentAcademicCaches();
    }

    /**
     * Invalidación para cambios operativos menores.
     *
     * Ejemplo:
     * - abrir/cerrar parcial
     */
    private function invalidateOperationalPeriodCaches(
        int $periodId
    ): void {
        AcademicPeriodService::invalidatePeriod($periodId);

        /*
         * No borramos catálogos completos porque un toggle
         * de parcial no cambia la lista de ciclos.
         */
        $this->invalidateStudentAcademicCaches();
    }

    /*
    |--------------------------------------------------------------------------
    | Crear ciclo
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        SemesterLifecycleService $lifecycle
    ) {
        $validated = $request->validate(
            $this->rules()
        );

        $period = DB::transaction(
            function () use (
                $validated,
                $lifecycle
            ): AcademicPeriod {
                /*
                 * Evita crear otro ciclo si ya existe
                 * uno en planificación.
                 */
                $lifecycle->ensureNextPeriodCanBePrepared();

                $activateImmediately = (bool) (
                    $validated['activo'] ?? false
                );

                /*
                 * El ciclo siempre nace en planning.
                 */
                $data = $validated;

                $data['status'] =
                    AcademicPeriod::STATUS_PLANNING;

                $data['activo'] = false;

                $period = AcademicPeriod::create(
                    $data
                );

                /*
                 * Si el admin pidió activarlo inmediatamente.
                 */
                if ($activateImmediately) {
                    $lifecycle->activate($period);
                }

                /*
                 * Evitamos:
                 *
                 * $period->fresh()->status
                 *
                 * porque eso agrega otro SELECT remoto.
                 *
                 * Ya conocemos el estado final esperado.
                 */
                $finalStatus = $activateImmediately
                    ? AcademicPeriod::STATUS_ACTIVE
                    : AcademicPeriod::STATUS_PLANNING;

                AdminAuditLog::create([
                    'usuario_id' => auth()->id(),

                    'accion' => 'APERTURA_CICLO',

                    'descripcion' =>
                        "Se creó el ciclo semestral {$period->nombre}.",

                    'metadata' => [
                        'ciclo_id' => $period->id,
                        'status' => $finalStatus,
                    ],
                ]);

                return $period;
            }
        );

        /*
         * Invalidar después del COMMIT.
         */
        $this->invalidateFullPeriodCaches(
            $period->id
        );

        return redirect()
            ->back()
            ->with(
                'message',
                'Ciclo semestral creado correctamente.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Actualizar ciclo
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        int $id,
        SemesterLifecycleService $lifecycle
    ) {
        /*
         * Necesitamos el modelo para:
         * Rule::unique(...)->ignore(...)
         */
        $period = AcademicPeriod::findOrFail($id);

        $validated = $request->validate(
            $this->rules($period)
        );

        $changed = DB::transaction(
            function () use (
                $validated,
                $period,
                $lifecycle
            ): bool {
                $activate = (bool) (
                    $validated['activo'] ?? false
                );

                /*
                 * Nunca aceptamos status directamente
                 * desde el request.
                 */
                unset($validated['status']);

                /*
                |--------------------------------------------------------------------------
                | ACTIVAR
                |--------------------------------------------------------------------------
                */
                if (
                    $activate &&
                    $period->status !==
                        AcademicPeriod::STATUS_ACTIVE
                ) {
                    $lifecycle->activate($period);

                    /*
                     * Actualizamos también el objeto local para
                     * no necesitar refresh().
                     */
                    $period->status =
                        AcademicPeriod::STATUS_ACTIVE;

                    $period->activo = true;
                }

                /*
                |--------------------------------------------------------------------------
                | DESACTIVAR
                |--------------------------------------------------------------------------
                */
                if (
                    !$activate &&
                    $period->status ===
                        AcademicPeriod::STATUS_ACTIVE
                ) {
                    $lifecycle->ensurePeriodCanClose(
                        $period
                    );

                    $validated['status'] =
                        AcademicPeriod::STATUS_PLANNING;

                    $validated['activo'] = false;
                }

                /*
                |--------------------------------------------------------------------------
                | Evitar UPDATE innecesario
                |--------------------------------------------------------------------------
                */
                $period->fill($validated);

                if (!$period->isDirty()) {
                    return false;
                }

                $period->save();

                return true;
            }
        );

        /*
         * El lifecycle puede haber cambiado estado aunque
         * el fill final no haya detectado cambios adicionales.
         */
        AcademicPeriodService::invalidatePeriod($id);

        if ($changed) {
            $this->invalidateCycleCatalogCaches();
            $this->invalidateStudentAcademicCaches();
        }

        return redirect()
            ->back()
            ->with(
                'message',
                'Ciclo escolar actualizado correctamente.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Toggle parcial
    |--------------------------------------------------------------------------
    */

    public function toggleParcial(
        Request $request,
        int $id
    ) {
        $validated = $request->validate([
            'parcial' => [
                'required',
                'integer',
                'in:1,2,3',
            ],

            'activo' => [
                'required',
                'boolean',
            ],
        ]);

        $parcial = (int) $validated['parcial'];

        $activo = $request->boolean('activo');

        $field = "p{$parcial}_activo";

        $changed = DB::transaction(
            function () use (
                $id,
                $field,
                $activo,
                $parcial
            ): bool {
                $period =
                    AcademicPeriod::findOrFail($id);

                /*
                 * Valor actual normalizado.
                 */
                $currentValue =
                    $period->{$field} === null
                        ? null
                        : (bool) $period->{$field};

                $changed =
                    $currentValue !== $activo;

                /*
                 * Evitar UPDATE si ya tenía el mismo valor.
                 */
                if ($changed) {
                    $period->{$field} = $activo;

                    $period->save();
                }

                /*
                 * Conservamos auditoría.
                 */
                AdminAuditLog::create([
                    'usuario_id' => auth()->id(),

                    'accion' => 'TOGGLE_PARCIAL',

                    'descripcion' =>
                        "Se actualizó el Parcial {$parcial} del ciclo {$period->nombre}.",

                    'metadata' => [
                        'ciclo_id' => $period->id,
                        'parcial' => $parcial,
                        'activo' => $activo,
                        'nuevo_estado' =>
                            $activo
                                ? 'abierto'
                                : 'cerrado',
                        'changed' => $changed,
                    ],
                ]);

                return $changed;
            }
        );

        /*
         * Solo invalidamos si realmente hubo cambio.
         */
        if ($changed) {
            $this->invalidateOperationalPeriodCaches(
                $id
            );
        }

        return redirect()
            ->back()
            ->with(
                'message',
                'Estado del parcial actualizado.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Activar ciclo
    |--------------------------------------------------------------------------
    */

    public function activate(
        int $id,
        SemesterLifecycleService $lifecycle
    ) {
        DB::transaction(
            function () use (
                $id,
                $lifecycle
            ): void {
                $period =
                    AcademicPeriod::findOrFail($id);

                $lifecycle->activate($period);

                AdminAuditLog::create([
                    'usuario_id' => auth()->id(),

                    'accion' => 'ACTIVAR_CICLO',

                    'descripcion' =>
                        "Se activó el ciclo semestral {$period->nombre}.",

                    'metadata' => [
                        'ciclo_id' => $period->id,
                    ],
                ]);
            }
        );

        $this->invalidateFullPeriodCaches($id);

        return redirect()
            ->back()
            ->with(
                'message',
                'Ciclo escolar activado correctamente.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Cerrar ciclo
    |--------------------------------------------------------------------------
    */

    public function close(
        int $id,
        SemesterLifecycleService $lifecycle
    ) {
        DB::transaction(
            function () use (
                $id,
                $lifecycle
            ): void {
                $period =
                    AcademicPeriod::findOrFail($id);

                $lifecycle->ensurePeriodCanClose(
                    $period
                );

                /*
                |--------------------------------------------------------------------------
                | Cerrar solamente si existen cambios
                |--------------------------------------------------------------------------
                */
                $period->fill([
                    'status' =>
                        AcademicPeriod::STATUS_CLOSED,

                    'activo' => false,

                    'p1_activo' => false,
                    'p2_activo' => false,
                    'p3_activo' => false,
                ]);

                if ($period->isDirty()) {
                    $period->save();
                }

                /*
                 * Auditoría dentro de la misma transacción.
                 *
                 * Si falla cualquiera de las dos operaciones,
                 * se revierte todo.
                 */
                AdminAuditLog::create([
                    'usuario_id' => auth()->id(),

                    'accion' => 'CONCLUIR_CICLO',

                    'descripcion' =>
                        "Se concluyó el ciclo semestral {$period->nombre}.",

                    'metadata' => [
                        'ciclo_id' => $period->id,
                    ],
                ]);
            }
        );

        $this->invalidateFullPeriodCaches($id);

        return redirect()
            ->back()
            ->with(
                'message',
                'Ciclo escolar concluido y archivado.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Eliminar registro de auditoría
    |--------------------------------------------------------------------------
    */

    public function destroyLog(int $id)
    {
        /*
         * No necesitamos hidratar un modelo completo
         * solamente para eliminarlo.
         */
        $deleted = AdminAuditLog::query()
            ->whereKey($id)
            ->delete();

        abort_if(
            $deleted === 0,
            404
        );

        return redirect()
            ->back()
            ->with(
                'message',
                'Registro de actividad eliminado.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Reglas
    |--------------------------------------------------------------------------
    */

    private function rules(
        ?AcademicPeriod $period = null
    ): array {
        return [
            'nombre' => [
                'required',
                'string',
                'max:100',

                Rule::unique(
                    'ciclos_escolares',
                    'nombre'
                )->ignore(
                    $period?->id
                ),
            ],

            'fecha_inicio' => [
                'required',
                'date',
            ],

            'fecha_fin' => [
                'required',
                'date',
                'after:fecha_inicio',
            ],

            'activo' => [
                'boolean',
            ],

            'p1_inicio' => [
                'nullable',
                'date',
            ],

            'p1_fin' => [
                'nullable',
                'date',
                'after_or_equal:p1_inicio',
            ],

            'p1_activo' => [
                'boolean',
            ],

            'p2_inicio' => [
                'nullable',
                'date',
            ],

            'p2_fin' => [
                'nullable',
                'date',
                'after_or_equal:p2_inicio',
            ],

            'p2_activo' => [
                'boolean',
            ],

            'p3_inicio' => [
                'nullable',
                'date',
            ],

            'p3_fin' => [
                'nullable',
                'date',
                'after_or_equal:p3_inicio',
            ],

            'p3_activo' => [
                'boolean',
            ],
        ];
    }
}
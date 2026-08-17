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
    private function invalidateStudentCaches(): void
    {
        GradeService::invalidateStudentCache();
        AcademicPeriodService::clearWorkingPeriodCache();
        Cache::forget('admin_alumnos_cycles_catalog');
        Cache::forget('admin_docentes_cycles_catalog');
    }

    public function store(Request $request, SemesterLifecycleService $lifecycle)
    {
        $validated = $request->validate($this->rules());

        DB::transaction(function () use ($validated, $lifecycle) {
            // A new term cannot be prepared while another term is already in
            // planning, nor while the active term has active enrollments.
            $lifecycle->ensureNextPeriodCanBePrepared();

            $activateImmediately = (bool) ($validated['activo'] ?? false);
            $period = AcademicPeriod::create(array_merge($validated, [
                'status' => AcademicPeriod::STATUS_PLANNING,
                'activo' => false,
            ]));

            if ($activateImmediately) {
                $lifecycle->activate($period);
            }

            AdminAuditLog::create([
                'usuario_id' => auth()->id(),
                'accion' => 'APERTURA_CICLO',
                'descripcion' => "Se creó el ciclo semestral {$period->nombre}.",
                'metadata' => ['ciclo_id' => $period->id, 'status' => $period->fresh()->status],
            ]);
        });

        $this->invalidateStudentCaches();
        return redirect()->back()->with('message', 'Ciclo semestral creado correctamente.');
    }

    public function update(Request $request, int $id, SemesterLifecycleService $lifecycle)
    {
        $period = AcademicPeriod::findOrFail($id);
        $validated = $request->validate($this->rules($period));

        DB::transaction(function () use ($validated, $period, $lifecycle) {
            $activate = (bool) ($validated['activo'] ?? false);
            unset($validated['status']);

            if ($activate && $period->status !== AcademicPeriod::STATUS_ACTIVE) {
                $lifecycle->activate($period);
            }

            if (!$activate && $period->status === AcademicPeriod::STATUS_ACTIVE) {
                $lifecycle->ensurePeriodCanClose($period);
                $validated['status'] = AcademicPeriod::STATUS_PLANNING;
            }

            $period->update($validated);
        });

        $this->invalidateStudentCaches();
        return redirect()->back()->with('message', 'Ciclo escolar actualizado correctamente.');
    }

    public function toggleParcial(Request $request, int $id)
    {
        $request->validate(['parcial' => 'required|integer|in:1,2,3', 'activo' => 'required|boolean']);
        $period = AcademicPeriod::findOrFail($id);
        $field = "p{$request->integer('parcial')}_activo";
        $period->update([$field => $request->boolean('activo')]);

        AdminAuditLog::create([
            'usuario_id' => auth()->id(),
            'accion' => 'TOGGLE_PARCIAL',
            'descripcion' => "Se actualizó el Parcial {$request->integer('parcial')} del ciclo {$period->nombre}.",
            'metadata' => ['ciclo_id' => $period->id, 'parcial' => $request->integer('parcial')],
        ]);

        $this->invalidateStudentCaches();
        return redirect()->back()->with('message', 'Estado del parcial actualizado.');
    }

    public function activate(int $id, SemesterLifecycleService $lifecycle)
    {
        DB::transaction(function () use ($id, $lifecycle) {
            $period = AcademicPeriod::findOrFail($id);
            $lifecycle->activate($period);

            AdminAuditLog::create([
                'usuario_id' => auth()->id(),
                'accion' => 'ACTIVAR_CICLO',
                'descripcion' => "Se activó el ciclo semestral {$period->nombre}.",
                'metadata' => ['ciclo_id' => $period->id],
            ]);
        });

        $this->invalidateStudentCaches();
        return redirect()->back()->with('message', 'Ciclo escolar activado correctamente.');
    }

    public function close(int $id, SemesterLifecycleService $lifecycle)
    {
        $period = AcademicPeriod::findOrFail($id);
        $lifecycle->ensurePeriodCanClose($period);

        $period->update([
            'status' => AcademicPeriod::STATUS_CLOSED,
            'activo' => false,
            'p1_activo' => false,
            'p2_activo' => false,
            'p3_activo' => false,
        ]);

        AdminAuditLog::create([
            'usuario_id' => auth()->id(),
            'accion' => 'CONCLUIR_CICLO',
            'descripcion' => "Se concluyó el ciclo semestral {$period->nombre}.",
            'metadata' => ['ciclo_id' => $period->id],
        ]);

        $this->invalidateStudentCaches();
        return redirect()->back()->with('message', 'Ciclo escolar concluido y archivado.');
    }

    public function destroyLog(int $id)
    {
        AdminAuditLog::findOrFail($id)->delete();
        return redirect()->back()->with('message', 'Registro de actividad eliminado.');
    }

    private function rules(?AcademicPeriod $period = null): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100', Rule::unique('ciclos_escolares', 'nombre')->ignore($period?->id)],
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'activo' => 'boolean',
            'p1_inicio' => 'nullable|date',
            'p1_fin' => 'nullable|date|after_or_equal:p1_inicio',
            'p1_activo' => 'boolean',
            'p2_inicio' => 'nullable|date',
            'p2_fin' => 'nullable|date|after_or_equal:p2_inicio',
            'p2_activo' => 'boolean',
            'p3_inicio' => 'nullable|date',
            'p3_fin' => 'nullable|date|after_or_equal:p3_inicio',
            'p3_activo' => 'boolean',
        ];
    }
}

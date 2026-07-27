<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicPeriodController extends Controller
{
    /**
     * Crea un nuevo ciclo escolar.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'       => 'required|string|max:100',
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after:fecha_inicio',
            'activo'       => 'boolean',
            'p1_inicio'    => 'nullable|date',
            'p1_fin'       => 'nullable|date|after_or_equal:p1_inicio',
            'p1_activo'    => 'boolean',
            'p2_inicio'    => 'nullable|date',
            'p2_fin'       => 'nullable|date|after_or_equal:p2_inicio',
            'p2_activo'    => 'boolean',
            'p3_inicio'    => 'nullable|date',
            'p3_fin'       => 'nullable|date|after_or_equal:p3_inicio',
            'p3_activo'    => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $request) {
            if (isset($validated['activo']) && $validated['activo']) {
                AcademicPeriod::where('activo', true)->update(['activo' => false]);
            }

            $period = AcademicPeriod::create($validated);

            // Registrar en Auditoría
            \App\Models\AdminAuditLog::create([
                'usuario_id' => auth()->id(),
                'accion' => 'APERTURA_CICLO',
                'descripcion' => "Se realizó la apertura del ciclo escolar: {$period->nombre}.",
                'metadata' => ['ciclo_id' => $period->id]
            ]);
        });

        return redirect()->back()->with('message', 'Ciclo escolar creado con éxito.');
    }

    /**
     * Actualiza un ciclo escolar (fechas de parciales, etc.)
     */
    public function update(Request $request, $id)
    {
        $period = AcademicPeriod::findOrFail($id);

        $validated = $request->validate([
            'nombre'       => 'required|string|max:100',
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after:fecha_inicio',
            'p1_inicio'    => 'nullable|date',
            'p1_fin'       => 'nullable|date|after_or_equal:p1_inicio',
            'p2_inicio'    => 'nullable|date',
            'p2_fin'       => 'nullable|date|after_or_equal:p2_inicio',
            'p3_inicio'    => 'nullable|date',
            'p3_fin'       => 'nullable|date|after_or_equal:p3_inicio',
        ]);

        $period->update($validated);

        return redirect()->back()->with('message', 'Ciclo escolar actualizado.');
    }

    /**
     * Alterna el estado de un parcial (Switch Manual).
     */
    public function toggleParcial(Request $request, $id)
    {
        $request->validate([
            'parcial' => 'required|integer|in:1,2,3',
            'activo'  => 'required|boolean'
        ]);

        $period = AcademicPeriod::findOrFail($id);
        $field = "p{$request->parcial}_activo";

        $period->update([$field => $request->activo]);

        $status = $request->activo ? 'abierto' : 'cerrado';

        // Registrar en Auditoría
        \App\Models\AdminAuditLog::create([
            'usuario_id' => auth()->id(),
            'accion' => 'TOGGLE_PARCIAL',
            'descripcion' => "Se ha {$status} manualmente el Parcial {$request->parcial} para el ciclo {$period->nombre}.",
            'metadata' => ['ciclo_id' => $id, 'parcial' => $request->parcial, 'nuevo_estado' => $status]
        ]);

        return redirect()->back()->with('message', "Parcial {$request->parcial} {$status}.");
    }

    /**
     * Establece un ciclo escolar como activo/vigente.
     */
    public function activate($id)
    {
        DB::transaction(function () use ($id) {
            AcademicPeriod::where('activo', true)->update(['activo' => false]);
            $period = AcademicPeriod::findOrFail($id);
            $period->update(['activo' => true]);

            // Registrar en Auditoría
            \App\Models\AdminAuditLog::create([
                'usuario_id' => auth()->id(),
                'accion' => 'ACTIVAR_CICLO',
                'descripcion' => "Se activó el ciclo escolar: {$period->nombre}.",
                'metadata' => ['ciclo_id' => $id]
            ]);
        });

        return redirect()->back()->with('message', 'Ciclo escolar activado correctamente.');
    }

    /**
     * Cierra un ciclo escolar (lo marca como inactivo).
     */
    public function close($id)
    {
        $period = AcademicPeriod::findOrFail($id);
        $period->update([
            'activo' => false,
            'p1_activo' => false,
            'p2_activo' => false,
            'p3_activo' => false,
        ]);

        // Registrar en Auditoría
        \App\Models\AdminAuditLog::create([
            'usuario_id' => auth()->id(),
            'accion' => 'CONCLUIR_CICLO',
            'descripcion' => "Se concluyó formalmente el ciclo escolar: {$period->nombre}.",
            'metadata' => ['ciclo_id' => $id]
        ]);

        return redirect()->back()->with('message', 'Ciclo escolar concluido y periodos de captura cerrados.');
    }

    /**
     * Elimina un registro de auditoría.
     */
    public function destroyLog($id)
    {
        $log = \App\Models\AdminAuditLog::findOrFail($id);
        $log->delete();

        return redirect()->back()->with('message', 'Registro de actividad eliminado.');
    }
}

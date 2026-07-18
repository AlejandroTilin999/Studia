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
            'activo'       => 'boolean'
        ]);

        DB::transaction(function () use ($validated) {
            // Si se marca como activo, desactivar los demás
            if ($validated['activo']) {
                AcademicPeriod::where('activo', true)->update(['activo' => false]);
            }

            AcademicPeriod::create([
                'nombre'       => $validated['nombre'],
                'fecha_inicio' => $validated['fecha_inicio'],
                'fecha_fin'    => $validated['fecha_fin'],
                'activo'       => $validated['activo']
            ]);
        });

        return redirect()->back()->with('message', 'Ciclo escolar creado con éxito.');
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
        });

        return redirect()->back()->with('message', 'Ciclo escolar activado correctamente.');
    }

    /**
     * Cierra un ciclo escolar (lo marca como inactivo).
     */
    public function close($id)
    {
        $period = AcademicPeriod::findOrFail($id);
        $period->update(['activo' => false]);

        return redirect()->back()->with('message', 'Ciclo escolar concluido.');
    }
}

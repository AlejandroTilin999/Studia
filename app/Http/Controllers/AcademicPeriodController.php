<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicPeriodController extends Controller
{
    /**
     * Crear un nuevo ciclo escolar (Academic Period)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255|unique:academic_periods,name',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'is_active'  => 'required|boolean',
        ]);

        DB::transaction(function () use ($validated) {
            // Si el nuevo ciclo se crea como activo, desactivamos todos los demás ciclos
            if ($validated['is_active']) {
                AcademicPeriod::query()->update(['is_active' => false]);
            }

            AcademicPeriod::create([
                'name'       => $validated['name'],
                'start_date' => $validated['start_date'],
                'end_date'   => $validated['end_date'],
                'is_active'  => $validated['is_active'],
            ]);
        });

        return redirect()->back();
    }

    /**
     * Activar un ciclo escolar específico (y desactivar los demás)
     */
    public function activate(Request $request, $id)
    {
        $period = AcademicPeriod::findOrFail($id);

        DB::transaction(function () use ($period) {
            // Desactivar todos los demás
            AcademicPeriod::query()->update(['is_active' => false]);

            // Activar este
            $period->update(['is_active' => true]);
        });

        return redirect()->back();
    }

    /**
     * Concluir / Desactivar el ciclo escolar activo
     */
    public function close(Request $request, $id)
    {
        $period = AcademicPeriod::findOrFail($id);
        
        $period->update(['is_active' => false]);

        return redirect()->back();
    }
}

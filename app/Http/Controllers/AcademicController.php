<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use App\Models\Course;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    /**
     * Crea un nuevo ciclo escolar (ej: 2026-B) en Supabase.
     */
    public function storePeriod(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        // Si se marca como activo, desactivamos los ciclos anteriores primero
        if ($request->has('is_active')) {
            AcademicPeriod::where('is_active', true)->update(['is_active' => false]);
        }

        AcademicPeriod::create([
            'name' => $data['name'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'is_active' => $request->boolean('is_active', false)
        ]);

        return redirect()->back()->with('success', 'Ciclo escolar creado correctamente.');
    }

    /**
     * Da de alta una nueva materia en el plan de estudios.
     */
    public function storeCourse(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|unique:courses,code|max:20',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        Course::create($data);

        return redirect()->back()->with('success', 'Materia registrada en el sistema.');
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Specialty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecialtyController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Especialidades/Index', [
            'especialidades' => Inertia::defer(function () {
                return Specialty::withCount('courses')->get()->map(function ($s) {
                    return [
                        'id' => $s->id,
                        'nombre' => $s->nombre,
                        'codigo' => $s->codigo,
                        'courses_count' => $s->courses_count,
                    ];
                });
            }),
            'specialtyDistribution' => Inertia::defer(function () {
                $activeCycle = \App\Models\AcademicPeriod::where('activo', true)->first();
                if (!$activeCycle) return [];

                return \DB::table('inscripciones')
                    ->join('grupos', 'inscripciones.grupo_id', '=', 'grupos.id')
                    ->select('grupos.especialidad as name', \DB::raw('count(*) as count'))
                    ->where('inscripciones.estatus', 'active')
                    ->where('inscripciones.ciclo_id', $activeCycle->id)
                    ->groupBy('grupos.especialidad')
                    ->get()
                    ->map(function($item, $index) {
                        $colors = ['#0266E0', '#4db6ac', '#ab47bc', '#ffa726', '#ef5350'];
                        $color = $colors[$index % count($colors)];
                        return [
                            'name' => $item->name ?: 'General',
                            'count' => (int)$item->count,
                            'color' => $color,
                            'bulletClass' => 'bg-[' . $color . ']'
                        ];
                    });
            })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|unique:especialidades,nombre|max:50',
            'codigo' => 'required|string|unique:especialidades,codigo|max:10',
        ], [
            'nombre.unique' => 'Esta especialidad ya existe (el nombre ya está registrado).',
            'codigo.unique' => 'Esta especialidad ya existe (el código ya está registrado).',
        ]);

        Specialty::create($validated);

        return redirect()->back()->with('message', 'Especialidad registrada con éxito.');
    }

    public function update(Request $request, $id)
    {
        $specialty = Specialty::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|unique:especialidades,nombre,' . $specialty->id . '|max:50',
            'codigo' => 'required|string|unique:especialidades,codigo,' . $specialty->id . '|max:10',
        ], [
            'nombre.unique' => 'Esta especialidad ya existe (el nombre ya está registrado).',
            'codigo.unique' => 'Esta especialidad ya existe (el código ya está registrado).',
        ]);

        $specialty->update($validated);

        return redirect()->back()->with('message', 'Especialidad actualizada con éxito.');
    }

    public function destroy($id)
    {
        $specialty = Specialty::findOrFail($id);

        // 1. Verificar si hay materias vinculadas
        $coursesCount = $specialty->courses()->count();
        if ($coursesCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar la especialidad '{$specialty->nombre}' porque tiene {$coursesCount} materias vinculadas directamente."
            ]);
        }

        $specialty->delete();
        return redirect()->back();
    }
}

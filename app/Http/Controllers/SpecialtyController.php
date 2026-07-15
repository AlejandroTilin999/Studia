<?php

namespace App\Http\Controllers;

use App\Models\Specialty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecialtyController extends Controller
{
    public function index()
    {
        $specialties = Specialty::all()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
            ];
        });

        return Inertia::render('Admin/Especialidades/Index', [
            'specialties' => $specialties
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:especialidades,name|max:50',
            'code' => 'required|string|unique:especialidades,code|max:10',
        ], [
            'name.unique' => 'Esta especialidad ya existe (el nombre ya está registrado).',
            'code.unique' => 'Esta especialidad ya existe (el código ya está registrado).',
        ]);

        Specialty::create($validated);

        return redirect()->back()->with('message', 'Especialidad registrada con éxito.');
    }

    public function update(Request $request, $id)
    {
        $specialty = Specialty::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:especialidades,name,' . $specialty->id . '|max:50',
            'code' => 'required|string|unique:especialidades,code,' . $specialty->id . '|max:10',
        ], [
            'name.unique' => 'Esta especialidad ya existe (el nombre ya está registrado).',
            'code.unique' => 'Esta especialidad ya existe (el código ya está registrado).',
        ]);

        $specialty->update($validated);

        return redirect()->back()->with('message', 'Especialidad actualizada con éxito.');
    }

    public function destroy($id)
    {
        $specialty = Specialty::findOrFail($id);
        $specialty->delete();

        return redirect()->back()->with('message', 'Especialidad eliminada con éxito.');
    }
}

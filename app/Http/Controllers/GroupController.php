<?php

namespace App\Http\Controllers;

use App\Models\AcademicGroup;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        // Traer grupos con sus tutores asignados
        $groups = AcademicGroup::with('tutor')->get()->map(function ($group) {
            return [
                'id' => $group->id,
                'codigo' => $group->code,
                'nombre' => $group->name,
                'turno' => $group->shift ?? 'Horario único',
                'especialidad' => $group->specialty,
                'teacher_id' => $group->teacher_id,
                'profesor' => $group->tutor 
                    ? trim("{$group->tutor->nombre} {$group->tutor->apellido_paterno}")
                    : 'Sin tutor asignado'
            ];
        });

        // Traer también la lista de profesores para llenar el Select del Modal
        $teachers = Teacher::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'nombre_completo' => trim("{$t->nombre} {$t->apellido_paterno} " . ($t->apellido_materno ?? ''))
            ];
        });

        return Inertia::render('Admin/Grupos/Index', [
            'grupos' => $groups,
            'profesores' => $teachers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:academic_groups,code',
            'name' => 'required|string|max:255',
            'shift' => 'required|string',
            'specialty' => 'required|string',
            'teacher_id' => 'nullable|integer'
        ]);

        AcademicGroup::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $group = AcademicGroup::findOrFail($id);
        $validated = $request->validate([
            'code' => 'required|string|unique:academic_groups,code,' . $group->id,
            'name' => 'required|string|max:255',
            'shift' => 'required|string',
            'specialty' => 'required|string',
            'teacher_id' => 'nullable|integer'
        ]);

        $group->update($validated);
        return redirect()->back();
    }
}
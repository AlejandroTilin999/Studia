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
        // Traer grupos mapeados con sus nombres de columnas reales de la DB
        $groups = AcademicGroup::with('tutor')->get()->map(function ($group) {
            return [
                'id' => $group->id,
                'codigo' => $group->code,
                'nombre' => $group->name,
                'turno' => $group->shift ?? 'Horario único',
                'especialidad' => $group->major, // Mapeado de major
                'tutor_teacher_id' => $group->tutor_teacher_id ?? '', // Columna exacta
                'profesor' => $group->tutor 
                    ? trim("{$group->tutor->nombre} {$group->tutor->apellido_paterno}")
                    : 'Sin tutor asignado'
            ];
        });

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
            'name' => 'required|string|unique:academic_groups,name|max:20', // Valida si el nombre ya existe
            'shift' => 'required|string',
            'major' => 'required|string', // Cambiado a major
            'tutor_teacher_id' => 'nullable', // Cambiado a tutor_teacher_id
        ]);

        $validated['tutor_teacher_id'] = $validated['tutor_teacher_id'] ?: null;

        AcademicGroup::create($validated);

        return redirect()->back()->with('message', 'Grupo registrado con éxito.');
    }

    public function update(Request $request, $id)
    {
        $group = AcademicGroup::findOrFail($id);
        
        $validated = $request->validate([
            'code' => 'required|string|unique:academic_groups,code,' . $group->id,
            // Valida único ignorando el ID del grupo actual que estás editando
            'name' => 'required|string|unique:academic_groups,name,' . $group->id . '|max:20', 
            'shift' => 'required|string',
            'major' => 'required|string',
            'tutor_teacher_id' => 'nullable',
        ]);

        $validated['tutor_teacher_id'] = $validated['tutor_teacher_id'] ?: null;

        $group->update($validated);

        return redirect()->back()->with('message', 'Grupo actualizado con éxito.');
    }
}
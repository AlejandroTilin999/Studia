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
        // Traer grupos con sus tutores y materias asignadas
        $groups = AcademicGroup::with(['tutor', 'courses'])->get()->map(function ($group) {
            return [
                'id' => $group->id,
                'codigo' => $group->code,
                'nombre' => $group->name,
                'turno' => $group->shift ?? 'Horario único',
                'especialidad' => $group->major ?? 'TI',
                'teacher_id' => $group->tutor_teacher_id,
                'profesor' => $group->tutor 
                    ? trim("{$group->tutor->nombre} {$group->tutor->apellido_paterno}")
                    : 'Sin tutor asignado',
                'linked_courses' => $group->courses->pluck('id')->toArray()
            ];
        });

        // Traer también la lista de profesores para llenar el Select del Modal
        $teachers = Teacher::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'nombre_completo' => trim("{$t->nombre} {$t->apellido_paterno} " . ($t->apellido_materno ?? ''))
            ];
        });

        // Traer todas las materias para que el grupo pueda elegirlas
        $courses = \App\Models\Course::all()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'code' => $c->code
            ];
        });

        return Inertia::render('Admin/Grupos/Index', [
            'grupos' => $groups,
            'profesores' => $teachers,
            'materias' => $courses
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:academic_groups,code',
            'name' => 'required|string|max:255',
            'shift' => 'required|string',
            'specialty' => 'required|string',
            'teacher_id' => 'nullable|integer',
            'linked_courses' => 'nullable|array',
            'linked_courses.*' => 'integer|exists:courses,id'
        ]);

        $group = AcademicGroup::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'shift' => $validated['shift'],
            'major' => $validated['specialty'],
            'tutor_teacher_id' => $validated['teacher_id'],
        ]);

        // Sincronizar materias vinculadas al grupo
        if ($request->has('linked_courses')) {
            $group->courses()->sync($request->linked_courses);
        }

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
            'teacher_id' => 'nullable|integer',
            'linked_courses' => 'nullable|array',
            'linked_courses.*' => 'integer|exists:courses,id'
        ]);

        $group->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'shift' => $validated['shift'],
            'major' => $validated['specialty'],
            'tutor_teacher_id' => $validated['teacher_id'],
        ]);

        // Sincronizar materias vinculadas al grupo
        if ($request->has('linked_courses')) {
            $group->courses()->sync($request->linked_courses);
        }

        return redirect()->back();
    }
}
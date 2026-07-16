<?php

namespace App\Http\Controllers;

use App\Models\AcademicGroup;
use App\Models\Teacher;
use App\Models\PlanEstudio;
use App\Models\Turno;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        // Traer grupos mapeados con sus nombres de columnas reales de la DB
        $groups = AcademicGroup::with(['tutor'])->get()->map(function ($group) {
            return [
                'id' => $group->id,
                'codigo' => $group->code,
                'nombre' => $group->name,
                'turno' => $group->shift ?? 'Horario único',
                'especialidad' => $group->major, // Mapeado de major
                'tutor_teacher_id' => $group->tutor_teacher_id ?? '',
                'profesor' => $group->tutor
                    ? trim("{$group->tutor->nombre} {$group->tutor->apellido_paterno}")
                    : 'Sin tutor asignado',
                'turno_id' => $group->turno_id ?? '',
                'activo' => (bool)($group->activo ?? true)
            ];
        });

        $teachers = Teacher::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'nombre_completo' => trim("{$t->nombre} {$t->apellido_paterno} " . ($t->apellido_materno ?? ''))
            ];
        });

        $specialties = Specialty::all()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
            ];
        });

        $turnos = Turno::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'nombre' => $t->nombre,
            ];
        });

        return Inertia::render('Admin/Grupos/Index', [
            'grupos' => $groups,
            'profesores' => $teachers,
            'especialidades' => $specialties,
            'turnos' => $turnos
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:grupos,code',
            'name' => 'required|string|unique:grupos,name|max:20',
            'shift' => 'required|string',
            'major' => 'required|string',
            'tutor_teacher_id' => 'nullable',
            'turno_id' => 'nullable|exists:turnos,id',
            'activo' => 'nullable|boolean',
        ], [
            'code.unique' => 'Este grupo ya existe (el código ya está registrado).',
            'name.unique' => 'Este grupo ya existe (el nombre del grupo ya está registrado).',
        ]);

        $validated['tutor_teacher_id'] = $validated['tutor_teacher_id'] ?: null;
        $validated['turno_id'] = $validated['turno_id'] ?: null;
        $validated['plan_id'] = null; // Plan eliminado por requerimiento de usuario

        AcademicGroup::create($validated);

        return redirect()->back()->with('message', 'Grupo registrado con éxito.');
    }

    public function update(Request $request, $id)
    {
        $group = AcademicGroup::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|unique:grupos,code,' . $group->id,
            'name' => 'required|string|unique:grupos,name,' . $group->id . '|max:20',
            'shift' => 'required|string',
            'major' => 'required|string',
            'tutor_teacher_id' => 'nullable',
            'turno_id' => 'nullable|exists:turnos,id',
            'activo' => 'nullable|boolean',
        ], [
            'code.unique' => 'Este grupo ya existe (el código ya está registrado).',
            'name.unique' => 'Este grupo ya existe (el nombre del grupo ya está registrado).',
        ]);

        $validated['tutor_teacher_id'] = $validated['tutor_teacher_id'] ?: null;
        $validated['turno_id'] = $validated['turno_id'] ?: null;
        $validated['plan_id'] = null; // Plan eliminado por requerimiento de usuario

        $group->update($validated);

        return redirect()->back()->with('message', 'Grupo actualizado con éxito.');
    }

    public function destroy($id)
    {
        $group = AcademicGroup::findOrFail($id);

        // 1. Verificar si tiene alumnos inscritos
        $studentsCount = \App\Models\Enrollment::where('academic_group_id', $group->id)->count();
        if ($studentsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el grupo '{$group->name}' porque tiene {$studentsCount} alumnos inscritos actualmente."
            ]);
        }

        // 2. Verificar si tiene cargas académicas (materias asignadas)
        $loadsCount = \App\Models\AcademicLoad::where('academic_group_id', $group->id)->count();
        if ($loadsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el grupo '{$group->name}' porque tiene {$loadsCount} materias asignadas en el ciclo escolar."
            ]);
        }

        $group->delete();
        return redirect()->back();
    }
}

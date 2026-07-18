<?php

namespace App\Http\Controllers;

use App\Models\AcademicGroup;
use App\Models\Teacher;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Grupos/Index', [
            'grupos' => Inertia::defer(function () {
                return AcademicGroup::with(['tutor'])->get()->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'codigo' => $group->codigo,
                        'nombre' => $group->nombre,
                        'turno' => $group->turno ?? 'Matutino',
                        'especialidad' => $group->especialidad,
                        'docente_tutor_id' => $group->docente_tutor_id ?? '',
                        'profesor' => $group->tutor
                            ? trim("{$group->tutor->nombre} {$group->tutor->apellido_paterno}")
                            : 'Sin tutor asignado',
                        'activo' => (bool)($group->activo ?? true)
                    ];
                });
            }),
            'profesores' => Teacher::all()->map(function ($t) {
                return [
                    'id' => $t->id,
                    'nombre_completo' => trim("{$t->nombre} {$t->apellido_paterno} " . ($t->apellido_materno ?? ''))
                ];
            }),
            'especialidades' => Specialty::all()->map(function ($s) {
                return [
                    'id' => $s->id,
                    'nombre' => $s->nombre,
                    'codigo' => $s->codigo,
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|unique:grupos,codigo',
            'nombre' => 'required|string|unique:grupos,nombre|max:20',
            'turno' => 'nullable|string',
            'especialidad' => 'required|string',
            'docente_tutor_id' => 'nullable',
            'activo' => 'nullable|boolean',
        ], [
            'codigo.unique' => 'Este grupo ya existe (el código ya está registrado).',
            'nombre.unique' => 'Este grupo ya existe (el nombre del grupo ya está registrado).',
        ]);

        $validated['docente_tutor_id'] = $validated['docente_tutor_id'] ?: null;
        $validated['turno'] = 'Matutino';

        AcademicGroup::create($validated);

        return redirect()->back()->with('message', 'Grupo registrado con éxito.');
    }

    public function update(Request $request, $id)
    {
        $group = AcademicGroup::findOrFail($id);

        $validated = $request->validate([
            'codigo' => 'required|string|unique:grupos,codigo,' . $group->id,
            'nombre' => 'required|string|unique:grupos,nombre,' . $group->id . '|max:20',
            'turno' => 'nullable|string',
            'especialidad' => 'required|string',
            'docente_tutor_id' => 'nullable',
            'activo' => 'nullable|boolean',
        ], [
            'codigo.unique' => 'Este grupo ya existe (el código ya está registrado).',
            'nombre.unique' => 'Este grupo ya existe (el nombre del grupo ya está registrado).',
        ]);

        $validated['docente_tutor_id'] = $validated['docente_tutor_id'] ?: null;
        $validated['turno'] = 'Matutino';

        $group->update($validated);

        return redirect()->back()->with('message', 'Grupo actualizado con éxito.');
    }

    public function destroy($id)
    {
        $group = AcademicGroup::findOrFail($id);

        // 1. Verificar si tiene alumnos inscritos
        $studentsCount = \App\Models\Enrollment::where('grupo_id', $group->id)->count();
        if ($studentsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el grupo '{$group->nombre}' porque tiene {$studentsCount} alumnos inscritos actualmente."
            ]);
        }

        // 2. Verificar si tiene cargas académicas (materias asignadas)
        $loadsCount = \App\Models\AcademicLoad::where('grupo_id', $group->id)->count();
        if ($loadsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el grupo '{$group->nombre}' porque tiene {$loadsCount} materias asignadas en el ciclo escolar."
            ]);
        }

        $group->delete();
        return redirect()->back();
    }
}

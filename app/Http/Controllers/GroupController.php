<?php

namespace App\Http\Controllers;

use App\Models\AcademicGroup;
use App\Models\AcademicPeriod;
use App\Models\Teacher;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        return Inertia::render('Admin/Grupos/Index', [
            'grupos' => Inertia::defer(function () use ($search) {
                // [INTELIGENCIA v3.6] Mostrar grupos en planificación o activos
                $query = AcademicGroup::query();

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('nombre', 'like', "%{$search}%")
                          ->orWhere('codigo', 'like', "%{$search}%")
                          ->orWhere('especialidad', 'like', "%{$search}%");
                    });
                }

                return $query->with(['tutor'])->paginate(50)
                    ->through(function ($group) {
                        return [
                            'id' => $group->id,
                            'codigo' => $group->codigo,
                            'nombre' => $group->nombre,
                            'semestre' => $group->semestre,
                            'generacion' => $group->generacion,
                            'turno' => $group->turno ?? 'Matutino',
                            'especialidad' => $group->especialidad,
                            'docente_tutor_id' => $group->docente_tutor_id ?? '',
                            'profesor' => $group->tutor
                                ? trim("{$group->tutor->nombre} {$group->tutor->apellido_paterno}")
                                : 'Sin tutor asignado',
                            'activo' => (bool)($group->activo ?? true)
                        ];
                    })
                    ->withQueryString();
            }),
            'profesores' => Inertia::defer(fn() => Teacher::with('user')->get()->map(function ($t) {
                return [
                    'id' => $t->id,
                    'nombre_completo' => trim("{$t->user->nombre} {$t->user->apellido_paterno} " . ($t->user->apellido_materno ?? ''))
                ];
            })),
            'especialidades' => Inertia::defer(fn() => Specialty::all()->map(function ($s) {
                return [
                    'id' => $s->id,
                    'nombre' => $s->nombre,
                    'codigo' => $s->codigo,
                ];
            })),
            'cycles' => Inertia::defer(fn() => AcademicPeriod::orderBy('fecha_inicio', 'desc')->get()->map(fn($c) => [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'activo' => (bool)$c->activo
            ])),
            'filters' => [
                'search' => $search
            ],
            'isCycleActive' => AcademicPeriod::where('status', AcademicPeriod::STATUS_ACTIVE)->exists(),
            'canRegister' => AcademicPeriod::whereIn('status', [
                AcademicPeriod::STATUS_ACTIVE,
                AcademicPeriod::STATUS_PLANNING
            ])->exists()
        ]);
    }

    public function store(Request $request)
    {
        // [SAFETY LOCK v3.6] Permitir crear grupos si hay un ciclo activo o en planeación
        if (!AcademicPeriod::whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])->exists()) {
            return redirect()->back()->withErrors([
                'codigo' => 'No se pueden registrar grupos si no existe un Ciclo Escolar activo o en modo Planeación.'
            ]);
        }

        $validated = $request->validate([
            'codigo' => 'required|string|unique:grupos,codigo',
            'nombre' => 'required|string|unique:grupos,nombre|max:20',
            'semestre' => 'required|integer|min:1|max:6',
            'generacion' => 'required|string|max:50',
            'turno' => 'nullable|string',
            'especialidad' => 'required|string',
            'docente_tutor_id' => 'nullable',
            'activo' => 'nullable|boolean',
        ], [
            'codigo.unique' => 'Este grupo ya existe (el código ya está registrado).',
            'nombre.unique' => 'Este grupo ya existe (el nombre del grupo ya está registrado).',
        ]);

        $validated['docente_tutor_id'] = $validated['docente_tutor_id'] ?: null;
        $validated['turno'] = $validated['turno'] ?? 'Matutino';

        AcademicGroup::create($validated);

        return redirect()->back()->with('message', 'Grupo registrado con éxito.');
    }

    public function update(Request $request, $id)
    {
        $group = AcademicGroup::findOrFail($id);

        $validated = $request->validate([
            'codigo' => 'required|string|unique:grupos,codigo,' . $group->id,
            'nombre' => 'required|string|unique:grupos,nombre,' . $group->id . '|max:20',
            'semestre' => 'required|integer|min:1|max:6',
            'generacion' => 'required|string|max:50',
            'turno' => 'nullable|string',
            'especialidad' => 'required|string',
            'docente_tutor_id' => 'nullable',
            'activo' => 'nullable|boolean',
        ], [
            'codigo.unique' => 'Este grupo ya existe (el código ya está registrado).',
            'nombre.unique' => 'Este grupo ya existe (el nombre del grupo ya está registrado).',
        ]);

        $validated['docente_tutor_id'] = $validated['docente_tutor_id'] ?: null;
        $validated['turno'] = $validated['turno'] ?? 'Matutino';

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

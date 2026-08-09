<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\AcademicGroup;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $activePeriod = \App\Models\AcademicPeriod::where('status', \App\Models\AcademicPeriod::STATUS_ACTIVE)->first();
        $planningPeriod = \App\Models\AcademicPeriod::where('status', \App\Models\AcademicPeriod::STATUS_PLANNING)->first();

        $workingPeriod = $activePeriod ?: $planningPeriod;

        return Inertia::render('Admin/Materias/Index', [
            'materias' => Inertia::defer(function () use ($search) {
                $query = Course::query();

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('nombre', 'like', "%{$search}%")
                          ->orWhere('codigo', 'like', "%{$search}%")
                          ->orWhere('tipo', 'like', "%{$search}%")
                          ->orWhere('area', 'like', "%{$search}%");
                    });
                }

                return $query->with(['teacher.user', 'groups', 'specialties'])
                    ->paginate(50)
                    ->through(function ($course) {
                        return [
                            'id' => $course->id,
                            'codigo' => $course->codigo,
                            'nombre' => $course->nombre,
                            'semestre' => $course->semestre ?? 1,
                            'descripcion' => $course->descripcion,
                            'tipo' => $course->tipo ?? 'General',
                            'area' => $course->area ?? '',
                            'docente_id' => $course->docente_id,
                            'profesor' => ($course->teacher && $course->teacher->user) ? $course->teacher->user->nombre_completo : 'Sin profesor asignado',
                            'grupos' => $course->groups ? $course->groups->pluck('codigo')->unique()->toArray() : [],
                            'especialidades' => $course->specialties ? $course->specialties->map(fn($s) => [
                                'id' => $s->id,
                                'nombre' => $s->nombre,
                            ])->toArray() : [],
                        ];
                    })
                    ->withQueryString();
            }),
            'profesores' => Inertia::defer(fn() => \App\Models\Teacher::with('user')->get()->map(fn($t) => [
                'id' => $t->id,
                'nombre_completo' => $t->user->nombre_completo ?? 'N/A',
            ])),
            'grupos' => Inertia::defer(fn() => AcademicGroup::all()->map(fn($g) => [
                'id' => $g->id,
                'codigo' => $g->codigo,
                'nombre' => $g->nombre,
            ])),
            'especialidades' => Inertia::defer(fn() => Specialty::all()->map(fn($s) => [
                'id' => $s->id,
                'nombre' => $s->nombre,
                'codigo' => $s->codigo,
                'sub_areas' => $s->sub_areas ?? [],
            ])),
            'activePeriod' => $workingPeriod ? [
                'id' => $workingPeriod->id,
                'nombre' => $workingPeriod->nombre,
                'es_nones' => \Carbon\Carbon::parse($workingPeriod->fecha_inicio)->month >= 8,
            ] : null,
            'isCycleActive' => (bool)$activePeriod,
            'canRegister' => (bool)$workingPeriod,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    public function store(Request $request)
    {
        // [SAFETY LOCK v3.15] No permitir registrar materias sin especialidades
        if (\App\Models\Specialty::count() === 0) {
            return redirect()->back()->withErrors([
                'nombre' => 'No existen bachilleratos o especialidades técnicas en el sistema. Debes registrar al menos una antes de crear materias.'
            ]);
        }

        $validated = $request->validate([
            'codigo' => 'required|string|unique:materias,codigo|max:20',
            'nombre' => 'required|string|max:255',
            'semestre' => 'required|integer|min:1|max:6',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|string|in:General,Especialidad',
            'area' => 'nullable|string|max:100',
            'linked_groups' => 'nullable|array',
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'exists:especialidades,id',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $course = Course::create([
                'codigo' => $validated['codigo'],
                'nombre' => $validated['nombre'],
                'semestre' => $validated['semestre'],
                'descripcion' => $validated['descripcion'],
                'tipo' => $validated['tipo'],
                'area' => $validated['area'] ?? null,
            ]);

            if ($validated['tipo'] === 'Especialidad') {
                $course->specialties()->sync($request->input('specialty_ids', []));
            }
        });

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia creada correctamente.');
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'codigo' => "required|string|max:20|unique:materias,codigo,{$id}",
            'nombre' => 'required|string|max:255',
            'semestre' => 'required|integer|min:1|max:6',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|string|in:General,Especialidad',
            'area' => 'nullable|string|max:100',
            'linked_groups' => 'nullable|array',
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'exists:especialidades,id',
        ]);

        DB::transaction(function () use ($validated, $request, $course) {
            $course->update([
                'codigo' => $validated['codigo'],
                'nombre' => $validated['nombre'],
                'semestre' => $validated['semestre'],
                'descripcion' => $validated['descripcion'],
                'tipo' => $validated['tipo'],
                'area' => $validated['area'] ?? null,
            ]);

            if ($validated['tipo'] === 'Especialidad') {
                $course->specialties()->sync($request->input('specialty_ids', []));
            } else {
                $course->specialties()->detach();
            }
        });

        // [TIEMPO REAL INSTANTÁNEO] Notificar a todos los grupos que llevan esta materia
        $affectedLoads = \App\Models\AcademicLoad::where('materia_id', $course->id)->get();
        foreach ($affectedLoads as $load) {
            event(new \App\Events\GroupDataUpdated($load->grupo_id, 'course'));
        }

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia actualizada correctamente.');
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        // 1. Verificar si tiene asignaciones (cargas académicas) activas o históricas
        $loadsCount = \App\Models\AcademicLoad::where('materia_id', $course->id)->count();
        if ($loadsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar la materia '{$course->nombre}' porque ya está asignada a {$loadsCount} grupos o periodos escolares."
            ]);
        }

        $course->specialties()->detach();
        $course->delete();

        return redirect()->route('admin.materias.index');
    }
}

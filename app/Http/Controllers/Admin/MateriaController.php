<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\AcademicGroup;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class MateriaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $workingPeriod = \App\Services\AcademicPeriodService::workingPeriod();

        $revision = Cache::get('admin:materias:list:revision', 1);
        $page = max(1, (int) $request->query('page', 1));
        $cacheKey = "admin:materias:list:{$revision}:{$page}:" . md5((string) $search);

        $cachedMaterias = Cache::remember($cacheKey, 600, function () use ($search, $page) {
            $query = Course::query();

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%")
                      ->orWhere('tipo', 'like', "%{$search}%")
                      ->orWhere('area', 'like', "%{$search}%");
                });
            }

            $totalCount = (clone $query)->count();
            $perPage = 50;

            $results = $query->with(['teacher.user', 'groups', 'specialties'])
                ->orderBy('semestre')
                ->orderBy('nombre')
                ->forPage($page, $perPage)
                ->get()
                ->map(function ($course) {
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
                });

            return new \Illuminate\Pagination\LengthAwarePaginator(
                $results,
                $totalCount,
                $perPage,
                $page,
                [
                    'path' => \Illuminate\Pagination\LengthAwarePaginator::resolveCurrentPath(),
                    'query' => request()->query(),
                ]
            );
        });

        return Inertia::render('Admin/Materias/Index', [
            'materias' => $cachedMaterias,
            'profesores' => fn() => Cache::remember('catalog_profesores_select', 300, function() {
                return \App\Models\Teacher::with('user:id,nombre,apellido_paterno,apellido_materno')
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'nombre_completo' => $t->user?->nombre_completo ?? 'N/A',
                    ])->all();
            }),
            'grupos' => fn() => Cache::remember('catalog_grupos_select', 300, function() {
                return AcademicGroup::select('id', 'codigo', 'nombre')
                    ->orderBy('semestre')
                    ->orderBy('nombre')
                    ->get()
                    ->map(fn($g) => [
                        'id' => $g->id,
                        'codigo' => $g->codigo,
                        'nombre' => $g->nombre,
                    ])->all();
            }),
            'especialidades' => fn() => Cache::remember('catalog_especialidades_select', 300, function() {
                return Specialty::select('id', 'nombre', 'codigo', 'sub_areas')
                    ->orderBy('nombre')
                    ->get()
                    ->map(fn($s) => [
                        'id' => $s->id,
                        'nombre' => $s->nombre,
                        'codigo' => $s->codigo,
                        'sub_areas' => $s->sub_areas ?? [],
                    ])->all();
            }),
            'activePeriod' => $workingPeriod ? [
                'id' => $workingPeriod->id,
                'nombre' => $workingPeriod->nombre,
                'es_nones' => $workingPeriod->fecha_inicio ? (\Carbon\Carbon::parse($workingPeriod->fecha_inicio)->month >= 8 || \Carbon\Carbon::parse($workingPeriod->fecha_inicio)->month === 1) : true,
            ] : null,
            'isCycleActive' => $workingPeriod?->status === \App\Models\AcademicPeriod::STATUS_ACTIVE,
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

            // [AUTO-ASIGNACIÓN INTELIGENTE] Si es una materia General, asignarla a todos los grupos de ese semestre en el ciclo activo
            $workingCycle = \App\Services\AcademicPeriodService::workingPeriod();
            if ($workingCycle && $course->tipo === 'General') {
                $matchingGroups = AcademicGroup::where('semestre', $course->semestre)->get();
                $firstTeacher = \App\Models\Teacher::first();
                $teacherId = $firstTeacher ? $firstTeacher->id : 1;

                foreach ($matchingGroups as $group) {
                    \App\Models\AcademicLoad::firstOrCreate(
                        [
                            'grupo_id' => $group->id,
                            'materia_id' => $course->id,
                            'ciclo_id' => $workingCycle->id,
                        ],
                        [
                            'docente_id' => $teacherId,
                        ]
                    );

                    // [TIEMPO REAL REVERB] Notificar al grupo que hay nueva materia general
                    try {
                        event(new \App\Events\GroupDataUpdated($group->id, 'courses'));
                    } catch (\Throwable $e) {}
                }
            }
        });

        \App\Services\GradeService::invalidateStudentCache();
        $this->invalidateCourseCache();

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia creada correctamente.');
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $request->validate([
            'nombre'         => 'required|string|max:255',
            'codigo'         => 'required|string|max:50|unique:materias,codigo,' . $id,
            'semestre'       => 'required|integer|min:1|max:6',
            'tipo'           => 'required|in:General,Especialidad',
            'especialidades' => 'nullable|array',
            'especialidades.*' => 'exists:especialidades,id',
        ]);

        $course->update([
            'nombre'   => $request->nombre,
            'codigo'   => $request->codigo,
            'semestre' => $request->semestre,
            'tipo'     => $request->tipo,
        ]);

        if ($request->tipo === 'Especialidad' && $request->has('especialidades')) {
            $course->specialties()->sync($request->especialidades);
        } else {
            $course->specialties()->detach();
        }

        // [TIEMPO REAL INSTANTÁNEO] Notificar a todos los grupos que llevan esta materia
        $affectedLoads = \App\Models\AcademicLoad::where('materia_id', $course->id)->get();
        foreach ($affectedLoads as $load) {
            try {
                event(new \App\Events\GroupDataUpdated($load->grupo_id, 'course'));
            } catch (\Throwable $e) {}
        }

        $this->invalidateCourseCache();

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

        $this->invalidateCourseCache();

        return redirect()->route('admin.materias.index');
    }

    private function invalidateCourseCache(): void
    {
        Cache::add('admin:materias:list:revision', 1, now()->addDays(30));
        Cache::increment('admin:materias:list:revision');
        Cache::forget('admin_system_metrics');
    }
}

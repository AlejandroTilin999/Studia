<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\AcademicLoad;
use App\Models\AcademicPeriod;
use App\Models\AcademicGroup;
use App\Models\Course;
use App\Models\Teacher;
use App\Services\AcademicPeriodService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class CargaAcademicaController extends Controller
{
    private function invalidateTeacherListCache(): void
    {
        Cache::add('admin:cargas:list:revision', 1, now()->addDays(30));
        Cache::increment('admin:cargas:list:revision');
        Cache::add('admin:docentes:list:revision', 1, now()->addDays(30));
        Cache::increment('admin:docentes:list:revision');
    }

    public function index(Request $request)
    {
        $search = $request->query('search');
        $workingCycle = AcademicPeriodService::workingPeriod();

        $revision = Cache::get('admin:cargas:list:revision', 1);
        $cycleFilter = $request->query('cycle', 'all');
        $page = max(1, (int) $request->query('page', 1));
        $cacheKey = "admin:cargas:list:{$revision}:{$cycleFilter}:{$page}:" . md5((string) $search);

        $cachedLoads = Cache::remember($cacheKey, 600, function () use ($search, $cycleFilter, $workingCycle, $page) {
            $query = AcademicLoad::with(['academicPeriod', 'academicGroup', 'course', 'teacher.user']);

            if ($cycleFilter && $cycleFilter !== 'all') {
                $query->where('ciclo_id', $cycleFilter);
            } elseif (!$search && $workingCycle) {
                $query->where('ciclo_id', $workingCycle->id);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('course', function ($sq) use ($search) {
                        $sq->where('nombre', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%");
                    })->orWhereHas('academicGroup', function ($sq) use ($search) {
                        $sq->where('nombre', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%");
                    })->orWhereHas('teacher.user', function ($sq) use ($search) {
                        $sq->where('nombre', 'like', "%{$search}%")
                            ->orWhere('apellido_paterno', 'like', "%{$search}%");
                    });
                });
            }

            $totalCount = (clone $query)->count();
            $perPage = 50;

            $results = $query->orderBy('id', 'desc')
                ->forPage($page, $perPage)
                ->get()
                ->map(function ($l) {
                    return [
                        'id' => $l->id,
                        'ciclo_id' => $l->ciclo_id,
                        'nombre_ciclo' => $l->academicPeriod->nombre ?? 'N/A',
                        'grupo_id' => $l->grupo_id,
                        'nombre_grupo' => $l->academicGroup->nombre ?? 'N/A',
                        'codigo_grupo' => $l->academicGroup->codigo ?? 'N/A',
                        'materia_id' => $l->materia_id,
                        'nombre_materia' => $l->course->nombre ?? 'N/A',
                        'codigo_materia' => $l->course->codigo ?? 'N/A',
                        'docente_id' => $l->docente_id,
                        'nombre_docente' => ($l->teacher && $l->teacher->user) ? $l->teacher->user->nombre_completo : 'Sin docente',
                        'area_docente' => $l->teacher->area ?? '',
                        'area_materia' => $l->course->area ?? '',
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

        return Inertia::render('Admin/Cargas/Index', [
            'loads' => $cachedLoads,
            'periods' => fn() => Cache::remember('admin_academic_periods_catalog', 3600, function() {
                return AcademicPeriod::orderByDesc('fecha_inicio')->get()->map(fn($p) => [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'activo' => (bool)$p->activo,
                    'status' => $p->status,
                    'mes_inicio' => $p->fecha_inicio ? \Carbon\Carbon::parse($p->fecha_inicio)->month : null,
                ])->all();
            }),
            'groups' => fn() => Cache::remember('catalog_grupos_select', 300, function() {
                // Se removió el filtro estricto por nombre de ciclo A/B para permitir cualquier grupo
                return AcademicGroup::orderBy('semestre')->orderBy('nombre')->get()->map(fn($g) => [
                    'id' => $g->id,
                    'nombre' => $g->nombre,
                    'codigo' => $g->codigo,
                    'semestre' => $g->semestre,
                    'especialidad' => $g->especialidad,
                ])->all();
            }),
            'courses' => fn() => Cache::remember('catalog_courses_select', 300, function() {
                return Course::with('specialties')->get()->map(fn($c) => [
                    'id' => $c->id,
                    'nombre' => $c->nombre,
                    'codigo' => $c->codigo,
                    'tipo' => $c->tipo,
                    'area' => $c->area ?? '',
                    'semestre' => $c->semestre,
                    'especialidades' => $c->specialties->pluck('nombre')->toArray(),
                ])->all();
            }),
            'teachers' => fn() => Cache::remember('catalog_profesores_select', 300, function() {
                return Teacher::with('user:id,nombre,apellido_paterno,apellido_materno')
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'nombre_completo' => $t->user?->nombre_completo ?? 'Docente sin nombre',
                        'especialidad' => $t->especialidad ?? 'General',
                        'areas' => $t->areas ?? [],
                    ])->all();
            }),
            'filters' => [
                'search' => $search
            ],
            'isCycleActive' => AcademicPeriodService::activePeriod() !== null,
            'canRegister' => AcademicPeriodService::workingPeriod() !== null,
        ]);
    }

    public function store(Request $request)
    {
        // Soporte para asignación masiva (batch)
        if ($request->has('assignments') && is_array($request->assignments)) {
            $request->validate([
                'ciclo_id' => 'required|exists:ciclos_escolares,id',
                'grupo_id' => 'required|exists:grupos,id',
                'assignments' => 'required|array',
                'assignments.*.materia_id' => 'required|exists:materias,id',
                'assignments.*.docente_id' => 'nullable|exists:docentes,id', // Cambiado a nullable
            ]);

            DB::transaction(function () use ($request) {
                foreach ($request->assignments as $assign) {
                    // Solo guardamos si se seleccionó un docente
                    if (!empty($assign['docente_id'])) {
                        AcademicLoad::updateOrCreate(
                            [
                                'ciclo_id' => $request->ciclo_id,
                                'grupo_id' => $request->grupo_id,
                                'materia_id' => $assign['materia_id'],
                            ],
                            ['docente_id' => $assign['docente_id']]
                        );
                    }
                }
            });

            $this->invalidateTeacherListCache();
            if (class_exists('\App\Services\GradeService')) {
                \App\Services\GradeService::invalidateStudentCache();
            }
            
            return redirect()->back()->with('message', 'Asignaciones procesadas con éxito.');
        }

        // Asignación individual
        $request->validate([
            'ciclo_id' => 'required|exists:ciclos_escolares,id',
            'grupo_id' => 'required|exists:grupos,id',
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'required|exists:docentes,id',
        ]);

        AcademicLoad::updateOrCreate(
            [
                'ciclo_id' => $request->ciclo_id,
                'grupo_id' => $request->grupo_id,
                'materia_id' => $request->materia_id,
            ],
            [
                'docente_id' => $request->docente_id,
            ]
        );

        $this->invalidateTeacherListCache();
        if (class_exists('\App\Services\GradeService')) {
            \App\Services\GradeService::invalidateStudentCache();
        }

        return redirect()->back()->with('message', 'Asignación creada con éxito.');
    }

    public function update(Request $request, $id)
    {
        $load = AcademicLoad::findOrFail($id);

        $request->validate([
            'ciclo_id' => 'required|exists:ciclos_escolares,id',
            'grupo_id' => 'required|exists:grupos,id',
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'required|exists:docentes,id',
        ]);

        $load->update([
            'ciclo_id' => $request->ciclo_id,
            'grupo_id' => $request->grupo_id,
            'materia_id' => $request->materia_id,
            'docente_id' => $request->docente_id,
        ]);

        $this->invalidateTeacherListCache();
        return redirect()->back()->with('message', 'Asignación actualizada con éxito.');
    }

    public function destroy($id)
    {
        $load = AcademicLoad::findOrFail($id);
        $load->delete();

        $this->invalidateTeacherListCache();
        return redirect()->back()->with('message', 'Asignación eliminada con éxito.');
    }
}
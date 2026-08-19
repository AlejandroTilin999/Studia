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
            'periods' => fn() => \Cache::remember('admin_academic_periods_catalog', 3600, function() {
                return AcademicPeriod::orderByDesc('fecha_inicio')->get()->map(fn($p) => [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'activo' => (bool)$p->activo,
                    'status' => $p->status,
                    'mes_inicio' => $p->fecha_inicio ? \Carbon\Carbon::parse($p->fecha_inicio)->month : null,
                ])->all();
            }),
            'groups' => fn() => \Cache::remember('catalog_grupos_select', 300, function() {
                $operatingCycle = AcademicPeriodService::workingPeriod();
                $query = AcademicGroup::query();

                if ($operatingCycle) {
                    $cycleName = strtoupper($operatingCycle->nombre);
                    if (str_contains($cycleName, 'PERIODO B') || str_contains($cycleName, 'CICLO B') || preg_match('/\bB\b/i', $cycleName)) {
                        $query->whereRaw('semestre % 2 = 0');
                    } else if (str_contains($cycleName, 'PERIODO A') || str_contains($cycleName, 'CICLO A') || preg_match('/\bA\b/i', $cycleName)) {
                        $query->whereRaw('semestre % 2 != 0');
                    }
                }

                return $query->orderBy('semestre')->orderBy('nombre')->get()->map(fn($g) => [
                    'id' => $g->id,
                    'nombre' => $g->nombre,
                    'codigo' => $g->codigo,
                    'semestre' => $g->semestre,
                    'especialidad' => $g->especialidad,
                ])->all();
            }),
            'courses' => fn() => \Cache::remember('catalog_courses_select', 300, function() {
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
            'teachers' => fn() => \Cache::remember('catalog_profesores_select', 300, function() {
                return Teacher::with('user:id,nombre,apellido_paterno,apellido_materno')
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'nombre_completo' => $t->user?->nombre_completo ?? 'Docente sin nombre',
                        'especialidad' => $t->especialidad,
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
        // [SAFETY LOCK v3.6] Permitir asignar materias en ciclos Activos o en Planeación
        if (!AcademicPeriod::whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])->exists()) {
            return redirect()->back()->withErrors([
                'ciclo_id' => 'Operación bloqueada. Debes tener un Ciclo Escolar vigente o en modo Planeación para realizar asignaciones.'
            ]);
        }

        // Soporte para asignación masiva (batch)
        if ($request->has('assignments') && is_array($request->assignments)) {
            $request->validate([
                'ciclo_id' => 'required|exists:ciclos_escolares,id',
                'grupo_id' => 'required|exists:grupos,id',
                'assignments' => 'required|array',
                'assignments.*.materia_id' => 'required|exists:materias,id',
                'assignments.*.docente_id' => 'required|exists:docentes,id',
            ], [
                'assignments.*.docente_id.required' => 'Es obligatorio asignar un docente a cada materia.',
                'assignments.*.materia_id.required' => 'El ID de la materia es requerido.',
                'ciclo_id.required' => 'El ciclo escolar es obligatorio.',
                'grupo_id.required' => 'El grupo es obligatorio.',
            ]);

            DB::transaction(function () use ($request) {
                foreach ($request->assignments as $assign) {
                    AcademicLoad::updateOrCreate(
                        [
                            'ciclo_id' => $request->ciclo_id,
                            'grupo_id' => $request->grupo_id,
                            'materia_id' => $assign['materia_id'],
                        ],
                        ['docente_id' => $assign['docente_id']]
                    );
                }
            });

            $this->invalidateTeacherListCache();
            \App\Services\GradeService::invalidateStudentCache();
            event(new \App\Events\GroupDataUpdated($request->grupo_id, 'courses'));

            return redirect()->back()->with('message', 'Asignaciones procesadas con éxito.');
        }

        // Asignación individual (legacy support)
        $request->validate([
            'ciclo_id' => 'required|exists:ciclos_escolares,id',
            'grupo_id' => 'required|exists:grupos,id',
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'required|exists:docentes,id',
        ]);

        $exists = AcademicLoad::where('ciclo_id', $request->ciclo_id)
            ->where('grupo_id', $request->grupo_id)
            ->where('materia_id', $request->materia_id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'materia_id' => 'Esta materia ya está asignada a este grupo en el periodo seleccionado.'
            ]);
        }

        AcademicLoad::create([
            'ciclo_id' => $request->ciclo_id,
            'grupo_id' => $request->grupo_id,
            'materia_id' => $request->materia_id,
            'docente_id' => $request->docente_id,
        ]);

        $this->invalidateTeacherListCache();
        \App\Services\GradeService::invalidateStudentCache();
        event(new \App\Events\GroupDataUpdated($request->grupo_id, 'courses'));

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

        $exists = AcademicLoad::where('ciclo_id', $request->ciclo_id)
            ->where('grupo_id', $request->grupo_id)
            ->where('materia_id', $request->materia_id)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'materia_id' => 'Esta materia ya está asignada a este grupo en el periodo seleccionado.'
            ]);
        }

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

    /**
     * Clona la carga académica de un grupo/ciclo anterior al actual.
     */
    public function cloneLoad(Request $request)
    {
        $request->validate([
            'grupo_origen_id' => 'required|exists:grupos,id',
            'ciclo_origen_id' => 'required|exists:ciclos_escolares,id',
            'grupo_destino_id' => 'required|exists:grupos,id',
            'ciclo_destino_id' => 'required|exists:ciclos_escolares,id',
            'incluir_docentes' => 'boolean'
        ]);

        $sourceLoads = AcademicLoad::where('grupo_id', $request->grupo_origen_id)
            ->where('ciclo_id', $request->ciclo_origen_id)
            ->get();

        if ($sourceLoads->isEmpty()) {
            return response()->json(['error' => 'El grupo origen no tiene materias asignadas.'], 422);
        }

        try {
            DB::transaction(function () use ($request, $sourceLoads) {
                foreach ($sourceLoads as $load) {
                    AcademicLoad::updateOrCreate(
                        [
                            'grupo_id' => $request->grupo_destino_id,
                            'ciclo_id' => $request->ciclo_destino_id,
                            'materia_id' => $load->materia_id,
                        ],
                        [
                            'docente_id' => $request->incluir_docentes ? $load->docente_id : null
                        ]
                    );
                }

                AdminAuditLog::create([
                    'usuario_id' => auth()->id(),
                    'accion' => 'CLONACION_CARGA',
                    'descripcion' => "Se importó la carga académica del grupo con ID {$request->grupo_origen_id} al grupo con ID {$request->grupo_destino_id}.",
                    'metadata' => $request->all()
                ]);
            });

            return response()->json(['message' => 'Carga importada con éxito.']);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al clonar la carga: ' . $e->getMessage()], 500);
        }
    }
}

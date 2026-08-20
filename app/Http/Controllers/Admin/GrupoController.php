<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicGroup;
use App\Models\AcademicLoad;
use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use App\Models\Specialty;
use App\Models\Teacher;
use App\Services\AcademicPeriodService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class GrupoController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $revision = Cache::get('admin:grupos:list:revision', 1);
        $page = max(1, (int) $request->query('page', 1));
        $cacheKey = "admin:grupos:list:{$revision}:{$page}:" . md5((string) $search);

        $cachedGrupos = Cache::remember($cacheKey, 600, function () use ($search, $page) {
            $query = AcademicGroup::query()
                ->when($search, fn ($sub) => $sub->where(function ($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                        ->orWhere('codigo', 'like', "%{$search}%")
                        ->orWhere('especialidad', 'like', "%{$search}%");
                }));

            $totalCount = (clone $query)->count();
            $perPage = 50;

            $results = $query->with('tutor.user')
                ->orderBy('generacion')
                ->orderBy('semestre')
                ->orderBy('seccion')
                ->forPage($page, $perPage)
                ->get()
                ->map(fn (AcademicGroup $group) => $this->serialize($group));

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

        return Inertia::render('Admin/Grupos/Index', [
            'grupos' => $cachedGrupos,
            'profesores' => fn () => Cache::remember('catalog_profesores_select', 300, function() {
                return Teacher::with('user:id,nombre,apellido_paterno,apellido_materno')->get()->map(fn (Teacher $teacher) => [
                    'id' => $teacher->id,
                    'nombre_completo' => trim("{$teacher->user?->nombre} {$teacher->user?->apellido_paterno} " . ($teacher->user?->apellido_materno ?? '')),
                ])->all();
            }),
            'especialidades' => fn () => Cache::remember('catalog_especialidades_select', 300, function() {
                return Specialty::orderBy('nombre')->get(['id', 'nombre', 'codigo']);
            }),
            'cycles' => fn () => Cache::remember('admin_academic_periods_catalog', 3600, function() {
                return AcademicPeriod::orderByDesc('fecha_inicio')->get()->map(fn (AcademicPeriod $cycle) => [
                    'id' => $cycle->id, 'nombre' => $cycle->nombre, 'activo' => (bool) $cycle->activo, 'status' => $cycle->status,
                ])->all();
            }),
            'currentYear' => (int) (optional(AcademicPeriodService::workingPeriod())->fecha_inicio?->format('Y') ?: date('Y')),
            'filters' => ['search' => $search],
            'isCycleActive' => AcademicPeriodService::activePeriod() !== null,
            'activeParity' => $this->activeParity(),
            'canRegister' => AcademicPeriodService::workingPeriod() !== null,
        ]);
    }

    public function store(Request $request)
    {
        $this->assertOperatingCycle();
        $validated = $request->validate($this->rules());

        $parity = $this->activeParity();
        $semestreInt = (int) $validated['semestre'];

        if ($parity === 'even' && $semestreInt % 2 !== 0) {
            return redirect()->back()->withErrors([
                'semestre' => 'No puedes registrar grupos de semestres impares (1°, 3°, 5°) en un Ciclo B. En este periodo únicamente se registran/operan semestres pares (2°, 4°, 6°).'
            ]);
        }

        if ($parity === 'odd' && $semestreInt % 2 === 0) {
            return redirect()->back()->withErrors([
                'semestre' => 'No puedes registrar grupos de semestres pares (2°, 4°, 6°) en un Ciclo A. En este periodo únicamente se registran/operan semestres impares (1°, 3°, 5°).'
            ]);
        }

        $specialty = Specialty::where('nombre', $validated['especialidad'])->firstOrFail();
        $generationStart = $this->generationStart($validated['generacion']);
        $section = strtoupper($validated['seccion'] ?? '');

        if (empty($section)) {
            $existingSections = AcademicGroup::where('especialidad', $specialty->nombre)
                ->where('generacion', $validated['generacion'])
                ->pluck('seccion')
                ->map(fn($s) => strtoupper($s))
                ->toArray();

            foreach (range('A', 'Z') as $let) {
                if (!in_array($let, $existingSections)) {
                    $section = $let;
                    break;
                }
            }
            if (empty($section)) $section = 'A';
        }

        DB::transaction(function () use ($validated, $specialty, $generationStart, $section) {
            // A new cohort is always created as a complete six-semester route.
            // Only the matching semester is shown as current in the interface.
            $firstSemester = (int) $validated['semestre'];
            // El primer semestre siempre inaugura una generación completa: dejar
            // huecos en su ruta impediría promoverla correctamente en los ciclos
            // posteriores.
            $lastSemester = $firstSemester === 1 ? 6 : $firstSemester;

            for ($semester = $firstSemester; $semester <= $lastSemester; $semester++) {
                $this->createRouteGroup(
                    $semester,
                    $section,
                    $validated['generacion'],
                    $specialty,
                    $validated['turno'] ?? 'Matutino',
                    $semester === $firstSemester ? ($validated['docente_tutor_id'] ?: null) : null,
                    // Los semestres posteriores existen como ruta planeada, pero
                    // no quedan disponibles para inscripción hasta su promoción.
                    $semester === $firstSemester ? ($validated['activo'] ?? true) : false,
                    $generationStart,
                );
            }
        });

        $this->invalidateGrupoCache();

        return redirect()->back()->with('message', 'Ruta académica registrada correctamente.');
    }

    public function update(Request $request, int $id)
    {
        $group = AcademicGroup::findOrFail($id);
        $validated = $request->validate($this->rules($group));
        $specialty = Specialty::where('nombre', $validated['especialidad'])->firstOrFail();
        $semester = (int) $validated['semestre'];
        $section = strtoupper($validated['seccion']);

        $group->update([
            'codigo' => $this->groupCode($semester, $section, $specialty->codigo, $this->generationStart($validated['generacion'])),
            'nombre' => $this->groupName($semester, $section, $specialty->nombre),
            'semestre' => $semester,
            'seccion' => $section,
            'generacion' => $validated['generacion'],
            'turno' => $validated['turno'] ?? 'Matutino',
            'especialidad' => $specialty->nombre,
            'docente_tutor_id' => $validated['docente_tutor_id'] ?: null,
            'activo' => $validated['activo'] ?? true,
        ]);

        $this->invalidateGrupoCache();

        return redirect()->back()->with('message', 'Grupo actualizado correctamente.');
    }

    public function destroy(int $id)
    {
        $group = AcademicGroup::findOrFail($id);

        if (Enrollment::where('grupo_id', $group->id)->exists() || AcademicLoad::where('grupo_id', $group->id)->exists()) {
            return redirect()->back()->withErrors(['delete' => 'No puedes eliminar un grupo con historial académico. Desactívalo en su lugar.']);
        }

        $group->delete();
        $this->invalidateGrupoCache();
        return redirect()->back()->with('message', 'Grupo eliminado correctamente.');
    }

    private function rules(?AcademicGroup $group = null): array
    {
        return [
            'codigo' => 'nullable|string|max:30',
            'nombre' => 'nullable|string|max:100',
            'semestre' => 'required|integer|between:1,6',
            'seccion' => 'nullable|string|max:2',
            'generacion' => ['required', 'regex:/^\d{4}-\d{4}$/'],
            'turno' => 'nullable|string|max:30',
            'especialidad' => 'required|exists:especialidades,nombre',
            'docente_tutor_id' => 'nullable|exists:docentes,id',
            'activo' => 'nullable|boolean',
            'crear_escalera' => 'nullable|boolean',
        ];
    }

    private function createRouteGroup(int $semester, string $section, string $generation, Specialty $specialty, string $shift, ?int $tutorId, bool $active, int $generationStart): void
    {
        AcademicGroup::firstOrCreate(
            ['generacion' => $generation, 'semestre' => $semester, 'seccion' => $section, 'especialidad' => $specialty->nombre],
            [
                'codigo' => $this->groupCode($semester, $section, $specialty->codigo, $generationStart),
                'nombre' => $this->groupName($semester, $section, $specialty->nombre),
                'turno' => $shift,
                'docente_tutor_id' => $tutorId,
                'activo' => $active,
            ],
        );
    }

    private function generationStart(string $generation): int
    {
        return (int) explode('-', $generation)[0];
    }

    private function groupCode(int $semester, string $section, string $specialtyCode, int $generationStart): string
    {
        return sprintf('%d%s-%s-%d', $semester, $section, strtoupper($specialtyCode), $generationStart);
    }

    private function groupName(int $semester, string $section, string $specialty): string
    {
        return "{$semester}°{$section} {$specialty}";
    }

    private function assertOperatingCycle(): void
    {
        abort_unless(AcademicPeriodService::workingPeriod() !== null, 422, 'Debes crear un ciclo escolar antes de crear grupos.');
    }

    private function activeParity(): string
    {
        $period = AcademicPeriodService::workingPeriod();
        $month = (int) optional($period?->fecha_inicio)->format('m');
        return ($month >= 8 || $month === 1) ? 'odd' : 'even';
    }

    private function serialize(AcademicGroup $group): array
    {
        return [
            'id' => $group->id,
            'codigo' => $group->codigo,
            'nombre' => $group->nombre,
            'semestre' => $group->semestre,
            'seccion' => $group->seccion,
            'generacion' => $group->generacion,
            'turno' => $group->turno ?? 'Matutino',
            'especialidad' => $group->especialidad,
            'docente_tutor_id' => $group->docente_tutor_id,
            'profesor' => $group->tutor ? trim("{$group->tutor->user->nombre} {$group->tutor->user->apellido_paterno}") : 'Sin tutor asignado',
            'activo' => (bool) $group->activo,
        ];
    }

    private function invalidateGrupoCache(): void
    {
        Cache::add('admin:grupos:list:revision', 1, now()->addDays(30));
        Cache::increment('admin:grupos:list:revision');
        Cache::forget('admin_system_metrics');
        Cache::forget('catalog_grupos_select');
    }
}

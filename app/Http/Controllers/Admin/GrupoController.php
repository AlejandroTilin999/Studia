<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicGroup;
use App\Models\AcademicLoad;
use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use App\Models\Specialty;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GrupoController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        return Inertia::render('Admin/Grupos/Index', [
            'grupos' => Inertia::defer(function () use ($search) {
                return AcademicGroup::query()
                    ->when($search, fn ($query) => $query->where(function ($subQuery) use ($search) {
                        $subQuery->where('nombre', 'ilike', "%{$search}%")
                            ->orWhere('codigo', 'ilike', "%{$search}%")
                            ->orWhere('especialidad', 'ilike', "%{$search}%");
                    }))
                    ->with('tutor.user')
                    ->orderBy('generacion')->orderBy('semestre')->orderBy('seccion')
                    ->paginate(50)
                    ->through(fn (AcademicGroup $group) => $this->serialize($group))
                    ->withQueryString();
            }),
            'profesores' => Inertia::defer(fn () => Teacher::with('user')->get()->map(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'nombre_completo' => trim("{$teacher->user->nombre} {$teacher->user->apellido_paterno} " . ($teacher->user->apellido_materno ?? '')),
            ])),
            'especialidades' => Inertia::defer(fn () => Specialty::orderBy('nombre')->get(['id', 'nombre', 'codigo'])),
            'cycles' => Inertia::defer(fn () => AcademicPeriod::orderByDesc('fecha_inicio')->get()->map(fn (AcademicPeriod $cycle) => [
                'id' => $cycle->id, 'nombre' => $cycle->nombre, 'activo' => (bool) $cycle->activo, 'status' => $cycle->status,
            ])),
            'currentYear' => (int) optional(AcademicPeriod::query()->whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])->orderByDesc('fecha_inicio')->first())->fecha_inicio?->format('Y') ?: (int) date('Y'),
            'filters' => ['search' => $search],
            'isCycleActive' => AcademicPeriod::where('status', AcademicPeriod::STATUS_ACTIVE)->exists(),
            'activeParity' => $this->activeParity(),
            'canRegister' => AcademicPeriod::whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])->exists(),
        ]);
    }

    public function store(Request $request)
    {
        $this->assertOperatingCycle();
        $validated = $request->validate($this->rules());

        $specialty = Specialty::where('nombre', $validated['especialidad'])->firstOrFail();
        $generationStart = $this->generationStart($validated['generacion']);
        $section = strtoupper($validated['seccion']);

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

        return redirect()->back()->with('message', 'Grupo actualizado correctamente.');
    }

    public function destroy(int $id)
    {
        $group = AcademicGroup::findOrFail($id);

        if (Enrollment::where('grupo_id', $group->id)->exists() || AcademicLoad::where('grupo_id', $group->id)->exists()) {
            return redirect()->back()->withErrors(['delete' => 'No puedes eliminar un grupo con historial académico. Desactívalo en su lugar.']);
        }

        $group->delete();
        return redirect()->back()->with('message', 'Grupo eliminado correctamente.');
    }

    private function rules(?AcademicGroup $group = null): array
    {
        return [
            'codigo' => 'nullable|string|max:30',
            'nombre' => 'nullable|string|max:100',
            'semestre' => 'required|integer|between:1,6',
            'seccion' => 'required|string|size:1|alpha',
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
        abort_unless(AcademicPeriod::whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])->exists(), 422, 'Debes crear un ciclo escolar antes de crear grupos.');
    }

    private function activeParity(): string
    {
        $period = AcademicPeriod::query()->whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])->orderByDesc('fecha_inicio')->first();
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
}

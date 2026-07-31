<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\AcademicGroup;
use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Services\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->query('search'));
        $group = $request->query('group');
        $selectedCycleId = $request->query('cycle');

        // Consolidar consulta de períodos (1 sola query)
        $periods = AcademicPeriod::select('id', 'nombre', 'status', 'fecha_inicio')
            ->whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        $activeCycle = $periods->firstWhere('status', AcademicPeriod::STATUS_ACTIVE);
        $planningCycle = $periods->firstWhere('status', AcademicPeriod::STATUS_PLANNING);

        $workingCycle = null;
        if ($selectedCycleId) {
            $workingCycle = $periods->firstWhere('id', $selectedCycleId) ?? AcademicPeriod::find($selectedCycleId);
        }
        $workingCycle = $workingCycle ?: ($activeCycle ?: $planningCycle);

        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => Inertia::defer(function () use ($search, $group, $workingCycle) {
                if (!$workingCycle) return ['data' => [], 'total' => 0];

                // Consulta base de Alumnos filtrando por el ciclo actual
                $query = Student::select('alumnos.id', 'alumnos.usuario_id', 'alumnos.matricula', 'alumnos.fecha_nacimiento', 'alumnos.estatus')
                    ->whereHas('enrollments', fn($q) => $q->where('ciclo_id', $workingCycle->id));

                // BÚSQUEDA OPTIMIZADA CON ÍNDICES GIN / ILIKE EN SQL
                if (!empty($search)) {
                    $query->where(function ($q) use ($search) {
                        // Búsqueda directa por matrícula usando ilike
                        $q->where('alumnos.matricula', 'ilike', "%{$search}%")
                          // O búsqueda en la tabla users
                          ->orWhereHas('user', function ($qu) use ($search) {
                              $qu->whereRaw("nombre ilike ?", ["%{$search}%"])
                                ->orWhereRaw("apellido_paterno ilike ?", ["%{$search}%"])
                                ->orWhereRaw("apellido_materno ilike ?", ["%{$search}%"])
                                ->orWhereRaw("email ilike ?", ["%{$search}%"]);
                          });
                    });
                }

                // Filtro de Grupo
                if ($group && $group !== 'all') {
                    $query->whereHas('enrollments', function ($q) use ($group, $workingCycle) {
                        $q->where('grupo_id', $group)->where('ciclo_id', $workingCycle->id);
                    });
                }

                // Carga optimizada de relaciones
                return $query->with([
                    'user:id,nombre,apellido_paterno,apellido_materno,email,telefono',
                    'enrollments' => fn($q) => $q->where('ciclo_id', $workingCycle->id)
                        ->select('id', 'usuario_id', 'grupo_id', 'ciclo_id', 'estatus')
                        ->with('academicGroup:id,nombre')
                ])
                ->paginate(50)
                ->through(function ($student) use ($workingCycle) {
                    $currentEnrollment = $student->enrollments->firstWhere('ciclo_id', $workingCycle->id);
                    $user = $student->user;

                    return [
                        'id'               => $student->id,
                        'usuario_id'       => $student->usuario_id,
                        'nombre'           => $user ? "{$user->nombre} {$user->apellido_paterno} {$user->apellido_materno}" : 'Sin nombre',
                        'rawNombre'        => $user->nombre ?? '',
                        'rawPaterno'       => $user->apellido_paterno ?? '',
                        'rawMaterno'       => $user->apellido_materno ?? '',
                        'email'            => $user->email ?? 'Sin correo',
                        'matricula'        => $student->matricula,
                        'telefono'         => $user->telefono ?? '',
                        'fecha_nacimiento' => $student->fecha_nacimiento ?? '',
                        'grupo'            => $currentEnrollment && $currentEnrollment->academicGroup ? [
                            'id'     => $currentEnrollment->academicGroup->id,
                            'nombre' => $currentEnrollment->academicGroup->nombre,
                        ] : null,
                        'estatus'          => $currentEnrollment->estatus ?? 'active',
                        'calificaciones'   => [],
                    ];
                })
                ->withQueryString();
            }),

            'groups' => Inertia::defer(fn() => AcademicGroup::select('id', 'nombre', 'codigo', 'especialidad')->get()),

            'filters' => [
                'search' => $search,
                'group'  => $group,
                'cycle'  => $workingCycle ? $workingCycle->id : null
            ],

            'availableCycles' => $periods->map(fn($c) => [
                'id'     => $c->id,
                'nombre' => $c->nombre,
                'status' => $c->status
            ]),

            'isCycleActive' => (bool) $activeCycle,
            'canRegister'   => $periods->isNotEmpty(),
        ]);
    }

    public function store(Request $request)
    {
        $targetCycle = AcademicPeriod::select('id')
            ->whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])
            ->first();

        if (!$targetCycle) {
            return redirect()->back()->withErrors([
                'grupo_id' => 'Operación bloqueada. Debes tener un Ciclo Escolar vigente o en modo Planeación para inscribir alumnos.'
            ]);
        }

        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'nullable|string|max:255',
            'email'            => 'nullable|string|email|max:255',
            'matricula'        => 'required|string|max:50',
            'telefono'         => 'required|string|max:20',
            'fecha_nacimiento' => 'required|date',
            'grupo_id'         => 'required|exists:grupos,id',
        ]);

        $activeEnrollmentsCount = Enrollment::where('grupo_id', $request->grupo_id)
            ->where('estatus', 'active')
            ->count();

        if ($activeEnrollmentsCount >= 22) {
            return redirect()->back()->withErrors([
                'grupo_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
            ]);
        }

        $generatedEmail = $request->email;
        if (empty($generatedEmail) || User::where('email', $generatedEmail)->exists()) {
            $firstNamePart  = strtolower(explode(' ', trim($request->nombre))[0] ?? '');
            $paternoPartRaw = strtolower(explode(' ', trim($request->apellido_paterno))[0] ?? '');
            $firstNamePart  = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $firstNamePart));
            $paternoPart    = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $paternoPartRaw));

            $initials  = substr($firstNamePart, 0, 1) . substr($paternoPart, 0, 1);
            $emailBase = "{$firstNamePart}.{$paternoPart}.{$initials}";

            $counter = rand(10, 99);
            do {
                $generatedEmail = "{$emailBase}{$counter}@prepahidalgo.edu.mx";
                $counter++;
            } while (User::where('email', $generatedEmail)->exists());
        }

        // Búsqueda de matrícula optimizada
        $matriculaBase = $request->matricula;
        $existingCount = Student::where('matricula', 'like', "{$matriculaBase}%")->count();
        $finalMatricula = $existingCount > 0 
            ? $matriculaBase . chr(64 + $existingCount) 
            : $matriculaBase;

        $targetCycleId = $targetCycle->id;

        DB::transaction(function () use ($request, $generatedEmail, $finalMatricula, $targetCycleId) {
            $user = User::create([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $generatedEmail,
                'password'         => Hash::make('Prepahid2026'),
                'rol'              => 'alumno',
            ]);

            Student::create([
                'usuario_id'       => $user->id,
                'matricula'        => $finalMatricula,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'estatus'          => 'active',
            ]);

            Enrollment::create([
                'usuario_id'    => $user->id,
                'grupo_id'      => $request->grupo_id,
                'ciclo_id'      => $targetCycleId,
                'codigo_alumno' => $finalMatricula,
                'estatus'       => 'active',
            ]);
        });

        return redirect()->route('admin.alumnos.index');
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'nullable|string|max:255',
            'email'            => "required|string|email|max:255|unique:users,email,{$student->usuario_id}",
            'matricula'        => "required|string|max:50|unique:alumnos,matricula,{$student->id}",
            'telefono'         => 'required|string|max:20',
            'fecha_nacimiento' => 'required|date',
            'grupo_id'         => 'required|exists:grupos,id',
        ]);

        $currentGroupId = $student->enrollment ? $student->enrollment->grupo_id : null;
        if ($currentGroupId != $request->grupo_id) {
            $activeEnrollmentsCount = Enrollment::where('grupo_id', $request->grupo_id)
                ->where('estatus', 'active')
                ->count();

            if ($activeEnrollmentsCount >= 22) {
                return redirect()->back()->withErrors([
                    'grupo_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
                ]);
            }
        }

        DB::transaction(function () use ($request, $student) {
            User::where('id', $student->usuario_id)->update([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $request->email,
            ]);

            $student->update([
                'matricula'        => $request->matricula,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'estatus'          => $request->estatus ?? $student->estatus,
            ]);

            $targetCycle = AcademicPeriod::select('id')
                ->whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])
                ->first();

            $periodId = $targetCycle ? $targetCycle->id : null;

            if ($student->enrollment) {
                $student->enrollment->update([
                    'grupo_id'      => $request->grupo_id,
                    'codigo_alumno' => $request->matricula,
                    'estatus'       => $request->estatus ?? $student->enrollment->estatus,
                ]);
            } else {
                Enrollment::create([
                    'usuario_id'    => $student->usuario_id,
                    'grupo_id'      => $request->grupo_id,
                    'ciclo_id'      => $periodId,
                    'codigo_alumno' => $request->matricula,
                    'estatus'       => $request->estatus ?? 'active',
                ]);
            }
        });

        return redirect()->route('admin.alumnos.index');
    }

    public function toggleStatus($id)
    {
        $student = Student::findOrFail($id);
        $newStatus = (($student->estatus ?? 'active') === 'active') ? 'suspended' : 'active';

        DB::transaction(function () use ($student, $newStatus) {
            $student->update(['estatus' => $newStatus]);
            if ($student->enrollment) {
                $student->enrollment->update(['estatus' => $newStatus]);
            }
        });

        return redirect()->back()->with('message', 'Estado del alumno actualizado.');
    }

    public function getKardex($id)
    {
        $student = Student::select('id', 'usuario_id')->findOrFail($id);
        return response()->json([
            'kardex' => GradeService::getStudentKardex($student->usuario_id)
        ]);
    }

    public function destroy($id)
    {
        $student = Student::with('user:id,nombre')->findOrFail($id);

        $gradesCount = Grade::where('usuario_id', $student->usuario_id)->count();
        if ($gradesCount > 0) {
            $nombre = $student->user->nombre ?? 'Alumno';
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el expediente de '{$nombre}' porque ya cuenta con {$gradesCount} calificaciones asentadas en su historial."
            ]);
        }

        DB::transaction(function () use ($student) {
            Enrollment::where('usuario_id', $student->usuario_id)->delete();
            $userId = $student->usuario_id;
            $student->delete();

            if ($userId) {
                User::where('id', $userId)->delete();
            }
        });

        return redirect()->route('admin.alumnos.index');
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\AcademicGroup;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $group = $request->query('group');
        $selectedCycleId = $request->query('cycle');

        $activeCycle = \App\Models\AcademicPeriod::where('status', \App\Models\AcademicPeriod::STATUS_ACTIVE)->first();
        $planningCycle = \App\Models\AcademicPeriod::where('status', \App\Models\AcademicPeriod::STATUS_PLANNING)->first();

        // Determinar el ciclo de trabajo (Prioridad: Seleccionado > Activo > Planificación)
        $workingCycle = null;
        if ($selectedCycleId) {
            $workingCycle = \App\Models\AcademicPeriod::find($selectedCycleId);
        }

        if (!$workingCycle) {
            $workingCycle = $activeCycle ?: $planningCycle;
        }

        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => Inertia::defer(function () use ($search, $group, $workingCycle) {
                // Si no hay ciclo de trabajo, no hay alumnos operativos
                if (!$workingCycle) return ['data' => [], 'total' => 0];

                $query = Student::whereHas('user')
                    ->whereHas('enrollments', function($q) use ($workingCycle) {
                        $q->where('ciclo_id', $workingCycle->id);
                    })
                    ->with(['user', 'enrollments' => function($q) use ($workingCycle) {
                        $q->where('ciclo_id', $workingCycle->id)->with('academicGroup');
                    }]);

                if ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('matricula', 'like', "%{$search}%")
                            ->orWhereHas('user', function ($qu) use ($search) {
                                $qu->where('nombre', 'like', "%{$search}%")
                                    ->orWhere('apellido_paterno', 'like', "%{$search}%")
                                    ->orWhere('apellido_materno', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%");
                            });
                    });
                }

                if ($group && $group !== 'all') {
                    $query->whereHas('enrollments', function ($q) use ($group, $workingCycle) {
                        $q->where('grupo_id', $group)->where('ciclo_id', $workingCycle->id);
                    });
                }

                return $query->paginate(50)
                    ->through(function ($student) use ($workingCycle) {
                        $currentEnrollment = $student->enrollments->where('ciclo_id', $workingCycle->id)->first();

                        return [
                            'id' => $student->id,
                            'usuario_id' => $student->usuario_id,
                            'nombre' => $student->user ? $student->user->nombre_completo : 'Sin nombre',
                            'rawNombre' => $student->user->nombre ?? '',
                            'rawPaterno' => $student->user->apellido_paterno ?? '',
                            'rawMaterno' => $student->user->apellido_materno ?? '',
                            'email' => $student->user->email ?? 'Sin correo',
                            'matricula' => $student->matricula,
                            'telefono' => $student->user->telefono ?? '',
                            'fecha_nacimiento' => $student->fecha_nacimiento ?? '',
                            'grupo' => $currentEnrollment && $currentEnrollment->academicGroup ? [
                                'id' => $currentEnrollment->academicGroup->id,
                                'nombre' => $currentEnrollment->academicGroup->nombre,
                            ] : null,
                            'estatus' => $currentEnrollment->estatus ?? 'active',
                            'calificaciones' => [],
                        ];
                    })
                    ->withQueryString();
            }),
            'groups' => Inertia::defer(fn() => AcademicGroup::all()->map(function ($g) {
                return [
                    'id' => $g->id,
                    'nombre' => $g->nombre,
                    'codigo' => $g->codigo,
                    'especialidad' => $g->especialidad,
                ];
            })),
            'filters' => [
                'search' => $search,
                'group' => $group,
                'cycle' => $workingCycle ? $workingCycle->id : null
            ],
            'availableCycles' => \App\Models\AcademicPeriod::whereIn('status', [
                \App\Models\AcademicPeriod::STATUS_ACTIVE,
                \App\Models\AcademicPeriod::STATUS_PLANNING
            ])->orderBy('fecha_inicio', 'desc')->get()->map(fn($c) => [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'status' => $c->status
            ]),
            'isCycleActive' => (bool)$activeCycle,
            'canRegister' => \App\Models\AcademicPeriod::whereIn('status', [
                \App\Models\AcademicPeriod::STATUS_ACTIVE,
                \App\Models\AcademicPeriod::STATUS_PLANNING
            ])->exists()
        ]);
    }

    public function store(Request $request)
    {
        // [SAFETY LOCK v3.6] Permitir inscripciones en ciclos Activos o en Planeación
        $targetCycle = \App\Models\AcademicPeriod::whereIn('status', [
            \App\Models\AcademicPeriod::STATUS_ACTIVE,
            \App\Models\AcademicPeriod::STATUS_PLANNING
        ])->first();

        if (!$targetCycle) {
            return redirect()->back()->withErrors([
                'grupo_id' => 'Operación bloqueada. Debes tener un Ciclo Escolar vigente o en modo Planeación para inscribir alumnos.'
            ]);
        }

        $request->validate([
            'nombre'            => 'required|string|max:255',
            'apellido_paterno'  => 'required|string|max:255',
            'apellido_materno'  => 'nullable|string|max:255',
            'email'             => 'nullable|string|email|max:255',
            'matricula'         => 'required|string|max:50',
            'telefono'          => 'required|string|max:20',
            'fecha_nacimiento'  => 'required|date',
            'grupo_id'          => 'required|exists:grupos,id',
        ]);

        // Validar cupo del grupo (límite: 22 estudiantes por grupo)
        $activeEnrollmentsCount = Enrollment::where('grupo_id', $request->grupo_id)
            ->where('estatus', 'active')
            ->count();

        if ($activeEnrollmentsCount >= 22) {
            return redirect()->back()->withErrors([
                'grupo_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
            ]);
        }

        // [ESTANDARIZACIÓN v4.0] Generación de correo profesional sugerido por el frontend
        $generatedEmail = $request->email;

        // Si por alguna razón no viene el correo o ya existe, lo generamos/ajustamos
        if (empty($generatedEmail) || User::where('email', $generatedEmail)->exists()) {
            $firstNamePart  = strtolower(explode(' ', trim($request->nombre))[0] ?? '');
            $paternoPartRaw = strtolower(explode(' ', trim($request->apellido_paterno))[0] ?? '');
            $firstNamePart  = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $firstNamePart));
            $paternoPart    = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $paternoPartRaw));

            $initials = substr($firstNamePart, 0, 1) . substr($paternoPart, 0, 1);
            $emailBase = "{$firstNamePart}.{$paternoPart}.{$initials}";

            // Buscar un número único
            $counter = rand(10, 99);
            do {
                $generatedEmail = "{$emailBase}{$counter}@prepahidalgo.edu.mx";
                $counter++;
            } while (User::where('email', $generatedEmail)->exists());
        }

        // --- GARANTIZAR MATRÍCULA ÚNICA ---
        $matriculaBase = $request->matricula;
        $finalMatricula = $matriculaBase;
        $counter = 1;
        while (Student::where('matricula', $finalMatricula)->exists()) {
            $finalMatricula = $matriculaBase . chr(64 + $counter); // Agrega A, B, C...
            $counter++;
        }

        $targetCycleId = $targetCycle->id;

        DB::transaction(function () use ($request, $generatedEmail, $finalMatricula, $targetCycleId) {
            // 1. Crear el usuario correspondiente
            $user = User::create([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $generatedEmail,
                'password'         => Hash::make('Prepahid2026'),
                'rol'              => 'alumno',
            ]);

            // 2. Crear el perfil de estudiante
            Student::create([
                'usuario_id'       => $user->id,
                'matricula'        => $finalMatricula,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'estatus'          => 'active',
            ]);

            // 3. Registrar su inscripción en el grupo
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
            'nombre'            => 'required|string|max:255',
            'apellido_paterno'  => 'required|string|max:255',
            'apellido_materno'  => 'nullable|string|max:255',
            'email'             => "required|string|email|max:255|unique:users,email,{$student->usuario_id}",
            'matricula'         => "required|string|max:50|unique:alumnos,matricula,{$student->id}",
            'telefono'          => 'required|string|max:20',
            'fecha_nacimiento'  => 'required|date',
            'grupo_id'          => 'required|exists:grupos,id',
        ]);

        // Validar cupo del grupo si cambió de grupo
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
            // 1. Actualizar datos en la tabla general de usuarios
            $student->user->update([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $request->email,
            ]);

            // 2. Actualizar datos específicos de la tabla estudiantes
            $student->update([
                'matricula'        => $request->matricula,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'estatus'          => $request->estatus ?? $student->estatus,
            ]);

            // 3. Actualizar inscripción (traslado con historial o asignación inicial)
            $targetCycle = \App\Models\AcademicPeriod::whereIn('status', [
                \App\Models\AcademicPeriod::STATUS_ACTIVE,
                \App\Models\AcademicPeriod::STATUS_PLANNING
            ])->first();

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

        // 1. Determinar el nuevo estado
        // Usamos el estatus del alumno como fuente de verdad
        $currentStatus = $student->estatus ?? 'active';
        $newStatus = ($currentStatus === 'active') ? 'suspended' : 'active';

        // 2. Actualizar el alumno
        $student->update(['estatus' => $newStatus]);

        // 3. Sincronizar con la inscripción (si existe)
        if ($student->enrollment) {
            $student->enrollment->update(['estatus' => $newStatus]);
        }

        return redirect()->back()->with('message', 'Estado del alumno actualizado.');
    }

    /**
     * Obtiene el Kardex detallado de un alumno (Carga bajo demanda para velocidad)
     */
    public function getKardex($id)
    {
        $student = Student::findOrFail($id);
        $kardex = \App\Services\GradeService::getStudentKardex($student->usuario_id);

        return response()->json([
            'kardex' => $kardex
        ]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        // Verificar si tiene historial de calificaciones
        $gradesCount = \App\Models\Grade::where('usuario_id', $student->usuario_id)->count();
        if ($gradesCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el expediente de '{$student->nombre}' porque ya cuenta con {$gradesCount} calificaciones asentadas en su historial."
            ]);
        }

        DB::transaction(function () use ($student) {
            // 1. Eliminar inscripciones
            if ($student->enrollment) {
                $student->enrollment->delete();
            }

            // 2. Eliminar usuario asociado
            if ($student->user) {
                $student->user->delete();
            }

            // 3. Eliminar alumno
            $student->delete();
        });

        return redirect()->route('admin.alumnos.index');
    }
}

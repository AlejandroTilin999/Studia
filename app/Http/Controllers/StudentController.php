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
    public function index()
    {
        // Jalamos los alumnos trayendo el nombre, email de users e inscripción con grupo
        $alumnos = Student::with(['user', 'enrollment.academicGroup'])->get()->map(function ($student) {
            $nombreCompleto = trim("{$student->nombre} {$student->apellido_paterno} " . ($student->apellido_materno ?? ''));
            if (empty($nombreCompleto) && $student->user) {
                $nombreCompleto = $student->user->name;
            }
            return [
                'id' => $student->id,
                'user_id' => $student->user_id,
                'name' => $nombreCompleto ?: 'Sin nombre',
                'rawNombre' => $student->nombre ?? '',
                'rawPaterno' => $student->apellido_paterno ?? '',
                'rawMaterno' => $student->apellido_materno ?? '',
                'email' => $student->user->email ?? 'Sin correo',
                'matricula' => $student->matricula,
                'telefono' => $student->telefono ?? '',
                'fecha_nacimiento' => $student->fecha_nacimiento ?? '',
                'academic_group' => $student->enrollment && $student->enrollment->academicGroup ? [
                    'id' => $student->enrollment->academicGroup->id,
                    'name' => $student->enrollment->academicGroup->name,
                ] : null,
                'status' => $student->enrollment->status ?? 'active',
            ];
        });

        // Catálogo de grupos para el selector del formulario
        $groups = AcademicGroup::all()->map(function ($g) {
            return [
                'id' => $g->id,
                'name' => $g->name,
                'code' => $g->code,
                'major' => $g->major,
            ];
        });

        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => $alumnos,
            'groups' => $groups
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'            => 'required|string|max:255',
            'apellido_paterno'  => 'required|string|max:255',
            'apellido_materno'  => 'required|string|max:255',
            'email'             => 'required|string|email|max:255|unique:users,email',
            'matricula'         => 'required|string|max:50|unique:alumnos,matricula',
            'telefono'          => 'required|string|max:20',
            'fecha_nacimiento'  => 'required|date',
            'academic_group_id' => 'required|exists:grupos,id',
        ]);

        // Validar cupo del grupo (límite: 22 estudiantes por grupo)
        $activeEnrollmentsCount = Enrollment::where('academic_group_id', $request->academic_group_id)
            ->where('status', 'active')
            ->whereNull('fecha_baja')
            ->count();

        if ($activeEnrollmentsCount >= 22) {
            return redirect()->back()->withErrors([
                'academic_group_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
            ]);
        }

        DB::transaction(function () use ($request) {
            // 1. Crear primero las credenciales de acceso en users
            $fullName = trim("{$request->nombre} {$request->apellido_paterno} " . ($request->apellido_materno ?? ''));
            $user = User::create([
                'name'     => $fullName,
                'email'    => $request->email,
                'password' => Hash::make('Prepahid2026'), 
                'role'     => 'alumno',
            ]);

            Student::create([
                'user_id'          => $user->id,
                'matricula'        => $request->matricula,
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'fecha_nacimiento' => $request->fecha_nacimiento,
            ]);

            // 3. Registrar su inscripción en el grupo
            $activePeriod = \App\Models\AcademicPeriod::where('is_active', true)->first();
            $periodId = $activePeriod ? $activePeriod->id : null;

            Enrollment::create([
                'user_id'           => $user->id,
                'academic_group_id' => $request->academic_group_id,
                'academic_period_id'=> $periodId,
                'student_code'      => $request->matricula,
                'status'            => 'active',
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
            'apellido_materno'  => 'required|string|max:255',
            'email'             => "required|string|email|max:255|unique:users,email,{$student->user_id}",
            'matricula'         => "required|string|max:50|unique:alumnos,matricula,{$student->id}",
            'telefono'          => 'required|string|max:20',
            'fecha_nacimiento'  => 'required|date',
            'academic_group_id' => 'required|exists:grupos,id',
        ]);

        // Validar cupo del grupo si cambió de grupo
        $currentGroupId = $student->enrollment ? $student->enrollment->academic_group_id : null;
        if ($currentGroupId != $request->academic_group_id) {
            $activeEnrollmentsCount = Enrollment::where('academic_group_id', $request->academic_group_id)
                ->where('status', 'active')
                ->whereNull('fecha_baja')
                ->count();

            if ($activeEnrollmentsCount >= 22) {
                return redirect()->back()->withErrors([
                    'academic_group_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
                ]);
            }
        }

        DB::transaction(function () use ($request, $student) {
            // 1. Actualizar datos en la tabla general de usuarios
            $fullName = trim("{$request->nombre} {$request->apellido_paterno} " . ($request->apellido_materno ?? ''));
            $student->user->update([
                'name'  => $fullName,
                'email' => $request->email,
            ]);

            // 2. Actualizar datos específicos de la tabla estudiantes
            $student->update([
                'matricula'        => $request->matricula,
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'fecha_nacimiento' => $request->fecha_nacimiento,
            ]);

            // 3. Actualizar inscripción (traslado con historial o asignación inicial)
            $activePeriod = \App\Models\AcademicPeriod::where('is_active', true)->first();
            $periodId = $activePeriod ? $activePeriod->id : null;

            if ($student->enrollment) {
                $student->enrollment->update([
                    'academic_group_id' => $request->academic_group_id,
                    'student_code'      => $request->matricula,
                    'status'            => $request->status ?? $student->enrollment->status,
                ]);
            } else {
                Enrollment::create([
                    'user_id'           => $student->user_id,
                    'academic_group_id' => $request->academic_group_id,
                    'academic_period_id'=> $periodId,
                    'student_code'      => $request->matricula,
                    'status'            => $request->status ?? 'active',
                ]);
            }
        });

        return redirect()->route('admin.alumnos.index');
    }

    public function toggleStatus($id)
    {
        $student = Student::findOrFail($id);
        if ($student->enrollment) {
            $newStatus = $student->enrollment->status === 'active' ? 'suspended' : 'active';
            $student->enrollment->update(['status' => $newStatus]);
        }
        return redirect()->route('admin.alumnos.index');
    }

    /**
     * API: Kardex del alumno - retorna calificaciones finales desde Supabase
     */
    public function kardex($userId)
    {
        // Buscar todas las cargas académicas del grupo del alumno
        $enrollment = \App\Models\Enrollment::where('user_id', $userId)
            ->where('status', 'active')
            ->with('academicGroup')
            ->first();

        if (!$enrollment) {
            return response()->json(['grades' => []]);
        }

        // Obtener todas las cargas del grupo del alumno
        $loads = \App\Models\AcademicLoad::where('academic_group_id', $enrollment->academic_group_id)
            ->with(['course', 'academicPeriod'])
            ->get();

        $grades = [];
        foreach ($loads as $load) {
            for ($parcial = 1; $parcial <= 3; $parcial++) {
                $criteria = \App\Models\CriterioEvaluacion::where('carga_id', $load->id)
                    ->where('parcial', $parcial)
                    ->get();

                if ($criteria->isEmpty()) continue;

                // Calcular el promedio del parcial para este alumno
                $totalScore = 0;
                $hasAllScores = true;

                foreach ($criteria as $criterion) {
                    $grade = \App\Models\Grade::where('criterio_id', $criterion->id)
                        ->where('user_id', $userId)
                        ->first();

                    if (!$grade || $grade->score === '') {
                        $hasAllScores = false;
                        break;
                    }

                    $totalScore += (float)$grade->score * ($criterion->porcentaje / 100);
                }

                if ($hasAllScores) {
                    $grades[] = [
                        'subject' => $load->course->name ?? 'N/A',
                        'score' => round($totalScore, 1),
                        'period' => "Parcial {$parcial} - " . ($load->academicPeriod->name ?? 'Ciclo Actual'),
                    ];
                }
            }
        }

        return response()->json(['grades' => $grades]);
    }
}
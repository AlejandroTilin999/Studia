<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\AcademicGroup;
use App\Models\Grade;
use App\Models\AcademicLoad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $activePeriod = \App\Models\AcademicPeriod::where('is_active', true)->first();
        $activePeriodId = $activePeriod ? $activePeriod->id : null;

        $alumnosQuery = Student::query();

        if ($activePeriodId) {
            // Solo alumnos que tienen una inscripción en el ciclo activo
            $alumnosQuery->whereHas('enrollments', function ($q) use ($activePeriodId) {
                $q->where('academic_period_id', $activePeriodId);
            });
        } else {
            // Si no hay ciclo activo, no mostrar ningún alumno
            $alumnosQuery->whereRaw('1 = 0');
        }

        // Filtro de búsqueda
        if ($search) {
            $alumnosQuery->where(function ($query) use ($search) {
                $query->where('matricula', 'ILIKE', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('name', 'ILIKE', "%{$search}%")
                            ->orWhere('email', 'ILIKE', "%{$search}%");
                      });
            });
        }

        $alumnos = $alumnosQuery->with([
            'user',
            'enrollments' => function ($q) use ($activePeriodId) {
                $q->where('academic_period_id', $activePeriodId);
            },
            'enrollments.academicGroup',
            'enrollments.grades.course'
        ])->get()->map(function ($student) use ($activePeriodId) {
            $enrollment = $student->enrollments->where('academic_period_id', $activePeriodId)->first();
            return [
                'id' => $student->id,
                'user_id' => $student->user_id,
                'name' => $student->user->name ?? 'Sin nombre',
                'email' => $student->user->email ?? 'Sin correo',
                'matricula' => $student->matricula,
                'telefono' => $student->telefono ?? '',
                'fecha_nacimiento' => $student->fecha_nacimiento ?? '',
                'status' => $enrollment->status ?? 'active',
                'academic_group' => $enrollment && $enrollment->academicGroup ? [
                    'id' => $enrollment->academicGroup->id,
                    'name' => $enrollment->academicGroup->name,
                ] : null,
                'grades' => $enrollment ? $enrollment->grades : [],
            ];
        });

        $groups = AcademicGroup::all();

        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => $alumnos,
            'groups' => $groups
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'academic_group_id' => 'required|integer|exists:academic_groups,id',
            'status' => 'required|string|in:active,suspended',
            'telefono' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            // 1. Crear primero las credenciales de acceso en users
            $user = User::create([
                'name' => $request->nombre,
                'email' => $request->email,
                'password' => Hash::make('Prepahid2026'), // Contraseña por defecto
                'role' => 'alumno',
            ]);

            // 2. Generar matrícula incremental secuencial (Ej: P004)
            $latest = Enrollment::latest('id')->first();
            $nextId = $latest ? $latest->id + 1 : 1;
            $studentCode = 'P' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

            // 3. Crear los metadatos del estudiante
            Student::create([
                'user_id' => $user->id,
                'matricula' => $studentCode,
                'telefono' => $request->telefono,
            ]);

            // Obtener ciclo escolar activo real de base de datos
            $activePeriod = \App\Models\AcademicPeriod::where('is_active', true)->first();
            $activePeriodId = $activePeriod ? $activePeriod->id : 1;

            // 4. Crear la inscripción correspondiente
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'academic_group_id' => $request->academic_group_id,
                'academic_period_id' => $activePeriodId,
                'student_code' => $studentCode,
                'status' => $request->status,
            ]);

            // 5. Vincular materias de la carga académica automáticamente
            $loads = AcademicLoad::where('academic_group_id', $request->academic_group_id)
                ->where('academic_period_id', $activePeriodId)
                ->get();

            foreach ($loads as $load) {
                Grade::create([
                    'enrollment_id' => $enrollment->id,
                    'course_id'     => $load->course_id,
                    'score'         => 0.00,
                    'period'        => 'Parcial 1',
                ]);
            }
        });

        return redirect()->route('admin.alumnos.index');
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => "required|string|email|max:255|unique:users,email,{$student->user_id}",
            'academic_group_id' => 'required|integer|exists:academic_groups,id',
            'status' => 'required|string|in:active,suspended',
            'telefono' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request, $student) {
            // 1. Actualizar datos en la tabla general de usuarios
            $student->user->update([
                'name' => $request->nombre,
                'email' => $request->email,
            ]);

            // 2. Actualizar datos del estudiante
            $student->update([
                'telefono' => $request->telefono,
            ]);

            // 3. Actualizar o crear inscripción académica (Enrollment)
            $enrollment = Enrollment::where('user_id', $student->user_id)->first();
            if ($enrollment) {
                $oldGroupId = $enrollment->academic_group_id;
                $enrollment->update([
                    'academic_group_id' => $request->academic_group_id,
                    'status' => $request->status,
                ]);

                // Si cambió de grupo, registrar automáticamente las nuevas materias asociadas
                if ($oldGroupId != $request->academic_group_id) {
                    $loads = AcademicLoad::where('academic_group_id', $request->academic_group_id)
                        ->where('academic_period_id', $enrollment->academic_period_id)
                        ->get();

                    foreach ($loads as $load) {
                        $gradeExists = Grade::where('enrollment_id', $enrollment->id)
                            ->where('course_id', $load->course_id)
                            ->exists();

                        if (!$gradeExists) {
                            Grade::create([
                                'enrollment_id' => $enrollment->id,
                                'course_id'     => $load->course_id,
                                'score'         => 0.00,
                                'period'        => 'Parcial 1',
                            ]);
                        }
                    }
                }
            } else {
                // Obtener ciclo escolar activo real de base de datos
                $activePeriod = \App\Models\AcademicPeriod::where('is_active', true)->first();
                $activePeriodId = $activePeriod ? $activePeriod->id : 1;

                $enrollment = Enrollment::create([
                    'user_id' => $student->user_id,
                    'academic_group_id' => $request->academic_group_id,
                    'academic_period_id' => $activePeriodId,
                    'student_code' => $student->matricula,
                    'status' => $request->status,
                ]);

                $loads = AcademicLoad::where('academic_group_id', $request->academic_group_id)
                    ->where('academic_period_id', $activePeriodId)
                    ->get();

                foreach ($loads as $load) {
                    Grade::create([
                        'enrollment_id' => $enrollment->id,
                        'course_id'     => $load->course_id,
                        'score'         => 0.00,
                        'period'        => 'Parcial 1',
                    ]);
                }
            }
        });

        return redirect()->route('admin.alumnos.index');
    }

    public function toggleStatus($id)
    {
        $student = Student::findOrFail($id);
        $enrollment = Enrollment::where('user_id', $student->user_id)->first();
        if ($enrollment) {
            $enrollment->status = $enrollment->status === 'active' ? 'suspended' : 'active';
            $enrollment->save();
        }
        return redirect()->route('admin.alumnos.index');
    }
}
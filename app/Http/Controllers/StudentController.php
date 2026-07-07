<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\AcademicGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        // Jalamos los alumnos trayendo el nombre y email de la tabla users relacionada, más relaciones académicas
        $alumnos = Student::with(['user', 'enrollment.academicGroup', 'enrollment.grades.course'])->get()->map(function ($student) {
            $enrollment = $student->enrollment;
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

            // 4. Crear la inscripción correspondiente
            Enrollment::create([
                'user_id' => $user->id,
                'academic_group_id' => $request->academic_group_id,
                'academic_period_id' => 1,
                'student_code' => $studentCode,
                'status' => $request->status,
            ]);
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
                $enrollment->update([
                    'academic_group_id' => $request->academic_group_id,
                    'status' => $request->status,
                ]);
            } else {
                Enrollment::create([
                    'user_id' => $student->user_id,
                    'academic_group_id' => $request->academic_group_id,
                    'academic_period_id' => 1,
                    'student_code' => $student->matricula,
                    'status' => $request->status,
                ]);
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
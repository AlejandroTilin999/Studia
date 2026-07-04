<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\AcademicGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Consultamos la tabla enrollments ligada a users, academic_groups y las calificaciones (grades con su course)
        $students = Enrollment::with(['user', 'academicGroup', 'grades.course'])
            ->when($search, function ($query, $search) {
                $query->where('student_code', 'ILIKE', "%{$search}%")
                      ->orWhereHas('user', function($q) use ($search) {
                          $q->where('name', 'ILIKE', "%{$search}%")
                            ->orWhere('email', 'ILIKE', "%{$search}%");
                      });
            })->get();

        // Traemos los grupos de la tabla 'academic_groups' para rellenar los selects en React
        $groups = AcademicGroup::all();

        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => $students,
            'groups' => $groups
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'academic_group_id' => 'required|integer|exists:academic_groups,id',
            'status' => 'required|string|in:active,suspended',
        ]);

        // 1. Guardamos los datos de la cuenta en la tabla 'users'
        $user = User::create([
            'name' => $validated['nombre'],
            'email' => $validated['email'],
            'password' => bcrypt('studia123') // Contraseña genérica inicial
        ]);

        // 2. Generamos una matrícula incremental secuencial (Ej: P004)
        $latest = Enrollment::latest('id')->first();
        $nextId = $latest ? $latest->id + 1 : 1;
        $studentCode = 'P' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        // 3. Insertamos el estatus de Alumno en la tabla 'enrollments'
        Enrollment::create([
            'user_id' => $user->id,
            'academic_group_id' => $validated['academic_group_id'],
            'academic_period_id' => 1, // Asignado al primer periodo escolar por defecto
            'student_code' => $studentCode,
            'status' => $validated['status']
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $enrollment = Enrollment::findOrFail($id);
        
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $enrollment->user_id,
            'academic_group_id' => 'required|integer|exists:academic_groups,id',
            'status' => 'required|string|in:active,suspended',
        ]);

        // Actualizamos los campos en 'users'
        $enrollment->user->update([
            'name' => $validated['nombre'],
            'email' => $validated['email']
        ]);

        // Actualizamos los campos en 'enrollments'
        $enrollment->update([
            'academic_group_id' => $validated['academic_group_id'],
            'status' => $validated['status']
        ]);

        return redirect()->back();
    }

    public function toggleStatus($id)
    {
        $enrollment = Enrollment::findOrFail($id);
        $enrollment->status = $enrollment->status === 'active' ? 'suspended' : 'active';
        $enrollment->save();

        return redirect()->back();
    }
}
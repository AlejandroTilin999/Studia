<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        // Jalamos los alumnos trayendo el nombre y email de la tabla users relacionada
        $alumnos = Student::with('user')->get()->map(function ($student) {
            return [
                'id' => $student->id, // ID del estudiante
                'user_id' => $student->user_id,
                'name' => $student->user->name ?? 'Sin nombre',
                'email' => $student->user->email ?? 'Sin correo',
                'matricula' => $student->matricula,
                'telefono' => $student->telefono ?? '',
                'fecha_nacimiento' => $student->fecha_nacimiento ?? '',
            ];
        });

        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => $alumnos
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'matricula' => 'required|string|max:50|unique:students,matricula',
            'telefono' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            // 1. Crear primero las credenciales de acceso en users
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('Prepahid2026'), // Contraseña por defecto
                'role' => 'alumno',
            ]);

            // 2. Crear los metadatos del estudiante amarrados a ese user_id
            Student::create([
                'user_id' => $user->id,
                'matricula' => $request->matricula,
                'telefono' => $request->telefono,
            ]);
        });

        return redirect()->route('admin.alumnos.index');
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|string|email|max:255|unique:users,email,{$student->user_id}",
            'matricula' => "required|string|max:50|unique:students,matricula,{$student->id}",
            'telefono' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request, $student) {
            // 1. Actualizar datos en la tabla general de usuarios
            $student->user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            // 2. Actualizar datos específicos de la tabla estudiantes
            $student->update([
                'matricula' => $request->matricula,
                'telefono' => $request->telefono,
            ]);
        });

        return redirect()->route('admin.alumnos.index');
    }
}
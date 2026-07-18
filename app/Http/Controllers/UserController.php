<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'nombre' => $u->nombre_completo,
                'email' => $u->email,
                'rol' => $u->rol ?? 'admin',
                'estatus' => ($u->activo !== false) ? 'active' : 'inactive',
                'telefono' => $u->telefono ?? '',
            ];
        });

        return Inertia::render('Admin/Usuarios/Index', [
            'dbUsers' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'nullable|string|max:255',
            'email'            => 'required|string|email|max:255|unique:users,email',
            'rol'              => 'required|string|in:admin,docente,alumno',
            'estatus'          => 'required|string|in:active,inactive',
            'password'         => 'required|string|min:6',
            'telefono'         => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'email'            => $request->email,
                'password'         => Hash::make($request->password),
                'rol'              => $request->rol,
                'activo'           => $request->estatus === 'active',
                'telefono'         => $request->telefono,
            ]);

            if ($request->rol === 'docente') {
                Teacher::create([
                    'usuario_id'       => $user->id,
                    'codigo_empleado'  => 'EMP-' . mt_rand(1000, 9999),
                    'especialidad'     => 'General',
                ]);
            } elseif ($request->rol === 'alumno') {
                Student::create([
                    'usuario_id' => $user->id,
                    'matricula'  => 'ALU-' . mt_rand(10000, 99999),
                ]);
            }
        });

        return redirect()->back()->with('message', 'Usuario registrado con éxito.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'nullable|string|max:255',
            'email'            => "required|string|email|max:255|unique:users,email,{$user->id}",
            'rol'              => 'required|string|in:admin,docente,alumno',
            'estatus'          => 'required|string|in:active,inactive',
            'telefono'         => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request, $user) {
            $user->update([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'email'            => $request->email,
                'rol'              => $request->rol,
                'activo'           => $request->estatus === 'active',
                'telefono'         => $request->telefono,
            ]);
        });

        return redirect()->back()->with('message', 'Usuario actualizado con éxito.');
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->activo = !$user->activo;
        $user->save();

        return redirect()->back()->with('message', 'Estado del usuario actualizado.');
    }

    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->password = Hash::make('Prepahid2026');
        $user->save();

        return redirect()->back()->with('message', 'Contraseña restablecida a: Prepahid2026');
    }
}

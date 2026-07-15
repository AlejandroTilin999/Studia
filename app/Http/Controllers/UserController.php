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
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role ?? 'admin',
                'status' => ($u->activo !== false) ? 'active' : 'inactive',
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => 'required|string|in:admin,docente,alumno',
            'status' => 'required|string|in:active,inactive',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'activo' => $request->status === 'active',
                'telefono' => $request->phone,
            ]);

            // Si es docente o alumno, crear perfil base si no existe
            if ($request->role === 'docente') {
                Teacher::create([
                    'user_id' => $user->id,
                    'employee_code' => 'EMP-' . mt_rand(1000, 9999),
                    'nombre' => $request->name,
                    'apellido_paterno' => 'Docente',
                    'specialty' => 'General',
                ]);
            } elseif ($request->role === 'alumno') {
                Student::create([
                    'user_id' => $user->id,
                    'matricula' => 'ALU-' . mt_rand(10000, 99999),
                ]);
            }
        });

        return redirect()->back()->with('message', 'Usuario registrado con éxito.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|string|email|max:255|unique:users,email,{$user->id}",
            'role' => 'required|string|in:admin,docente,alumno',
            'status' => 'required|string|in:active,inactive',
            'phone' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request, $user) {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role,
                'activo' => $request->status === 'active',
                'telefono' => $request->phone,
            ]);

            // Sincronizar perfiles
            if ($user->role === 'docente' && $user->teacher) {
                $user->teacher->update([
                    'nombre' => $request->name,
                ]);
            } elseif ($user->role === 'alumno' && $user->student) {
                // Si existe alumno
            }
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

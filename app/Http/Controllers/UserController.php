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
    public function index(Request $request)
    {
        $search = $request->query('search');

        return Inertia::render('Admin/Usuarios/Index', [
            'dbUsers' => Inertia::defer(function () use ($search) {
                $query = User::query();

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('nombre', 'like', "%{$search}%")
                          ->orWhere('apellido_paterno', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
                }

                return $query->orderBy('created_at', 'desc')
                    ->paginate(50)
                    ->through(function ($u) {
                        return [
                            'id' => $u->id,
                            'nombre' => $u->nombre_completo,
                            'email' => $u->email,
                            'rol' => $u->rol ?? 'admin',
                            'estatus' => ($u->activo !== false) ? 'active' : 'inactive',
                            'telefono' => $u->telefono ?? '',
                        ];
                    })
                    ->withQueryString();
            }),
            'resetRequests' => Inertia::defer(fn() => \App\Models\PasswordResetRequest::where('status', 'pendiente')
                ->with('user:id,nombre,apellido_paterno,apellido_materno')
                ->latest()
                ->get()
                ->map(fn($r) => [
                    'id' => $r->id,
                    'nombre' => $r->user->nombre_completo ?? 'Usuario desconocido',
                    'email' => $r->email,
                    'fecha' => $r->created_at->diffForHumans(),
                ])),
            'filters' => [
                'search' => $search
            ],
            // [NEW v3.3] Conteos diferidos para cargadores
            'userStats' => Inertia::defer(fn() => [
                'total' => User::count(),
                'admins' => User::where('rol', 'admin')->count(),
                'teachers' => User::where('rol', 'docente')->count(),
                'students' => User::where('rol', 'alumno')->count(),
                'active' => User::where('activo', true)->count(),
            ])
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
        $user->update([
            'password' => Hash::make('Prepahid2026'),
            'password_changed' => false,
        ]);

        return redirect()->back()->with('message', 'Contraseña restablecida a: Prepahid2026');
    }

    public function approveReset($id)
    {
        $request = \App\Models\PasswordResetRequest::findOrFail($id);
        $user = $request->user;

        DB::transaction(function () use ($request, $user) {
            $user->update([
                'password' => Hash::make('Prepahid2026'),
                'password_changed' => false,
            ]);

            $request->update(['status' => 'resuelto']);

            // Limpiar notificaciones de reset para este usuario
            \App\Models\Notificacion::where('titulo', 'Solicitud de Restablecimiento')
                ->where('mensaje', 'LIKE', "%{$user->email}%")
                ->delete();
        });

        return redirect()->back()->with('message', "Contraseña de {$user->nombre} restablecida con éxito.");
    }
}

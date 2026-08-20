<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $revision = Cache::get('admin:users:list:revision', 1);
        $page = max(1, (int) $request->query('page', 1));
        $cacheKey = "admin:users:list:{$revision}:{$page}:" . md5((string) $search);

        $cachedUsers = Cache::remember($cacheKey, 600, function () use ($search, $page) {
            $query = User::query();

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhere('apellido_paterno', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $totalCount = (clone $query)->count();
            $perPage = 50;

            $results = $query->orderBy('created_at', 'desc')
                ->forPage($page, $perPage)
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'nombre' => $u->nombre_completo,
                        'email' => $u->email,
                        'rol' => $u->rol ?? 'admin',
                        'estatus' => ($u->activo !== false) ? 'active' : 'inactive',
                        'telefono' => $u->telefono ?? '',
                    ];
                });

            return new \Illuminate\Pagination\LengthAwarePaginator(
                $results,
                $totalCount,
                $perPage,
                $page,
                [
                    'path' => \Illuminate\Pagination\LengthAwarePaginator::resolveCurrentPath(),
                    'query' => request()->query(),
                ]
            );
        });

        return Inertia::render('Admin/Usuarios/Index', [
            'dbUsers' => $cachedUsers,
            'resetRequests' => fn() => Cache::remember('admin_pending_password_resets', 60, function() {
                return \App\Models\PasswordResetRequest::where('status', 'pendiente')
                    ->with('user:id,nombre,apellido_paterno,apellido_materno')
                    ->latest()
                    ->get()
                    ->map(fn($r) => [
                        'id' => $r->id,
                        'nombre' => $r->user?->nombre_completo ?? 'Usuario desconocido',
                        'email' => $r->email,
                        'fecha' => $r->created_at ? $r->created_at->diffForHumans() : '',
                    ])->all();
            }),
            'filters' => [
                'search' => $search
            ],
            'userStats' => Cache::remember('admin_users_stats_cache', 120, function() {
                $raw = \DB::selectOne("
                    SELECT 
                        COUNT(*) as total,
                        COUNT(CASE WHEN rol = 'admin' THEN 1 END) as admins,
                        COUNT(CASE WHEN rol = 'docente' THEN 1 END) as teachers,
                        COUNT(CASE WHEN rol = 'alumno' THEN 1 END) as students,
                        COUNT(CASE WHEN activo = true THEN 1 END) as active
                    FROM users
                ");
                return [
                    'total' => (int)($raw->total ?? 0),
                    'admins' => (int)($raw->admins ?? 0),
                    'teachers' => (int)($raw->teachers ?? 0),
                    'students' => (int)($raw->students ?? 0),
                    'active' => (int)($raw->active ?? 0),
                ];
            })
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

        $this->invalidateCache();
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

        $this->invalidateCache($user->id);
        return redirect()->back()->with('message', 'Usuario actualizado con éxito.');
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->activo = !$user->activo;
        $user->save();

        $this->invalidateCache($user->id);
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

            // Enviar correo de notificación al alumno/docente con estética tipo GitHub / Brevo
            try {
                $asunto = "Restablecimiento de Contraseña - Preparatoria Particular Hidalgo";
                $html = '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px;">
  <!-- Encabezado Azul Rectangular con Logo Blanco -->
  <div style="background-color: #0266E0; padding: 26px 30px; text-align: center; border-radius: 0px;">
    <img src="https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/logo-ph-blanco.png" alt="Preparatoria Particular Hidalgo" style="max-height: 48px; width: auto; display: inline-block;" />
  </div>

  <!-- Cuerpo del Correo -->
  <div style="padding: 30px 25px; color: #1e293b;">
    <h2 style="color: #0266E0; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">Contraseña Restablecida con Éxito</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">Hola <strong>' . htmlspecialchars($user->nombre_completo) . '</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Tu solicitud de restablecimiento de contraseña ha sido autorizada por la Dirección Escolar. Aquí tienes tus credenciales para ingresar:</p>
    
    <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #0266E0; border-radius: 0px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #1e293b;"><strong>Usuario / Correo:</strong> ' . htmlspecialchars($user->email) . '</p>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #1e293b;"><strong>Nueva Contraseña Temporal:</strong> Prepahid2026</p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="' . url('/login') . '" style="background-color: #0266E0; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 13px; font-weight: bold; display: inline-block; border-radius: 6px;">Iniciar Sesión en Prepahid</a>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Por seguridad, te solicitará cambiar tu contraseña una vez que inicies sesión.</p>
  </div>

  <!-- Pie de página Rectangular -->
  <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0px;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© ' . date('Y') . ' Preparatoria Particular Hidalgo · Todos los derechos reservados.</p>
  </div>
</div>';

                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\DynamicTemplateEmail($asunto, $html));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error enviando correo de restablecimiento: ' . $e->getMessage());
            }
        });

        $this->invalidateCache($user->id);

        return redirect()->back()->with('message', "Contraseña de {$user->nombre} restablecida con éxito. Se le envió correo de notificación.");
    }

    private function invalidateCache(?int $userId = null): void
    {
        Cache::add('admin:users:list:revision', 1, now()->addDays(30));
        Cache::increment('admin:users:list:revision');
        Cache::forget('admin_users_stats_cache');
        Cache::forget('admin_system_metrics');
        Cache::forget('admin_pending_password_resets');
        if ($userId) {
            Cache::forget("user_auth_{$userId}");
            Cache::forget("sidebar_alumno_{$userId}");
            Cache::forget("sidebar_docente_{$userId}");
            Cache::forget("student_enrollment_{$userId}");
        }
    }
}

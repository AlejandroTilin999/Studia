<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'acceso' => $request->get('acceso', 'alumno'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['No pudimos encontrar un usuario registrado con este correo electrónico.'],
            ]);
        }

        // Crear o actualizar la solicitud a pendiente
        \App\Models\PasswordResetRequest::updateOrCreate(
            [
                'user_id' => $user->id,
                'email' => $request->email,
            ],
            [
                'status' => 'pendiente',
            ]
        );

        // Notificar a todos los administradores
        $admins = \App\Models\User::where('rol', 'admin')->get();
        foreach ($admins as $admin) {
            \App\Models\Notificacion::create([
                'usuario_id' => $admin->id,
                'titulo' => 'Solicitud de Restablecimiento',
                'mensaje' => "El usuario {$user->nombre_completo} ({$user->email}) ha solicitado restablecer su contraseña.",
                'leido' => false,
            ]);
        }

        return back()->with('status', 'Tu solicitud de restablecimiento ha sido registrada. Por favor, solicita a la dirección o personal administrativo que apruebe tu cambio de contraseña.');
    }
}

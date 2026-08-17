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

        // Enviar correo de confirmación de solicitud al usuario (Vía Brevo)
        try {
            $asunto = "Solicitud de Restablecimiento de Contraseña Recibida - Prepahid";
            $html = '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px;">
  <!-- Encabezado Azul Rectangular con Logo Blanco -->
  <div style="background-color: #0266E0; padding: 26px 30px; text-align: center; border-radius: 0px;">
    <img src="https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/logo-ph-blanco.png" alt="Preparatoria Particular Hidalgo" style="max-height: 48px; width: auto; display: inline-block;" />
  </div>

  <!-- Cuerpo del Correo -->
  <div style="padding: 30px 25px; color: #1e293b;">
    <h2 style="color: #0266E0; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">Solicitud de Restablecimiento Registrada</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">Hola <strong>' . htmlspecialchars($user->nombre_completo) . '</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hemos recibido tu solicitud para restablecer la contraseña de tu cuenta escolar en Prepahid.</p>
    
    <div style="background-color: #f8fafc; padding: 18px; border-left: 4px solid #0266E0; border-radius: 0px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #1e293b;"><strong>Estatus:</strong> Pendiente de Aprobación por Dirección Escolar</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Una vez que el personal administrativo apruebe la solicitud, recibirás tus credenciales activas por este mismo correo.</p>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Si tú no realizaste esta solicitud, por favor notifícalo a la brevedad a la administración.</p>
  </div>

  <!-- Pie de página Rectangular -->
  <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0px;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© ' . date('Y') . ' Preparatoria Particular Hidalgo · Todos los derechos reservados.</p>
  </div>
</div>';

            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\DynamicTemplateEmail($asunto, $html));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando notificación de solicitud a usuario: ' . $e->getMessage());
        }

        return back()->with('status', 'Tu solicitud de restablecimiento ha sido registrada y notificada por correo. Por favor, solicita a la dirección o personal administrativo que apruebe tu cambio de contraseña.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\User;
use App\Mail\DynamicTemplateEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EmailTemplateController extends Controller
{
    /**
     * Muestra la vista principal de plantillas de correos.
     */
    public function index()
    {
        $templates = EmailTemplate::orderBy('created_at', 'desc')->get();
        $recipients = User::select('id', 'nombre', 'apellido_paterno', 'email', 'rol')
            ->where('activo', true)
            ->get();

        return Inertia::render('Admin/PlantillasCorreo/Index', [
            'templates' => $templates,
            'recipients' => $recipients,
        ]);
    }

    /**
     * Guarda una nueva plantilla de correo.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'                => 'required|string|max:255',
            'asunto'                => 'required|string|max:255',
            'tipo'                  => 'required|string|max:50',
            'contenido_html'        => 'required|string',
            'variables_disponibles' => 'nullable|string',
        ]);

        EmailTemplate::create($validated);

        return redirect()->back()->with('success', 'Plantilla de correo creada exitosamente.');
    }

    /**
     * Actualiza una plantilla existente.
     */
    public function update(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'nombre'                => 'required|string|max:255',
            'asunto'                => 'required|string|max:255',
            'tipo'                  => 'required|string|max:50',
            'contenido_html'        => 'required|string',
            'variables_disponibles' => 'nullable|string',
            'activo'                => 'boolean',
        ]);

        $template->update($validated);

        return redirect()->back()->with('success', 'Plantilla actualizada correctamente.');
    }

    /**
     * Elimina una plantilla.
     */
    public function destroy($id)
    {
        $template = EmailTemplate::findOrFail($id);
        $template->delete();

        return redirect()->back()->with('success', 'Plantilla eliminada correctamente.');
    }

    /**
     * Envía un correo de prueba o masivo utilizando Brevo a los destinatarios seleccionados.
     */
    public function sendEmail(Request $request)
    {
        $request->validate([
            'template_id'  => 'required|exists:email_templates,id',
            'recipients'   => 'required|array|min:1',
            'recipients.*' => 'email',
        ]);

        $template = EmailTemplate::findOrFail($request->template_id);

        foreach ($request->recipients as $recipientEmail) {
            $user = User::where('email', $recipientEmail)->first();

            // Reemplazar variables dinámicas como {{nombre}}, {{matricula}}, {{email}}
            $html = $template->contenido_html;
            $asunto = $template->asunto;

            $userName = $user ? $user->nombre_completo : 'Estimado Usuario';
            $userEmail = $recipientEmail;

            $html = str_replace('{{nombre}}', $userName, $html);
            $html = str_replace('{{email}}', $userEmail, $html);
            $html = str_replace('{{fecha}}', date('d/m/Y'), $html);
            
            $asunto = str_replace('{{nombre}}', $userName, $asunto);

            // Enviar vía Brevo (usando MailFacade de Laravel / Queues)
            Mail::to($recipientEmail)->send(new DynamicTemplateEmail($asunto, $html));
        }

        return redirect()->back()->with('success', 'Correos puestos en cola de envío correctamente.');
    }
}

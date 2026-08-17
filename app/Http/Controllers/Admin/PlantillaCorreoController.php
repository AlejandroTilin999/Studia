<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\User;
use App\Mail\DynamicTemplateEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

use Barryvdh\DomPDF\Facade\Pdf;

class PlantillaCorreoController extends Controller
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
            'attach_pdf'   => 'nullable|boolean',
        ]);

        $template = EmailTemplate::findOrFail($request->template_id);
        $shouldAttachPdf = $request->input('attach_pdf', false);

        foreach ($request->recipients as $recipientEmail) {
            $user = User::where('email', $recipientEmail)->with(['student', 'teacher'])->first();

            // Reemplazar variables dinámicas como {{nombre}}, {{matricula}}, {{email}}, {{password}}
            $html = $template->contenido_html;
            $asunto = $template->asunto;

            $userName = 'Estimado Usuario';
            if ($user) {
                if ($user->student) {
                    $s = $user->student;
                    $userName = trim(($s->nombre ?? $user->nombre) . ' ' . ($s->apellido_paterno ?? $user->apellido_paterno) . ' ' . ($s->apellido_materno ?? $user->apellido_materno));
                } else {
                    $userName = $user->nombre_completo;
                }
            }
            $userEmail = $recipientEmail;
            
            // Obtener matrícula si es alumno
            $userMatricula = 'N/A';
            if ($user && $user->student && !empty($user->student->matricula)) {
                $userMatricula = $user->student->matricula;
            } elseif ($user && !empty($user->matricula)) {
                $userMatricula = $user->matricula;
            }

            // Contraseña predeterminada institucional
            $userPassword = 'Prepahid2026';
            $userDiaSuspension = $request->input('dia_suspension', 'Fecha Pendiente de Confirmación');

            $html = str_replace('{{nombre}}', $userName, $html);
            $html = str_replace('{{email}}', $userEmail, $html);
            $html = str_replace('{{matricula}}', $userMatricula, $html);
            $html = str_replace('{{password}}', $userPassword, $html);
            $html = str_replace('{{dia_suspension}}', $userDiaSuspension, $html);
            $html = str_replace('{{fecha}}', date('d/m/Y'), $html);
            
            $asunto = str_replace('{{nombre}}', $userName, $asunto);
            $asunto = str_replace('{{matricula}}', $userMatricula, $asunto);
            $asunto = str_replace('{{password}}', $userPassword, $asunto);
            $asunto = str_replace('{{dia_suspension}}', $userDiaSuspension, $asunto);

            // Generar PDF adjunto con DomPDF en caso de aplicar
            $pdfBinary = null;
            $pdfFilename = "Documento_Oficial.pdf";

            if ($shouldAttachPdf) {
                $pdfFilename = ucfirst($template->tipo) . "_" . ($userMatricula ?: 'Oficial') . ".pdf";
                
                $pdfViewHtml = "
                <html>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body { font-family: sans-serif; padding: 30px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 3px solid #0266E0; padding-bottom: 15px; margin-bottom: 20px; }
                        .title { font-size: 20px; font-weight: bold; color: #0266E0; text-transform: uppercase; margin: 5px 0; }
                        .subtitle { font-size: 11px; color: #64748b; }
                        .content { margin-top: 30px; font-size: 13px; line-height: 1.6; }
                        .box { background: #f8fafc; border-left: 4px solid #0266E0; padding: 15px; margin: 20px 0; }
                        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class='header'>
                        <h2 class='title'>Preparatoria Hidalgo</h2>
                        <div class='subtitle'>Documento Oficial Institucional · Prepahid</div>
                    </div>
                    <div class='content'>
                        <h3>Documento Oficial: " . strtoupper($template->nombre) . "</h3>
                        <p>Se certifica formalmente que el alumno(a) <strong>{$userName}</strong> con matrícula <strong>{$userMatricula}</strong> se encuentra registrado en el sistema escolar.</p>
                        <div class='box'>
                            <p><strong>Tipo de Emisión:</strong> " . ucfirst($template->tipo) . "</p>
                            <p><strong>Fecha de Expedición:</strong> " . date('d/m/Y') . "</p>
                            <p><strong>Folio Digital:</strong> PHID-" . strtoupper(substr(md5(time() . $recipientEmail), 0, 8)) . "</p>
                        </div>
                        <p>Este documento cuenta con sello y validez de autenticidad digital oficial.</p>
                    </div>
                    <div class='footer'>
                        © " . date('Y') . " Preparatoria Hidalgo. Todos los derechos reservados.
                    </div>
                </body>
                </html>
                ";

                $pdfBinary = Pdf::loadHTML($pdfViewHtml)->output();
            }

            // Enviar vía Brevo con el PDF adjunto de manera transparente
            Mail::to($recipientEmail)->send(new DynamicTemplateEmail($asunto, $html, $pdfBinary, $pdfFilename));
        }

        return redirect()->back()->with('success', 'Correos puestos en cola de envío correctamente.');
    }
}

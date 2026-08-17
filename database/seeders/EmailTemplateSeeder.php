<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class EmailTemplateSeeder extends Seeder
{
    public function run()
    {
        $templates = [
            [
                'nombre' => 'Alta de Alumno - Credenciales de Acceso',
                'asunto' => '¡Bienvenido(a) a Preparatoria Particular Hidalgo! - Credenciales de Acceso - {{nombre}}',
                'tipo' => 'bienvenida',
                'variables_disponibles' => '{{nombre}}, {{email}}, {{password}}, {{matricula}}, {{fecha}}',
                'activo' => true,
                'contenido_html' => '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px;">
  <!-- Encabezado Azul Rectangular con Logo Blanco -->
  <div style="background-color: #0266E0; padding: 26px 32px; text-align: center; border-radius: 0px;">
    <img src="https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/logo-ph-blanco.png" alt="Preparatoria Particular Hidalgo" style="max-height: 52px; width: auto; display: inline-block;" />
  </div>

  <!-- Cuerpo del Correo -->
  <div style="padding: 34px 28px; color: #1e293b;">
    <h2 style="color: #0266E0; font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 18px; letter-spacing: -0.3px;">¡Bienvenido(a) a Preparatoria Particular Hidalgo!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 12px;">Estimado(a) alumno(a) <strong>{{nombre}}</strong>,</p>
    <p style="font-size: 15px; line-height: 1.6; color: #475569;">Has sido dado(a) de alta de forma exitosa en el sistema de Control Escolar Prepahid. A continuación te compartimos tus accesos institucionales:</p>
    
    <div style="background-color: #f8fafc; padding: 22px; border-left: 4px solid #0266E0; border-radius: 0px; margin: 26px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Matrícula:</strong> {{matricula}}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #1e293b;"><strong>Correo de Acceso:</strong> {{email}}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #1e293b;"><strong>Contraseña Temporal:</strong> {{password}}</p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b;"><strong>Fecha de Alta:</strong> {{fecha}}</p>
    </div>

    <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Por seguridad, te recomendamos cambiar tu contraseña una vez que ingreses por primera vez a tu panel.</p>
  </div>

  <!-- Pie de página Rectangular -->
  <div style="background-color: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0px;">
    <p style="font-size: 12px; color: #94a3b8; margin: 0;">© 2026 Preparatoria Particular Hidalgo · Prepahid. Todos los derechos reservados.</p>
  </div>
</div>',
            ],
            [
                'nombre' => 'Alta de Docente - Credenciales de Acceso',
                'asunto' => 'Acceso Docente Institucional - {{nombre}}',
                'tipo' => 'bienvenida',
                'variables_disponibles' => '{{nombre}}, {{email}}, {{password}}, {{fecha}}',
                'activo' => true,
                'contenido_html' => '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px;">
  <!-- Encabezado Azul Rectangular con Logo Blanco -->
  <div style="background-color: #0266E0; padding: 24px 30px; text-align: center; border-radius: 0px;">
    <img src="https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/logo-ph-blanco.png" alt="Prepahid" style="max-height: 48px; width: auto; display: inline-block;" />
  </div>

  <!-- Cuerpo del Correo -->
  <div style="padding: 30px 25px; color: #334155;">
    <h2 style="color: #0266E0; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">Acceso Institucional de Cuerpo Docente</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Estimado(a) Profesor(a) <strong>{{nombre}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Le informamos que su perfil docente ha sido activado en la plataforma de Preparatoria Hidalgo. Sus credenciales oficiales son:</p>
    
    <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #0266E0; border-radius: 0px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #1e293b;"><strong>Usuario / Correo:</strong> {{email}}</p>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #0266E0; font-weight: bold;"><strong>Contraseña de Acceso:</strong> {{password}}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;"><strong>Fecha de Habilitación:</strong> {{fecha}}</p>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Desde su panel podrá gestionar la captura de calificaciones, asistencias y clases asignadas.</p>
  </div>

  <!-- Pie de página Rectangular -->
  <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0px;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© 2026 Preparatoria Hidalgo · Prepahid. Todos los derechos reservados.</p>
  </div>
</div>',
            ],
            [
                'nombre' => 'Suspensión Oficial de Clases',
                'asunto' => 'AVISO IMPORTANTE: Suspensión de Labores Escolares - Prepahid',
                'tipo' => 'suspension',
                'variables_disponibles' => '{{nombre}}, {{dia_suspension}}, {{fecha}}',
                'activo' => true,
                'contenido_html' => '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px;">
  <!-- Encabezado Azul Rectangular con Logo Blanco -->
  <div style="background-color: #0266E0; padding: 24px 30px; text-align: center; border-radius: 0px;">
    <img src="https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/logo-ph-blanco.png" alt="Prepahid" style="max-height: 48px; width: auto; display: inline-block;" />
  </div>

  <!-- Cuerpo del Correo -->
  <div style="padding: 30px 25px; color: #334155;">
    <h2 style="color: #0266E0; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">Aviso Oficial de Suspensión de Clases</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Estimada comunidad escolar (Padres de Familia, Alumnos y Docentes),</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Por medio del presente comunicado, la Dirección de Preparatoria Hidalgo informa que las actividades académicas y administrativas quedarán suspendidas oficialmente durante la siguiente fecha:</p>
    
    <div style="background-color: #fff1f2; padding: 20px; border-left: 4px solid #e11d48; border-radius: 0px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #9f1239; font-weight: bold;">Día de Suspensión:</p>
      <p style="margin: 6px 0 0 0; font-size: 16px; color: #e11d48; font-weight: 900;">{{dia_suspension}}</p>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Las labores y clases se reanudarán de manera habitual en el horario regular al día hábil siguiente.</p>
  </div>

  <!-- Pie de página Rectangular -->
  <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0px;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© 2026 Preparatoria Particular Hidalgo · Dirección General. Todos los derechos reservados.</p>
  </div>
</div>',
            ],
        ];

        foreach ($templates as $t) {
            EmailTemplate::updateOrCreate(
                ['nombre' => $t['nombre']],
                $t
            );
        }
    }
}

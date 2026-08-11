<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: Constancia de Estudios, Boleta de Calificaciones, Bienvenida
            $table->string('asunto');
            $table->string('tipo')->default('general'); // boleta, constancia, bienvenida, aviso, general
            $table->text('contenido_html'); // Plantilla rica con variables como {{nombre}}, {{matricula}}, {{ciclo}}, etc.
            $table->text('variables_disponibles')->nullable(); // Ej: {{nombre}}, {{matricula}}, {{promedio}}
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};

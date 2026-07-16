<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Eliminar las 10 tablas obsoletas
        Schema::dropIfExists('course_group');
        Schema::dropIfExists('course_teacher');
        Schema::dropIfExists('docente_materias');
        Schema::dropIfExists('plan_materias');
        Schema::dropIfExists('especialidad_materia');
        Schema::dropIfExists('grupo_tutores');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');

        // 2. Recrear de forma limpia las tablas del Classroom para la persistencia
        Schema::dropIfExists('calificaciones');
        Schema::dropIfExists('entregas_tareas');
        Schema::dropIfExists('tareas');
        Schema::dropIfExists('criterios_evaluacion');

        // A. Criterios de Evaluación
        Schema::create('criterios_evaluacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carga_id')->constrained('cargas_academicas')->onDelete('cascade');
            $table->integer('parcial'); // 1, 2, 3
            $table->string('nombre');
            $table->integer('porcentaje');
            $table->boolean('sync_tasks')->default(false);
            $table->timestamps();
        });

        // B. Calificaciones de Criterios por Alumno
        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('criterio_id')->constrained('criterios_evaluacion')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Alumno (user_id)
            $table->string('score')->default(''); // Almacenar como string para permitir campos vacíos o calificaciones con letras/números
            $table->timestamps();
        });

        // C. Tareas de la Clase
        Schema::create('tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carga_id')->constrained('cargas_academicas')->onDelete('cascade');
            $table->integer('parcial'); // 1, 2, 3
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('deadline')->nullable();
            $table->integer('points')->default(10);
            $table->timestamps();
        });

        // D. Calificaciones de Tareas por Alumno (Entregas)
        Schema::create('entregas_tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tarea_id')->constrained('tareas')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Alumno (user_id)
            $table->string('score')->default(''); // Calificación de la tarea
            $table->string('status')->default('pending'); // pending, submitted, graded
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entregas_tareas');
        Schema::dropIfExists('tareas');
        Schema::dropIfExists('calificaciones');
        Schema::dropIfExists('criterios_evaluacion');
    }
};

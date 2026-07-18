<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Eliminar la tabla vieja si existe
        Schema::dropIfExists('consolidado_calificaciones');
        Schema::dropIfExists('calificaciones');

        // 2. Crear la nueva tabla unificada 'calificaciones'
        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('carga_id')->constrained('cargas_academicas')->onDelete('cascade');

            // Para notas individuales por criterio
            $table->foreignId('criterio_id')->nullable()->constrained('criterios_evaluacion')->onDelete('cascade');
            $table->decimal('score', 4, 1)->nullable();

            // Para notas consolidadas (resumen de la materia)
            // Estas columnas se usarán principalmente en filas donde criterio_id sea NULL
            $table->decimal('p1', 4, 1)->nullable();
            $table->decimal('p2', 4, 1)->nullable();
            $table->decimal('p3', 4, 1)->nullable();
            $table->decimal('final', 4, 1)->nullable();
            $table->string('estatus')->nullable(); // aprobado, reprobado, pendiente

            $table->timestamps();

            // Índice único para evitar duplicados
            // Un alumno tiene una nota por cada criterio, y una fila de resumen (NULL) por carga.
            // En Postgres, unique con NULL permite múltiples nulos, pero Laravel/Eloquent manejará la lógica.
            $table->unique(['user_id', 'carga_id', 'criterio_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calificaciones');
    }
};

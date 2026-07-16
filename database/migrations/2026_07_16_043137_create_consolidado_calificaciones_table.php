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
        Schema::create('consolidado_calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('carga_id')->constrained('cargas_academicas')->onDelete('cascade');

            // Promedios por parcial (guardamos el número ya calculado)
            $table->decimal('p1', 4, 1)->nullable();
            $table->decimal('p2', 4, 1)->nullable();
            $table->decimal('p3', 4, 1)->nullable();

            // Promedio final de la materia
            $table->decimal('final', 4, 1)->nullable();

            // Estatus rápido: 'aprobado', 'reprobado', 'pendiente'
            $table->string('estatus')->default('pendiente');

            $table->timestamps();

            // Índice único para evitar duplicados: un alumno solo tiene un consolidado por materia/carga
            $table->unique(['user_id', 'carga_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consolidado_calificaciones');
    }
};

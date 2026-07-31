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
        // 1. Eliminar tablas obsoletas
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('administrativos');
        Schema::dropIfExists('archivos');
        Schema::dropIfExists('periodos_evaluacion');
        Schema::dropIfExists('logs');

        // 2. Eliminar columna docente_id de materias
        if (Schema::hasColumn('materias', 'docente_id')) {
            Schema::table('materias', function (Blueprint $table) {
                $table->dropColumn('docente_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nota: Recrear las tablas requeriría conocer su estructura original exacta.
        // Como es una limpieza de elementos no deseados, la reversión no se implementa en detalle.
        Schema::table('materias', function (Blueprint $table) {
            $table->unsignedBigInteger('docente_id')->nullable();
        });
    }
};

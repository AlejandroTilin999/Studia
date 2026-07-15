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
        // 1. Restricción única en docente_materias
        Schema::table('docente_materias', function (Blueprint $table) {
            $table->unique(['docente_id', 'materia_id'], 'docente_materias_docente_materia_unique');
        });

        // 2. Campo fecha_baja en inscripciones
        Schema::table('inscripciones', function (Blueprint $table) {
            if (!Schema::hasColumn('inscripciones', 'fecha_baja')) {
                $table->date('fecha_baja')->nullable();
            }
        });

        // 3. Campo horario_id en asistencias
        Schema::table('asistencias', function (Blueprint $table) {
            if (!Schema::hasColumn('asistencias', 'horario_id')) {
                $table->foreignId('horario_id')->nullable()->constrained('horarios')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asistencias', function (Blueprint $table) {
            $table->dropForeign(['horario_id']);
            $table->dropColumn('horario_id');
        });

        Schema::table('inscripciones', function (Blueprint $table) {
            $table->dropColumn('fecha_baja');
        });

        Schema::table('docente_materias', function (Blueprint $table) {
            $table->dropUnique('docente_materias_docente_materia_unique');
        });
    }
};

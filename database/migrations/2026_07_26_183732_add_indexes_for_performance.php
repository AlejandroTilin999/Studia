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
        Schema::table('alumnos', function (Blueprint $table) {
            $table->index('matricula');
        });

        Schema::table('materias', function (Blueprint $table) {
            $table->index('codigo');
        });

        Schema::table('cargas_academicas', function (Blueprint $table) {
            $table->index('ciclo_id');
            $table->index('grupo_id');
            $table->index('materia_id');
            $table->index('docente_id');
        });

        Schema::table('calificaciones', function (Blueprint $table) {
            $table->index('usuario_id');
            $table->index('criterio_id');
            $table->index('carga_id');
        });

        Schema::table('inscripciones', function (Blueprint $table) {
            $table->index('usuario_id');
            $table->index('grupo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alumnos', function (Blueprint $table) {
            $table->dropIndex(['matricula']);
        });

        Schema::table('materias', function (Blueprint $table) {
            $table->dropIndex(['codigo']);
        });

        Schema::table('cargas_academicas', function (Blueprint $table) {
            $table->dropIndex(['ciclo_id']);
            $table->dropIndex(['grupo_id']);
            $table->dropIndex(['materia_id']);
            $table->dropIndex(['docente_id']);
        });

        Schema::table('calificaciones', function (Blueprint $table) {
            $table->dropIndex(['usuario_id']);
            $table->dropIndex(['criterio_id']);
            $table->dropIndex(['carga_id']);
        });

        Schema::table('inscripciones', function (Blueprint $table) {
            $table->dropIndex(['usuario_id']);
            $table->dropIndex(['grupo_id']);
        });
    }
};

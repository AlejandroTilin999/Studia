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
        // 1. Eliminar la relación en la tabla asistencias
        if (Schema::hasTable('asistencias') && Schema::hasColumn('asistencias', 'horario_id')) {
            Schema::table('asistencias', function (Blueprint $table) {
                $table->dropForeign(['horario_id']);
                $table->dropColumn('horario_id');
            });
        }

        // 2. Eliminar la tabla horarios
        Schema::dropIfExists('horarios');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carga_id')->constrained('cargas_academicas')->onDelete('cascade');
            $table->foreignId('aula_id')->nullable()->constrained('aulas')->onDelete('set null');
            $table->string('dia_semana');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->timestamps();
        });

        Schema::table('asistencias', function (Blueprint $table) {
            $table->foreignId('horario_id')->nullable()->after('carga_id')->constrained('horarios')->onDelete('set null');
        });
    }
};

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
        // 1. ADMINISTRATIVOS
        Schema::table('administrativos', function (Blueprint $table) {
            if (Schema::hasColumn('administrativos', 'user_id')) {
                $table->renameColumn('user_id', 'usuario_id');
            }
        });

        // 2. LOGS
        Schema::table('logs', function (Blueprint $table) {
            if (Schema::hasColumn('logs', 'user_id')) {
                $table->renameColumn('user_id', 'usuario_id');
            }
        });

        // 3. ASISTENCIAS
        Schema::table('asistencias', function (Blueprint $table) {
            if (Schema::hasColumn('asistencias', 'alumno_id')) {
                // Si queremos ser consistentes, podriamos cambiar alumno_id a usuario_id
                // pero si apunta a la tabla alumnos, alumno_id es correcto.
                // Sin embargo, dijimos "todo", asi que si el usuario prefiere usuario_id:
                // Por ahora lo mantengo como alumno_id porque es semantico para asistencias.
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            if (Schema::hasColumn('logs', 'usuario_id')) {
                $table->renameColumn('usuario_id', 'user_id');
            }
        });

        Schema::table('administrativos', function (Blueprint $table) {
            if (Schema::hasColumn('administrativos', 'usuario_id')) {
                $table->renameColumn('usuario_id', 'user_id');
            }
        });
    }
};

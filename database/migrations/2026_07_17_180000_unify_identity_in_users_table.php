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
        // 1. Agregar apellidos a la tabla USERS
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'apellido_paterno')) {
                $table->string('apellido_paterno')->nullable()->after('nombre');
            }
            if (!Schema::hasColumn('users', 'apellido_materno')) {
                $table->string('apellido_materno')->nullable()->after('apellido_paterno');
            }
        });

        // 2. Intentar rescatar datos de alumnos y docentes hacia users (opcional pero recomendado)
        // Rescatar de alumnos
        DB::table('alumnos')->get()->each(function ($alumno) {
            DB::table('users')->where('id', $alumno->usuario_id)->update([
                'nombre' => $alumno->nombre,
                'apellido_paterno' => $alumno->apellido_paterno,
                'apellido_materno' => $alumno->apellido_materno,
                'telefono' => $alumno->telefono,
            ]);
        });

        // Rescatar de docentes
        DB::table('docentes')->get()->each(function ($docente) {
            DB::table('users')->where('id', $docente->usuario_id)->update([
                'nombre' => $docente->nombre,
                'apellido_paterno' => $docente->apellido_paterno,
                'apellido_materno' => $docente->apellido_materno,
                'telefono' => $docente->telefono,
            ]);
        });

        // 3. Eliminar columnas redundantes de ALUMNOS
        Schema::table('alumnos', function (Blueprint $table) {
            $cols = ['nombre', 'apellido_paterno', 'apellido_materno', 'telefono', 'activo'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('alumnos', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // 4. Eliminar columnas redundantes de DOCENTES
        Schema::table('docentes', function (Blueprint $table) {
            $cols = ['nombre', 'apellido_paterno', 'apellido_materno', 'telefono', 'activo'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('docentes', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir este cambio sería complejo por la pérdida de datos,
        // pero se definiría agregando de nuevo las columnas a las tablas hijas.
    }
};

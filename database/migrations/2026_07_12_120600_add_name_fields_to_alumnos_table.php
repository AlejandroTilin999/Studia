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
        Schema::table('alumnos', function (Blueprint $table) {
            if (!Schema::hasColumn('alumnos', 'nombre')) {
                $table->string('nombre', 255)->nullable();
            }
            if (!Schema::hasColumn('alumnos', 'apellido_paterno')) {
                $table->string('apellido_paterno', 255)->nullable();
            }
            if (!Schema::hasColumn('alumnos', 'apellido_materno')) {
                $table->string('apellido_materno', 255)->nullable();
            }
        });

        // Intentar poblar registros existentes desde la tabla users
        $alumnos = DB::table('alumnos')->get();
        foreach ($alumnos as $alumno) {
            $user = DB::table('users')->where('id', $alumno->user_id)->first();
            if ($user && $user->name) {
                $parts = preg_split('/\s+/', trim($user->name));
                $nombre = $parts[0] ?? '';
                $paterno = $parts[1] ?? '';
                $materno = isset($parts[2]) ? implode(' ', array_slice($parts, 2)) : '';
                
                DB::table('alumnos')->where('id', $alumno->id)->update([
                    'nombre' => $nombre,
                    'apellido_paterno' => $paterno ?: 'Alumno',
                    'apellido_materno' => $materno ?: null,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alumnos', function (Blueprint $table) {
            $table->dropColumn(['nombre', 'apellido_paterno', 'apellido_materno']);
        });
    }
};

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
        Schema::table('ciclos_escolares', function (Blueprint $table) {
            $table->string('status')->default('planificacion')->after('activo');
        });

        // Migrar datos existentes basados en la columna binaria 'activo'
        DB::table('ciclos_escolares')->where('activo', true)->update(['status' => 'activo']);
        DB::table('ciclos_escolares')->where('activo', false)->update(['status' => 'cerrado']);

        // El estado 'planificacion' será para los nuevos ciclos creados por defecto
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ciclos_escolares', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};

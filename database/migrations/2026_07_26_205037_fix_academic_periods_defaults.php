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
            $table->boolean('p2_activo')->default(false)->change();
            $table->boolean('p3_activo')->default(false)->change();
        });

        // Actualizar registros existentes para que por defecto solo el primero esté activo
        DB::table('ciclos_escolares')->update([
            'p1_activo' => true,
            'p2_activo' => false,
            'p3_activo' => false
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ciclos_escolares', function (Blueprint $table) {
            $table->boolean('p2_activo')->default(true)->change();
            $table->boolean('p3_activo')->default(true)->change();
        });
    }
};

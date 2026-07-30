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
        Schema::table('entregas_tareas', function (Blueprint $table) {
            if (!Schema::hasColumn('entregas_tareas', 'archivo_url')) {
                $table->string('archivo_url')->nullable()->after('estatus');
                $table->string('archivo_nombre')->nullable()->after('archivo_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entregas_tareas', function (Blueprint $table) {
            $table->dropColumn(['archivo_url', 'archivo_nombre']);
        });
    }
};

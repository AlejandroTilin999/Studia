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
        Schema::table('tareas', function (Blueprint $table) {
            if (!Schema::hasColumn('tareas', 'hora_entrega')) {
                $table->string('hora_entrega', 10)->nullable()->after('fecha_entrega');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tareas', function (Blueprint $table) {
            if (Schema::hasColumn('tareas', 'hora_entrega')) {
                $table->dropColumn('hora_entrega');
            }
        });
    }
};

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
        // 1. Eliminar la relación en la tabla grupos
        if (Schema::hasTable('grupos') && Schema::hasColumn('grupos', 'turno_id')) {
            Schema::table('grupos', function (Blueprint $table) {
                try {
                    $table->dropForeign(['turno_id']);
                } catch (\Exception $e) {
                    $table->dropForeign('grupos_turno_id_foreign');
                }
                $table->dropColumn('turno_id');
            });
        }

        // 2. Eliminar la tabla turnos
        Schema::dropIfExists('turnos');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('turnos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50);
            $table->timestamps();
        });

        Schema::table('grupos', function (Blueprint $table) {
            $table->foreignId('turno_id')->nullable()->constrained('turnos')->onDelete('set null');
        });
    }
};

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
        if (Schema::hasTable('grupos') && Schema::hasColumn('grupos', 'plan_id')) {
            Schema::table('grupos', function (Blueprint $table) {
                // Intentar borrar la FK. En Laravel por defecto es [nombre_tabla]_[columna]_foreign
                try {
                    $table->dropForeign(['plan_id']);
                } catch (\Exception $e) {
                    // Si falla usamos el nombre común
                    $table->dropForeign('grupos_plan_id_foreign');
                }
                $table->dropColumn('plan_id');
            });
        }

        // 2. Eliminar la tabla planes_estudio
        Schema::dropIfExists('planes_estudio');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('planes_estudio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('especialidad_id')->constrained('especialidades')->onDelete('cascade');
            $table->string('nombre');
            $table->integer('anio_inicio')->nullable();
            $table->integer('anio_fin')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::table('grupos', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->constrained('planes_estudio')->onDelete('set null');
        });
    }
};

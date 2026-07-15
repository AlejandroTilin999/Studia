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
        if (Schema::hasTable('materias')) {
            Schema::table('materias', function (Blueprint $table) {
                if (!Schema::hasColumn('materias', 'tipo')) {
                    $table->string('tipo', 30)->default('General');
                }
            });
        }

        if (!Schema::hasTable('especialidad_materia')) {
            Schema::create('especialidad_materia', function (Blueprint $table) {
                $table->id();
                $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
                $table->foreignId('especialidad_id')->constrained('especialidades')->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('especialidad_materia')) {
            Schema::dropIfExists('especialidad_materia');
        }

        if (Schema::hasTable('materias')) {
            Schema::table('materias', function (Blueprint $table) {
                if (Schema::hasColumn('materias', 'tipo')) {
                    $table->dropColumn('tipo');
                }
            });
        }
    }
};

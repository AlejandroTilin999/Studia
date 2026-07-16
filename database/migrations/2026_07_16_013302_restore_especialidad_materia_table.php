<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('especialidad_materia')) {
            Schema::create('especialidad_materia', function (Blueprint $table) {
                $table->id();
                $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
                $table->foreignId('especialidad_id')->constrained('especialidades')->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('especialidad_materia');
    }
};

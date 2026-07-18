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
        Schema::table('materias', function (Blueprint $table) {
            if (!Schema::hasColumn('materias', 'area')) {
                $table->string('area', 100)->nullable()->after('tipo');
            }
        });

        Schema::table('docentes', function (Blueprint $table) {
            if (!Schema::hasColumn('docentes', 'area')) {
                $table->string('area', 100)->nullable()->after('especialidad');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materias', function (Blueprint $table) {
            $table->dropColumn('area');
        });

        Schema::table('docentes', function (Blueprint $table) {
            $table->dropColumn('area');
        });
    }
};

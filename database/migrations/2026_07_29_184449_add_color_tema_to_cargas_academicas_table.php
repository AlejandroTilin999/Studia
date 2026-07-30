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
        Schema::table('cargas_academicas', function (Blueprint $table) {
            if (!Schema::hasColumn('cargas_academicas', 'color_tema')) {
                $table->string('color_tema')->nullable()->default('blue')->after('docente_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cargas_academicas', function (Blueprint $table) {
            if (Schema::hasColumn('cargas_academicas', 'color_tema')) {
                $table->dropColumn('color_tema');
            }
        });
    }
};

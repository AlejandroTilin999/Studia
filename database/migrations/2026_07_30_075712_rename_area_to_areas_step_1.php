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
        Schema::table('docentes', function (Blueprint $table) {
            if (Schema::hasColumn('docentes', 'area')) {
                $table->renameColumn('area', 'areas');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('docentes', function (Blueprint $table) {
            if (Schema::hasColumn('docentes', 'areas')) {
                $table->renameColumn('areas', 'area');
            }
        });
    }
};

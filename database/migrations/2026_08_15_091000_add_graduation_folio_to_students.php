<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('alumnos', 'folio_egreso')) {
            Schema::table('alumnos', function (Blueprint $table) {
                $table->string('folio_egreso', 50)->nullable()->unique();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('alumnos', 'folio_egreso')) {
            Schema::table('alumnos', function (Blueprint $table) {
                $table->dropUnique(['folio_egreso']);
                $table->dropColumn('folio_egreso');
            });
        }
    }
};

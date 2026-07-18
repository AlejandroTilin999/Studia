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
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'curp')) {
                $table->dropColumn('curp');
            }
            if (Schema::hasColumn('users', 'genero')) {
                $table->dropColumn('genero');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('curp', 18)->nullable()->unique()->after('apellido_materno');
            $table->string('genero', 20)->nullable()->after('curp');
        });
    }
};

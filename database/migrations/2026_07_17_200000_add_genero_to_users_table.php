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
            if (!Schema::hasColumn('users', 'genero')) {
                // Usamos 'genero' para ser más inclusivos/estándar,
                // o 'sexo' si prefieres algo más biográfico. Usaré 'genero'.
                $table->string('genero', 20)->nullable()->after('curp');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'genero')) {
                $table->dropColumn('genero');
            }
        });
    }
};

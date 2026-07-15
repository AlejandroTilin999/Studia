<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('cargas_academicas')) {
            Schema::table('cargas_academicas', function (Blueprint $table) {
                if (!Schema::hasColumn('cargas_academicas', 'uuid')) {
                    $table->string('uuid', 50)->nullable();
                }
            });

            // Generar UUIDs únicos para los registros ya existentes
            $loads = DB::table('cargas_academicas')->whereNull('uuid')->get();
            foreach ($loads as $l) {
                $uniqueUuid = strtoupper(Str::random(12));
                DB::table('cargas_academicas')->where('id', $l->id)->update(['uuid' => $uniqueUuid]);
            }

            // Aplicar restricción UNIQUE e índice
            Schema::table('cargas_academicas', function (Blueprint $table) {
                $table->string('uuid', 50)->nullable(false)->unique()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('cargas_academicas')) {
            Schema::table('cargas_academicas', function (Blueprint $table) {
                if (Schema::hasColumn('cargas_academicas', 'uuid')) {
                    $table->dropColumn('uuid');
                }
            });
        }
    }
};

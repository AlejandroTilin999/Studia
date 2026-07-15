<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('specialties', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->timestamps();
        });

        // Insert initial records
        DB::table('specialties')->insert([
            [
                'name' => 'Informática',
                'code' => 'INF',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Gastronomía',
                'code' => 'GTS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Administración',
                'code' => 'ADM',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('specialties');
    }
};

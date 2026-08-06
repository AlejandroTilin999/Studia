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
        Schema::table('entregas_tareas', function (Blueprint $table) {
            $table->string('google_drive_file_id')->nullable()->after('archivo_nombre');
            $table->text('google_drive_url')->nullable()->after('google_drive_file_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entregas_tareas', function (Blueprint $table) {
            $table->dropColumn(['google_drive_file_id', 'google_drive_url']);
        });
    }
};


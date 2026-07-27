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
        // 1. Actualizar tabla Grupos
        Schema::table('grupos', function (Blueprint $table) {
            if (!Schema::hasColumn('grupos', 'generacion')) {
                $table->string('generacion', 50)->nullable()->after('nombre');
            }
            if (!Schema::hasColumn('grupos', 'semestre')) {
                $table->integer('semestre')->default(1)->after('generacion');
            }
        });

        // 2. Actualizar tabla Ciclos Escolares
        Schema::table('ciclos_escolares', function (Blueprint $table) {
            // Parcial 1
            if (!Schema::hasColumn('ciclos_escolares', 'p1_inicio')) {
                $table->date('p1_inicio')->nullable();
                $table->date('p1_fin')->nullable();
                $table->boolean('p1_activo')->default(true);
            }
            // Parcial 2
            if (!Schema::hasColumn('ciclos_escolares', 'p2_inicio')) {
                $table->date('p2_inicio')->nullable();
                $table->date('p2_fin')->nullable();
                $table->boolean('p2_activo')->default(true);
            }
            // Parcial 3
            if (!Schema::hasColumn('ciclos_escolares', 'p3_inicio')) {
                $table->date('p3_inicio')->nullable();
                $table->date('p3_fin')->nullable();
                $table->boolean('p3_activo')->default(true);
            }
        });

        // 3. Crear tabla de Auditoría Administrativa
        if (!Schema::hasTable('auditoria_administrativa')) {
            Schema::create('auditoria_administrativa', function (Blueprint $table) {
                $table->id();
                $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
                $table->string('accion', 100);
                $table->text('descripcion');
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_administrativa');

        Schema::table('ciclos_escolares', function (Blueprint $table) {
            $table->dropColumn([
                'p1_inicio', 'p1_fin', 'p1_activo',
                'p2_inicio', 'p2_fin', 'p2_activo',
                'p3_inicio', 'p3_fin', 'p3_activo'
            ]);
        });

        Schema::table('grupos', function (Blueprint $table) {
            $table->dropColumn(['generacion', 'semestre']);
        });
    }
};

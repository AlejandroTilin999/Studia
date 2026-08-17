<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Esquema Maestro Único de Producción - Studia 2026
     */
    public function up(): void
    {
        // 1. Usuarios
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellido_paterno')->nullable();
            $table->string('apellido_materno')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('rol', 50)->default('alumno')->nullable();
            $table->boolean('password_changed')->default(false)->nullable();
            $table->boolean('activo')->default(true);
            $table->string('telefono', 20)->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index('rol', 'idx_users_rol');
        });

        // 2. Password Resets
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // 3. Sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // 4. Cache
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        // 5. Jobs
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        // 6. Ciclos Escolares
        Schema::create('ciclos_escolares', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('activo')->default(false);
            $table->string('status', 50)->default('planificacion');
            $table->date('p1_inicio')->nullable();
            $table->date('p1_fin')->nullable();
            $table->boolean('p1_activo')->default(true);
            $table->date('p2_inicio')->nullable();
            $table->date('p2_fin')->nullable();
            $table->boolean('p2_activo')->default(false);
            $table->date('p3_inicio')->nullable();
            $table->date('p3_fin')->nullable();
            $table->boolean('p3_activo')->default(false);
            $table->timestamps();
        });

        // 7. Especialidades
        Schema::create('especialidades', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('codigo', 20)->unique();
            $table->json('sub_areas')->nullable();
            $table->timestamps();
        });

        // 8. Materias
        Schema::create('materias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('codigo', 20)->unique();
            $table->integer('semestre')->default(1);
            $table->integer('creditos')->default(0);
            $table->timestamps();
        });

        // 9. Especialidad Materia (Pivote)
        Schema::create('especialidad_materia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('especialidad_id')->constrained('especialidades')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->string('tipo', 50)->default('tronco_comun');
        });

        // 10. Grupos
        Schema::create('grupos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50);
            $table->string('codigo', 20)->unique();
            $table->string('especialidad', 100)->nullable();
            $table->string('turno', 30)->default('Matutino');
            $table->unsignedBigInteger('docente_tutor_id')->nullable();
            $table->string('generacion', 20);
            $table->unsignedTinyInteger('semestre');
            $table->string('seccion', 1);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index('activo', 'idx_grupos_activo');
            $table->unique(['generacion', 'semestre', 'seccion', 'especialidad'], 'grupos_ruta_generacion_unique');
        });

        // 11. Alumnos
        Schema::create('alumnos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('matricula', 50)->unique();
            $table->date('fecha_nacimiento')->nullable();
            $table->text('estatus')->nullable()->default('active');
            $table->string('folio_egreso', 50)->nullable()->unique();
            $table->timestamps();

            $table->index('usuario_id', 'idx_alumnos_usuario_id_perf');
            $table->index('matricula', 'idx_alumnos_matricula');
        });

        // 12. Docentes
        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('codigo_empleado', 50)->unique();
            $table->string('especialidad', 100)->nullable();
            $table->json('areas')->nullable();
            $table->timestamps();
        });

        Schema::table('grupos', function (Blueprint $table) {
            $table->foreign('docente_tutor_id')->references('id')->on('docentes')->nullOnDelete();
        });

        // 13. Inscripciones
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('grupo_id')->constrained('grupos')->onDelete('cascade');
            $table->foreignId('ciclo_id')->constrained('ciclos_escolares')->onDelete('cascade');
            $table->string('codigo_alumno', 50)->nullable();
            $table->string('estatus', 50)->default('active');
            $table->timestamps();

            $table->index(['ciclo_id', 'grupo_id', 'estatus'], 'idx_inscripciones_ciclo_grupo_estatus');
            $table->index('usuario_id', 'idx_inscripciones_usuario_id');
            $table->unique(['usuario_id', 'ciclo_id'], 'inscripciones_usuario_ciclo_unique');
        });

        // 14. Cargas Académicas
        Schema::create('cargas_academicas', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->foreignId('grupo_id')->constrained('grupos')->onDelete('cascade');
            $table->foreignId('ciclo_id')->constrained('ciclos_escolares')->onDelete('cascade');
            $table->string('color_tema', 50)->default('blue');
            $table->boolean('p1_cerrado')->default(false);
            $table->boolean('p2_cerrado')->default(false);
            $table->boolean('p3_cerrado')->default(false);
            $table->timestamps();
        });

        // 15. Criterios de Evaluación
        Schema::create('criterios_evaluacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carga_academica_id')->constrained('cargas_academicas')->onDelete('cascade');
            $table->integer('parcial');
            $table->string('nombre', 100);
            $table->decimal('porcentaje', 5, 2);
            $table->timestamps();
        });

        // 16. Tareas
        Schema::create('tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carga_academica_id')->constrained('cargas_academicas')->onDelete('cascade');
            $table->foreignId('criterio_id')->constrained('criterios_evaluacion')->onDelete('cascade');
            $table->integer('parcial');
            $table->string('titulo', 255);
            $table->text('descripcion')->nullable();
            $table->date('fecha_entrega')->nullable();
            $table->time('hora_entrega')->nullable();
            $table->decimal('puntos_maximos', 5, 2)->default(10.00);
            $table->timestamps();
        });

        // 17. Entregas Tareas
        Schema::create('entregas_tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tarea_id')->constrained('tareas')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->string('estatus', 50)->default('pendiente');
            $table->decimal('calificacion', 5, 2)->nullable();
            $table->text('comentarios')->nullable();
            $table->json('archivos')->nullable();
            $table->text('archivo_url')->nullable();
            $table->string('google_drive_file_id', 255)->nullable();
            $table->timestamp('fecha_entrega')->nullable();
            $table->timestamps();
        });

        // 18. Calificaciones
        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('criterio_id')->constrained('criterios_evaluacion')->onDelete('cascade');
            $table->integer('parcial');
            $table->decimal('calificacion', 5, 2);
            $table->timestamps();
        });

        // 19. Consolidado Calificaciones
        Schema::create('consolidado_calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('carga_academica_id')->constrained('cargas_academicas')->onDelete('cascade');
            $table->foreignId('ciclo_id')->constrained('ciclos_escolares')->onDelete('cascade');
            $table->decimal('promedio_p1', 5, 2)->nullable();
            $table->decimal('promedio_p2', 5, 2)->nullable();
            $table->decimal('promedio_p3', 5, 2)->nullable();
            $table->decimal('promedio_final', 5, 2)->nullable();
            $table->timestamps();
        });

        // 20. Auditoría Administrativa
        Schema::create('auditoria_administrativa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('accion', 100);
            $table->text('descripcion')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('created_at', 'idx_audit_logs_created_at');
        });

        // 21. Notificaciones
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->string('titulo');
            $table->text('mensaje');
            $table->boolean('leido')->default(false);
            $table->timestamps();
        });

        // 22. Solicitudes de Password Reset
        Schema::create('password_reset_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->string('email');
            $table->string('status', 50)->default('pendiente');
            $table->timestamps();
        });

        // 23. Reporte Descargas
        Schema::create('reporte_descargas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->string('tipo_reporte');
            $table->string('formato');
            $table->timestamps();
        });

        // 24. Documentos Alumnos
        Schema::create('documentos_alumnos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->onDelete('cascade');
            $table->string('nombre');
            $table->text('archivo_url');
            $table->timestamps();
        });

        // 25. Google Tokens
        Schema::create('google_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->integer('expires_in')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_tokens');
        Schema::dropIfExists('documentos_alumnos');
        Schema::dropIfExists('reporte_descargas');
        Schema::dropIfExists('password_reset_requests');
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('auditoria_administrativa');
        Schema::dropIfExists('consolidado_calificaciones');
        Schema::dropIfExists('calificaciones');
        Schema::dropIfExists('entregas_tareas');
        Schema::dropIfExists('tareas');
        Schema::dropIfExists('criterios_evaluacion');
        Schema::dropIfExists('cargas_academicas');
        Schema::dropIfExists('inscripciones');
        Schema::dropIfExists('docentes');
        Schema::dropIfExists('alumnos');
        Schema::dropIfExists('grupos');
        Schema::dropIfExists('especialidad_materia');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('especialidades');
        Schema::dropIfExists('ciclos_escolares');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};

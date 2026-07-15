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
        // 1. RENAME EXISTING TABLES IF THEY EXIST
        $this->renameTableIfExists('specialties', 'especialidades');
        $this->renameTableIfExists('academic_periods', 'ciclos_escolares');
        $this->renameTableIfExists('courses', 'materias');
        $this->renameTableIfExists('students', 'alumnos');
        $this->renameTableIfExists('teachers', 'docentes');
        $this->renameTableIfExists('academic_groups', 'grupos');
        $this->renameTableIfExists('enrollments', 'inscripciones');
        $this->renameTableIfExists('academic_loads', 'cargas_academicas');
        $this->renameTableIfExists('grades', 'calificaciones');
        $this->renameTableIfExists('assignments', 'tareas');
        $this->renameTableIfExists('submissions', 'entregas_tareas');

        // 2. CREATE NEW TABLES IF NOT EXIST

        // Seguridad / RBAC
        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('nombre', 50);
                $table->string('descripcion', 255)->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table) {
                $table->id();
                $table->string('nombre', 100);
                $table->string('descripcion', 255)->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('role_permissions')) {
            Schema::create('role_permissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
                $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('user_roles')) {
            Schema::create('user_roles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
                $table->timestamps();
            });
        }

        // Catálogos
        if (!Schema::hasTable('turnos')) {
            Schema::create('turnos', function (Blueprint $table) {
                $table->id();
                $table->string('nombre', 50);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('aulas')) {
            Schema::create('aulas', function (Blueprint $table) {
                $table->id();
                $table->string('nombre', 50);
                $table->string('edificio', 100)->nullable();
                $table->integer('capacidad')->nullable();
                $table->timestamps();
            });
        }

        // Planes de Estudio
        if (!Schema::hasTable('planes_estudio')) {
            Schema::create('planes_estudio', function (Blueprint $table) {
                $table->id();
                $table->foreignId('especialidad_id')->constrained('especialidades')->onDelete('cascade');
                $table->string('nombre', 100);
                $table->integer('anio_inicio')->nullable();
                $table->integer('anio_fin')->nullable();
                $table->boolean('activo')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('plan_materias')) {
            Schema::create('plan_materias', function (Blueprint $table) {
                $table->id();
                $table->foreignId('plan_id')->constrained('planes_estudio')->onDelete('cascade');
                $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
                $table->integer('semestre');
                $table->integer('orden')->default(0);
                $table->boolean('obligatoria')->default(true);
                $table->timestamps();
            });
        }

        // Docentes relaciones
        if (!Schema::hasTable('docente_materias')) {
            Schema::create('docente_materias', function (Blueprint $table) {
                $table->id();
                $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');
                $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('grupo_tutores')) {
            Schema::create('grupo_tutores', function (Blueprint $table) {
                $table->id();
                $table->foreignId('grupo_id')->constrained('grupos')->onDelete('cascade');
                $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');
                $table->date('fecha_inicio')->nullable();
                $table->date('fecha_fin')->nullable();
                $table->timestamps();
            });
        }

        // Horarios
        if (!Schema::hasTable('horarios')) {
            Schema::create('horarios', function (Blueprint $table) {
                $table->id();
                $table->foreignId('carga_id')->constrained('cargas_academicas')->onDelete('cascade');
                $table->foreignId('aula_id')->constrained('aulas')->onDelete('cascade');
                $table->string('dia_semana', 20);
                $table->time('hora_inicio');
                $table->time('hora_fin');
                $table->timestamps();
            });
        }

        // Evaluación
        if (!Schema::hasTable('periodos_evaluacion')) {
            Schema::create('periodos_evaluacion', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ciclo_id')->constrained('ciclos_escolares')->onDelete('cascade');
                $table->string('nombre', 100);
                $table->string('tipo', 50)->nullable();
                $table->integer('numero')->nullable();
                $table->date('fecha_inicio')->nullable();
                $table->date('fecha_fin')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('criterios_evaluacion')) {
            Schema::create('criterios_evaluacion', function (Blueprint $table) {
                $table->id();
                $table->foreignId('carga_id')->constrained('cargas_academicas')->onDelete('cascade');
                $table->string('nombre', 100);
                $table->decimal('porcentaje', 5, 2);
                $table->timestamps();
            });
        }

        // Asistencias
        if (!Schema::hasTable('asistencias')) {
            Schema::create('asistencias', function (Blueprint $table) {
                $table->id();
                $table->foreignId('alumno_id')->constrained('alumnos')->onDelete('cascade');
                $table->foreignId('carga_id')->constrained('cargas_academicas')->onDelete('cascade');
                $table->date('fecha');
                $table->string('estado', 30);
                $table->text('observacion')->nullable();
                $table->timestamps();
            });
        }

        // Documentos, avisos y notificaciones
        if (!Schema::hasTable('archivos')) {
            Schema::create('archivos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
                $table->string('nombre', 150);
                $table->string('ruta', 255);
                $table->string('tipo', 50)->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('avisos')) {
            Schema::create('avisos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
                $table->string('titulo', 150);
                $table->text('mensaje');
                $table->timestamp('fecha_publicacion')->useCurrent();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('notificaciones')) {
            Schema::create('notificaciones', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('titulo', 150);
                $table->text('mensaje');
                $table->boolean('leido')->default(false);
                $table->timestamps();
            });
        }

        // Administrativos
        if (!Schema::hasTable('administrativos')) {
            Schema::create('administrativos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('puesto', 100)->nullable();
                $table->timestamps();
            });
        }

        // Auditoría
        if (!Schema::hasTable('logs')) {
            Schema::create('logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('accion', 100);
                $table->string('tabla', 100);
                $table->timestamp('fecha')->useCurrent();
            });
        }

        // 3. ALTER COLS AND ADD MISSING COLUMNS/RELATIONS TO RENAMED TABLES
        
        // Docentes
        Schema::table('docentes', function (Blueprint $table) {
            if (!Schema::hasColumn('docentes', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('docentes', 'activo')) {
                $table->boolean('activo')->default(true);
            }
        });

        // Alumnos
        Schema::table('alumnos', function (Blueprint $table) {
            if (!Schema::hasColumn('alumnos', 'activo')) {
                $table->boolean('activo')->default(true);
            }
        });

        // Grupos
        Schema::table('grupos', function (Blueprint $table) {
            if (!Schema::hasColumn('grupos', 'plan_id')) {
                $table->foreignId('plan_id')->nullable()->constrained('planes_estudio')->onDelete('set null');
            }
            if (!Schema::hasColumn('grupos', 'turno_id')) {
                $table->foreignId('turno_id')->nullable()->constrained('turnos')->onDelete('set null');
            }
            if (!Schema::hasColumn('grupos', 'activo')) {
                $table->boolean('activo')->default(true);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop new tables
        Schema::dropIfExists('logs');
        Schema::dropIfExists('administrativos');
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('avisos');
        Schema::dropIfExists('archivos');
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('criterios_evaluacion');
        Schema::dropIfExists('periodos_evaluacion');
        Schema::dropIfExists('horarios');
        Schema::dropIfExists('grupo_tutores');
        Schema::dropIfExists('docente_materias');
        Schema::dropIfExists('plan_materias');
        Schema::dropIfExists('planes_estudio');
        Schema::dropIfExists('aulas');
        Schema::dropIfExists('turnos');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');

        // Restore tables to English names
        $this->renameTableIfExists('especialidades', 'specialties');
        $this->renameTableIfExists('ciclos_escolares', 'academic_periods');
        $this->renameTableIfExists('materias', 'courses');
        $this->renameTableIfExists('alumnos', 'students');
        $this->renameTableIfExists('docentes', 'teachers');
        $this->renameTableIfExists('grupos', 'academic_groups');
        $this->renameTableIfExists('inscripciones', 'enrollments');
        $this->renameTableIfExists('cargas_academicas', 'academic_loads');
        $this->renameTableIfExists('calificaciones', 'grades');
        $this->renameTableIfExists('tareas', 'assignments');
        $this->renameTableIfExists('entregas_tareas', 'submissions');
    }

    private function renameTableIfExists(string $from, string $to): void
    {
        if (Schema::hasTable($from) && !Schema::hasTable($to)) {
            Schema::rename($from, $to);
        }
    }
};

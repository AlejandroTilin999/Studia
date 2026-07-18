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
        // 1. USERS
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'name')) $table->renameColumn('name', 'nombre');
            if (Schema::hasColumn('users', 'role')) $table->renameColumn('role', 'rol');
        });

        // 2. ESPECIALIDADES
        Schema::table('especialidades', function (Blueprint $table) {
            if (Schema::hasColumn('especialidades', 'name')) $table->renameColumn('name', 'nombre');
            if (Schema::hasColumn('especialidades', 'code')) $table->renameColumn('code', 'codigo');
        });

        // 3. CICLOS ESCOLARES
        Schema::table('ciclos_escolares', function (Blueprint $table) {
            if (Schema::hasColumn('ciclos_escolares', 'name')) $table->renameColumn('name', 'nombre');
            if (Schema::hasColumn('ciclos_escolares', 'start_date')) $table->renameColumn('start_date', 'fecha_inicio');
            if (Schema::hasColumn('ciclos_escolares', 'end_date')) $table->renameColumn('end_date', 'fecha_fin');
            if (Schema::hasColumn('ciclos_escolares', 'is_active')) $table->renameColumn('is_active', 'activo');
        });

        // 4. MATERIAS
        Schema::table('materias', function (Blueprint $table) {
            if (Schema::hasColumn('materias', 'code')) $table->renameColumn('code', 'codigo');
            if (Schema::hasColumn('materias', 'name')) $table->renameColumn('name', 'nombre');
            if (Schema::hasColumn('materias', 'description')) $table->renameColumn('description', 'descripcion');
            if (Schema::hasColumn('materias', 'teacher_id')) $table->renameColumn('teacher_id', 'docente_id');
        });

        // 5. DOCENTES
        Schema::table('docentes', function (Blueprint $table) {
            if (Schema::hasColumn('docentes', 'employee_code')) $table->renameColumn('employee_code', 'codigo_empleado');
            if (Schema::hasColumn('docentes', 'phone')) $table->renameColumn('phone', 'telefono');
            if (Schema::hasColumn('docentes', 'user_id')) $table->renameColumn('user_id', 'usuario_id');
            if (Schema::hasColumn('docentes', 'specialty')) $table->renameColumn('specialty', 'especialidad');
        });

        // 6. ALUMNOS
        Schema::table('alumnos', function (Blueprint $table) {
            if (Schema::hasColumn('alumnos', 'phone')) $table->renameColumn('phone', 'telefono');
            if (Schema::hasColumn('alumnos', 'user_id')) $table->renameColumn('user_id', 'usuario_id');
            if (Schema::hasColumn('alumnos', 'status')) $table->renameColumn('status', 'estatus');
        });

        // 7. GRUPOS
        Schema::table('grupos', function (Blueprint $table) {
            if (Schema::hasColumn('grupos', 'code')) $table->renameColumn('code', 'codigo');
            if (Schema::hasColumn('grupos', 'name')) $table->renameColumn('name', 'nombre');
            if (Schema::hasColumn('grupos', 'shift')) $table->renameColumn('shift', 'turno');
            if (Schema::hasColumn('grupos', 'major')) $table->renameColumn('major', 'especialidad');
            if (Schema::hasColumn('grupos', 'tutor_teacher_id')) $table->renameColumn('tutor_teacher_id', 'docente_tutor_id');
        });

        // 8. CARGAS ACADÉMICAS
        Schema::table('cargas_academicas', function (Blueprint $table) {
            if (Schema::hasColumn('cargas_academicas', 'academic_period_id')) $table->renameColumn('academic_period_id', 'ciclo_id');
            if (Schema::hasColumn('cargas_academicas', 'academic_group_id')) $table->renameColumn('academic_group_id', 'grupo_id');
            if (Schema::hasColumn('cargas_academicas', 'course_id')) $table->renameColumn('course_id', 'materia_id');
            if (Schema::hasColumn('cargas_academicas', 'teacher_id')) $table->renameColumn('teacher_id', 'docente_id');
        });

        // 9. INSCRIPCIONES (ENROLLMENTS)
        Schema::table('inscripciones', function (Blueprint $table) {
            if (Schema::hasColumn('inscripciones', 'student_code')) $table->renameColumn('student_code', 'codigo_alumno');
            if (Schema::hasColumn('inscripciones', 'status')) $table->renameColumn('status', 'estatus');
            if (Schema::hasColumn('inscripciones', 'registered_at')) $table->renameColumn('registered_at', 'fecha_inscripcion');
            if (Schema::hasColumn('inscripciones', 'academic_period_id')) $table->renameColumn('academic_period_id', 'ciclo_id');
            if (Schema::hasColumn('inscripciones', 'academic_group_id')) $table->renameColumn('academic_group_id', 'grupo_id');
            if (Schema::hasColumn('inscripciones', 'user_id')) $table->renameColumn('user_id', 'usuario_id');
            if (Schema::hasColumn('inscripciones', 'phone')) $table->renameColumn('phone', 'telefono');
            if (Schema::hasColumn('inscripciones', 'address')) $table->renameColumn('address', 'direccion');
        });

        // 10. CALIFICACIONES
        Schema::table('calificaciones', function (Blueprint $table) {
            if (Schema::hasColumn('calificaciones', 'user_id')) $table->renameColumn('user_id', 'usuario_id');
            if (Schema::hasColumn('calificaciones', 'score')) $table->renameColumn('score', 'calificacion');
        });

        // 11. TAREAS
        Schema::table('tareas', function (Blueprint $table) {
            if (Schema::hasColumn('tareas', 'name')) $table->renameColumn('name', 'nombre');
            if (Schema::hasColumn('tareas', 'description')) $table->renameColumn('description', 'descripcion');
            if (Schema::hasColumn('tareas', 'deadline')) $table->renameColumn('deadline', 'fecha_entrega');
            if (Schema::hasColumn('tareas', 'points')) $table->renameColumn('points', 'puntos');
        });

        // 12. ENTREGAS TAREAS
        Schema::table('entregas_tareas', function (Blueprint $table) {
            if (Schema::hasColumn('entregas_tareas', 'user_id')) $table->renameColumn('user_id', 'usuario_id');
            if (Schema::hasColumn('entregas_tareas', 'score')) $table->renameColumn('score', 'calificacion');
            if (Schema::hasColumn('entregas_tareas', 'status')) $table->renameColumn('status', 'estatus');
        });

        // 13. NOTIFICACIONES
        Schema::table('notificaciones', function (Blueprint $table) {
            if (Schema::hasColumn('notificaciones', 'user_id')) $table->renameColumn('user_id', 'usuario_id');
        });

        // 14. CRITERIOS EVALUACIÓN
        Schema::table('criterios_evaluacion', function (Blueprint $table) {
            if (Schema::hasColumn('criterios_evaluacion', 'sync_tasks')) $table->renameColumn('sync_tasks', 'sincronizar_tareas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // ... reverse logic here if needed, but 'up' uses hasColumn so it's idempotent-ish
    }
};

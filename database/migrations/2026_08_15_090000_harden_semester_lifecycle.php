<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('grupos', 'seccion')) {
            Schema::table('grupos', function (Blueprint $table) {
                $table->string('seccion', 1)->nullable();
            });
        }

        // La matrícula pertenece al perfil del alumno. En inscripciones se
        // repite como referencia histórica, por lo que no puede ser única.
        DB::statement('ALTER TABLE public.inscripciones DROP CONSTRAINT IF EXISTS enrollments_student_code_key');
        DB::statement('DROP INDEX IF EXISTS public.enrollments_student_code_key');

        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS inscripciones_usuario_ciclo_unique ON public.inscripciones (usuario_id, ciclo_id)');
        DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS ciclos_unico_activo ON public.ciclos_escolares (status) WHERE status = 'activo'");
        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS grupos_ruta_generacion_unique ON public.grupos (generacion, semestre, seccion, especialidad) WHERE seccion IS NOT NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS public.grupos_ruta_generacion_unique');
        DB::statement('DROP INDEX IF EXISTS public.ciclos_unico_activo');
        // La unicidad de alumno/ciclo protege el historial y se conserva al revertir.
    }
};

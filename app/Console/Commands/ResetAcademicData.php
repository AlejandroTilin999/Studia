<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ResetAcademicData extends Command
{
    protected $signature = 'studia:reset-academic {--force : Ejecuta el borrado irreversible}';

    protected $description = 'Elimina datos académicos de prueba y conserva únicamente las cuentas administradoras.';

    public function handle(): int
    {
        $tables = [
            'entregas_tareas', 'tareas', 'calificaciones', 'criterios_evaluacion',
            'cargas_academicas', 'inscripciones', 'documentos_alumnos',
            'reporte_descargas', 'notificaciones', 'auditoria_administrativa',
            'especialidad_materia', 'ciclos_escolares', 'grupos', 'materias', 'especialidades',
            'password_reset_requests', 'password_reset_tokens',
        ];

        $counts = collect($tables)->mapWithKeys(fn (string $table) => [$table => DB::table($table)->count()]);
        $counts['alumnos'] = DB::table('alumnos')->count();
        $counts['docentes'] = DB::table('docentes')->count();
        $counts['usuarios_no_admin'] = DB::table('users')->whereRaw("lower(rol) <> 'admin'")->count();

        $this->table(['Tabla', 'Registros a eliminar'], $counts->map(fn ($count, $table) => [$table, $count])->values()->all());
        $this->info('Las cuentas con rol admin se conservarán. Los archivos ya existentes en Google Drive no se eliminan mediante este comando.');

        if (!$this->option('force')) {
            $this->warn('Vista previa: no se eliminó ningún registro. Usa --force para confirmar el reinicio.');
            return self::SUCCESS;
        }

        DB::transaction(function () use ($tables) {
            foreach ($tables as $table) {
                DB::table($table)->delete();
            }

            DB::table('alumnos')->delete();
            DB::table('docentes')->delete();
            DB::table('users')->whereRaw("lower(rol) <> 'admin'")->delete();

            foreach ([
                'entregas_tareas', 'tareas', 'calificaciones', 'criterios_evaluacion',
                'cargas_academicas', 'inscripciones', 'documentos_alumnos',
                'reporte_descargas', 'notificaciones', 'auditoria_administrativa',
                'especialidad_materia', 'ciclos_escolares', 'grupos', 'materias', 'especialidades', 'alumnos', 'docentes',
            ] as $table) {
                DB::statement("ALTER SEQUENCE IF EXISTS public.{$table}_id_seq RESTART WITH 1");
            }
        });

        Cache::forget('academic-period:working');
        Cache::forget('admin_alumnos_cycles_catalog');
        Cache::forget('admin_docentes_cycles_catalog');

        $this->info('Datos académicos eliminados. Las cuentas administradoras fueron conservadas.');
        return self::SUCCESS;
    }
}

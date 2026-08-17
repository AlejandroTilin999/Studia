<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Services\GoogleDriveService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('drive:clean-academic {--force : Elimina permanentemente la carpeta encontrada}', function () {
    $drive = app(GoogleDriveService::class);
    $prepahidId = $drive->findFolderId('Prepahid');

    if (!$prepahidId) {
        $this->info('No existe la carpeta raíz Prepahid en Drive. No se realizó ningún cambio.');
        return self::SUCCESS;
    }

    $academicId = $drive->findFolderId('Académico', $prepahidId);

    if (!$academicId) {
        $this->info('No existe Prepahid/Académico en Drive. No se realizó ningún cambio.');
        return self::SUCCESS;
    }

    $summary = $drive->summarizeFolderContents($academicId);
    $this->line("Objetivo verificado: Prepahid/Académico ({$academicId})");
    $this->line("Contenido: {$summary['folders']} subcarpetas y {$summary['files']} archivos.");

    if (!$this->option('force')) {
        $this->warn('Simulación: no se eliminó nada. Usa --force únicamente para confirmar la limpieza.');
        return self::SUCCESS;
    }

    $deleted = $drive->deleteFolderRecursively($academicId);
    $this->info("Limpieza terminada: {$deleted['folders']} carpetas y {$deleted['files']} archivos eliminados.");
    return self::SUCCESS;
})->purpose('Simula o limpia únicamente Prepahid/Académico de Google Drive');

Artisan::command('db:reset-tasks {--force : Elimina las tareas después de la simulación}', function () {
    $tasks = DB::table('tareas')->count();
    $submissions = DB::table('entregas_tareas')->count();

    $this->line("Se eliminarían {$tasks} tareas y {$submissions} entregas asociadas por la llave foránea.");
    $this->line('La siguiente tarea creada volvería a recibir el ID 1.');

    if (!$this->option('force')) {
        $this->warn('Simulación: la base de datos no fue modificada.');
        return self::SUCCESS;
    }

    DB::transaction(function () {
        DB::statement('TRUNCATE TABLE public.tareas RESTART IDENTITY CASCADE');
    });

    $this->info('Tareas y entregas dependientes eliminadas; la secuencia tareas.id fue reiniciada a 1.');
    return self::SUCCESS;
})->purpose('Simula o elimina todas las tareas y reinicia tareas.id');

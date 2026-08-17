<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

if (!Schema::hasColumn('tareas', 'archivos')) {
    Schema::table('tareas', function (Blueprint $table) {
        $table->json('archivos')->nullable()->after('descripcion');
    });
    echo "COLUMNA 'archivos' AGREGADA A TAREAS!\n";
} else {
    echo "LA COLUMNA 'archivos' YA EXISTE EN TAREAS!\n";
}

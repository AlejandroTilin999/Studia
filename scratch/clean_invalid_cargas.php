<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\AcademicLoad;
use Illuminate\Support\Facades\Cache;

// Eliminar cargas de semestres impares (como 1°A) que se guardaron erróneamente en el Periodo B (ciclo 4)
$deleted = AcademicLoad::where('ciclo_id', 4)
    ->whereHas('academicGroup', function ($q) {
        $q->whereRaw('semestre % 2 != 0');
    })
    ->delete();

Cache::flush();

echo "SE ELIMINARON {$deleted} ASIGNACIONES INVÁLIDAS DE SEMESTRES IMPARES EN EL PERIODO B Y SE LIMPIÓ LA CACHÉ.\n";

<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\AcademicLoad;

$loads = AcademicLoad::with('academicGroup:id,nombre,semestre', 'academicPeriod:id,nombre')->get();

foreach ($loads as $l) {
    echo "ID: {$l->id} | Ciclo: {$l->academicPeriod?->nombre} (ID: {$l->ciclo_id}) | Grupo: {$l->academicGroup?->nombre} (Semestre: {$l->academicGroup?->semestre})\n";
}

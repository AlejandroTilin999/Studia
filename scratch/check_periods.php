<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$periods = App\Models\AcademicPeriod::all();
foreach ($periods as $p) {
    echo "ID: {$p->id} | Nombre: {$p->nombre} | Status: {$p->status} | P1: " . var_export($p->p1_activo, true) . " | P2: " . var_export($p->p2_activo, true) . " | P3: " . var_export($p->p3_activo, true) . "\n";
}

<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

\Cache::forever('student_cache_version', (string)time());

// Also set p1_activo, p2_activo, p3_activo to true for current active cycle
$activeCycle = \App\Models\AcademicPeriod::where('status', 'activo')->first();
if ($activeCycle) {
    $activeCycle->update([
        'p1_activo' => true,
        'p2_activo' => true,
        'p3_activo' => true,
    ]);
    echo "Ciclo activo {$activeCycle->nombre} actualizado: P1, P2 y P3 marcados como activos (TRUE).\n";
}

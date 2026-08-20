<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;

$userId = 335; // Jesús Enrique Mejía

$enrollment = Enrollment::query()
    ->where('usuario_id', $userId)
    ->where('estatus', 'active')
    ->orderByDesc('ciclo_id')
    ->first(['grupo_id', 'ciclo_id']);

echo "Enrollment found: " . json_encode($enrollment) . "\n";

if ($enrollment) {
    $cargas = DB::table('cargas_academicas as ca')
        ->leftJoin('materias as m', 'm.id', '=', 'ca.materia_id')
        ->leftJoin('docentes as d', 'd.id', '=', 'ca.docente_id')
        ->leftJoin('users as u', 'u.id', '=', 'd.usuario_id')
        ->leftJoin('grupos as g', 'g.id', '=', 'ca.grupo_id')
        ->where('ca.grupo_id', $enrollment->grupo_id)
        ->where('ca.ciclo_id', $enrollment->ciclo_id)
        ->select([
            'ca.id as integer_id',
            'ca.uuid as uuid',
            'ca.color_tema',
            'm.nombre',
            'g.nombre as nombre_grupo',
            'u.nombre as docente_nombre'
        ])
        ->get();

    echo "Cargas result count: " . count($cargas) . "\n";
    echo json_encode($cargas, JSON_PRETTY_PRINT) . "\n";
}

// Check what is currently in Cache for sidebar_alumno_335
$cached = cache("sidebar_alumno_{$userId}");
echo "\nCurrent Cache 'sidebar_alumno_{$userId}':\n";
echo json_encode($cached, JSON_PRETTY_PRINT) . "\n";

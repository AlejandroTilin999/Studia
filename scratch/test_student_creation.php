<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Student;
use App\Models\Enrollment;

$rand = rand(1000, 9999);
$email = "test.student.temp{$rand}@prepahidalgo.edu.mx";
$matricula = "TST{$rand}2026";

echo "Step 1: Creating User...\n";
try {
    $u = User::create([
        'nombre'           => 'TestStudent',
        'apellido_paterno' => 'Prueba',
        'apellido_materno' => 'Test',
        'telefono'         => '4431234567',
        'email'            => $email,
        'password'         => \Illuminate\Support\Facades\Hash::make('Prepahid2026'),
        'rol'              => 'alumno',
    ]);
    echo "User created with ID: {$u->id}\n";
} catch (\Throwable $e) {
    echo "FAIL Step 1: " . $e->getMessage() . "\n";
    exit(1);
}

echo "Step 2: Creating Student...\n";
try {
    $student = Student::create([
        'usuario_id'       => $u->id,
        'matricula'        => $matricula,
        'fecha_nacimiento' => '2005-05-15',
        'estatus'          => 'active',
    ]);
    echo "Student created with ID: {$student->id}\n";
} catch (\Throwable $e) {
    echo "FAIL Step 2: " . $e->getMessage() . "\n";
    $u->delete();
    exit(1);
}

echo "Step 3: Creating Enrollment...\n";
try {
    $enrollment = Enrollment::create([
        'usuario_id'    => $u->id,
        'grupo_id'      => 46,
        'ciclo_id'      => 4,
        'codigo_alumno' => $matricula,
        'estatus'       => 'active',
    ]);
    echo "Enrollment created with ID: {$enrollment->id}\n";
} catch (\Throwable $e) {
    echo "FAIL Step 3: " . $e->getMessage() . "\n";
    $student->delete();
    $u->delete();
    exit(1);
}

echo "SUCCESS! Cleaning up test record...\n";
$enrollment->delete();
$student->delete();
$u->delete();
echo "Cleanup done.\n";

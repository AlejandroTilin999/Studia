<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('rol', 'alumno')->first();

// Run 1: Cold start
$t0 = microtime(true);
$activeCycle = \Cache::remember('active_academic_period', 1800, fn() => \App\Models\AcademicPeriod::where('activo', true)->first());
$enrollment = \Cache::remember("student_enrollment_{$user->id}", 600, function() use ($user, $activeCycle) {
    if ($activeCycle) {
        $e = \App\Models\Enrollment::where('usuario_id', $user->id)
            ->where('ciclo_id', $activeCycle->id)
            ->where('estatus', 'active')
            ->with(['academicGroup.tutor.user', 'academicPeriod'])
            ->first();
        if ($e) return $e;
    }
    return \App\Models\Enrollment::where('usuario_id', $user->id)
        ->where('estatus', 'active')
        ->with(['academicGroup.tutor.user', 'academicPeriod'])
        ->orderBy('ciclo_id', 'desc')
        ->first();
});
$t1 = microtime(true);

// Run 2: Cached hit
$t2 = microtime(true);
$enrollmentCached = \Cache::get("student_enrollment_{$user->id}");
$t3 = microtime(true);

echo "Cold enrollment query: " . round(($t1 - $t0) * 1000, 2) . " ms\n";
echo "Cached enrollment hit: " . round(($t3 - $t2) * 1000, 2) . " ms\n";

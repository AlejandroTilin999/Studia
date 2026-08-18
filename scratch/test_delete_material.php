<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$driveService = app(App\Services\GoogleDriveService::class);

echo "GoogleDriveService initialized successfully.\n";

// Test listing drive service
try {
    $r = ReflectionObject::export($driveService, true);
    echo "Service methods checked OK.\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

<?php
$canvas = imagecreatetruecolor(1200, 630);
$white = imagecolorallocate($canvas, 255, 255, 255);
imagefill($canvas, 0, 0, $white);

$logoPath = __DIR__ . '/../public/assets/phid_logo.webp';
$logo = imagecreatefromwebp($logoPath);
$logoW = imagesx($logo);
$logoH = imagesy($logo);

// Target height: 420px, calculate width maintaining aspect ratio
$targetH = 400;
$targetW = (int)($logoW * ($targetH / $logoH));

$posX = (int)((1200 - $targetW) / 2);
$posY = (int)((630 - $targetH) / 2);

imagealphablending($canvas, true);
imagecopyresampled($canvas, $logo, $posX, $posY, 0, 0, $targetW, $targetH, $logoW, $logoH);

$outputPathPng = __DIR__ . '/../public/assets/og-preview.png';
$outputPathJpg = __DIR__ . '/../public/assets/og-preview.jpg';

imagepng($canvas, $outputPathPng);
imagejpeg($canvas, $outputPathJpg, 95);

imagedestroy($canvas);
imagedestroy($logo);

echo "Generated: " . realpath($outputPathPng) . "\n";

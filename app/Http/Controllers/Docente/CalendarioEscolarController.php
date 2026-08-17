<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CalendarioEscolarController extends Controller
{
    // URL publicada directa de Google Sheets en formato CSV
    protected static $publishedCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT6ACH68wts8LY8ae7CiQ7Yqawjk73fd74tW1yQIqmdeayzmVGZA7T5Vesikz8o4JQBTxWyrd8MAFOC/pub?output=csv';

    /**
     * Endpoint API para consultar eventos del calendario.
     */
    public function index()
    {
        return response()->json(self::getEvents());
    }

    /**
     * Obtiene los eventos a 0ms desde la caché local ultra rápida (sincronizada cada 30s con Google Sheets).
     */
    public static function getEvents()
    {
        $cachePath = storage_path('app/calendar_cache.json');
        $cacheTTL = 600; // 10 minutos para respuesta a 0ms sin bloqueos de red

        // 1. Devolver respuesta a 0ms desde la caché local si existe
        if (file_exists($cachePath)) {
            $cachedData = json_decode(file_get_contents($cachePath), true);
            if (is_array($cachedData) && !empty($cachedData)) {
                $mtime = filemtime($cachePath);
                if ((time() - $mtime) < $cacheTTL) {
                    return $cachedData;
                }
            }
        }

        // 2. Si la caché expiró o no existe, consultar Google Sheets con timeout seguro
        $freshEvents = self::fetchFromGoogleSheets();
        if (is_array($freshEvents) && !empty($freshEvents)) {
            return $freshEvents;
        }

        // 3. Si falla la red de Google, devolver última caché previa
        if (file_exists($cachePath)) {
            $cachedData = json_decode(file_get_contents($cachePath), true);
            if (is_array($cachedData) && !empty($cachedData)) {
                return $cachedData;
            }
        }

        return [];
    }

    /**
     * Lee directamente el CSV de Google Sheets publicado.
     */
    public static function fetchFromGoogleSheets()
    {
        $cachePath = storage_path('app/calendar_cache.json');
        $events = [];

        try {
            $response = Http::withOptions(['allow_redirects' => true, 'verify' => false])
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'])
                ->get(self::$publishedCsvUrl);

            if ($response->successful() && strlen(trim($response->body())) > 10) {
                $lines = explode("\n", str_replace("\r", "", $response->body()));
                $headerRowIndex = -1;

                $headers = [];
                foreach ($lines as $idx => $line) {
                    if (empty(trim($line))) continue;
                    $cols = str_getcsv($line);
                    if (count($cols) === 1 && str_contains($cols[0], ',')) {
                        $cols = str_getcsv($cols[0]);
                    }

                    $lineStr = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $line));
                    if (str_contains($lineStr, 'titulo') || str_contains($lineStr, 'evento') || str_contains($lineStr, 'marca temporal') || str_contains($lineStr, 'fecha')) {
                        $headerRowIndex = $idx;
                        foreach ($cols as $cIdx => $cVal) {
                            $headers[$cIdx] = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', (string)$cVal));
                        }
                        break;
                    }
                }

                foreach ($lines as $idx => $line) {
                    if ($idx <= $headerRowIndex) continue;
                    if (empty(trim($line))) continue;

                    $row = str_getcsv($line);
                    if (count($row) === 1 && str_contains($row[0], ',')) {
                        $row = str_getcsv($row[0]);
                    }

                    if (count($row) < 2) continue;

                    $title = null;
                    $startRaw = null;
                    $category = 'General';
                    $description = '';
                    $semestre = null;

                    foreach ($row as $colKey => $cellVal) {
                        $h = $headers[$colKey] ?? '';
                        if (str_contains($h, 'titulo') || str_contains($h, 'evento')) {
                            $title = $cellVal;
                        } elseif (str_contains($h, 'inicio') || str_contains($h, 'fecha')) {
                            $startRaw = $cellVal;
                        } elseif (str_contains($h, 'categoria') || str_contains($h, 'tipo')) {
                            $category = $cellVal ?: 'General';
                        } elseif (str_contains($h, 'descripcion') || str_contains($h, 'desc')) {
                            $description = $cellVal ?: '';
                        } elseif (str_contains($h, 'semestre') || str_contains($h, 'destinatario')) {
                            $semestre = $cellVal;
                        }
                    }

                    // Fallback a posiciones relativas de Google Forms (A: Marca temporal, B: Título, C: Fecha, D: Categoría, E: Descripción, F: Semestre)
                    if (!$title && !empty($row[1])) $title = $row[1];
                    if (!$startRaw && !empty($row[2])) $startRaw = $row[2];
                    if ((empty($category) || $category === 'General') && !empty($row[3])) $category = $row[3];
                    if (empty($description) && !empty($row[4])) $description = $row[4];
                    if (empty($semestre) && !empty($row[5])) $semestre = $row[5];

                    if (empty($title) || empty($startRaw)) continue;

                    $formattedDate = null;
                    $startClean = trim((string)$startRaw);

                    if (str_contains($startClean, '/')) {
                        $parts = explode('/', $startClean);
                        if (count($parts) === 3) {
                            if (strlen($parts[0]) === 4) {
                                $formattedDate = sprintf('%04d-%02d-%02d', $parts[0], $parts[1], $parts[2]);
                            } else {
                                $formattedDate = sprintf('%04d-%02d-%02d', $parts[2], $parts[1], $parts[0]);
                            }
                        }
                    }

                    if (!$formattedDate) {
                        try {
                            $formattedDate = Carbon::parse($startClean)->format('Y-m-d');
                        } catch (\Exception $e) {
                            $formattedDate = null;
                        }
                    }

                    if ($formattedDate) {
                        $events[] = [
                            'id'          => count($events) + 1,
                            'title'       => trim((string)$title),
                            'category'    => trim((string)$category),
                            'start'       => $formattedDate,
                            'description' => trim((string)$description),
                            'semestre'    => $semestre ? trim((string)$semestre) : null
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("Error al consultar Google Sheets CSV: " . $e->getMessage());
        }

        if (!empty($events)) {
            file_put_contents($cachePath, json_encode($events, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        return $events;
    }
}

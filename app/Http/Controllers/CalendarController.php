<?php

namespace App\Http\Controllers; // Si está dentro de la subcarpeta Docente, usa: namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\EventsImport;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CalendarController extends Controller
{
    /**
     * Endpoint para subir el archivo Excel.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        // Guardar el archivo directamente en storage/app/calendar.xlsx
        $file = $request->file('file');
        $file->move(storage_path('app'), 'calendar.xlsx');

        return response()->json(['message' => 'Calendario actualizado correctamente']);
    }

    /**
     * Endpoint para leer y devolver los eventos.
     */
    public function index()
    {
        // 1. OBTENER LA RUTA ABSOLUTA EXACTA (Evita problemas con la carpeta /private de Laravel 11)
        $fullPath = storage_path('app/calendar.xlsx');

        // Verificar si el archivo existe físicamente en storage/app/calendar.xlsx
        if (!file_exists($fullPath)) {
            Log::warning("DEPURACIÓN: El archivo no fue encontrado en: " . $fullPath);
            return response()->json([
                'error' => 'El archivo calendar.xlsx no existe en storage/app/'
            ], 404);
        }

        try {
            // 2. LEER EL ARCHIVO USANDO LA RUTA ABSOLUTA
            $collections = Excel::toCollection(new EventsImport, $fullPath);
            $rows = $collections->first();

            if (!$rows || $rows->isEmpty()) {
                return response()->json([]);
            }

            // 3. MAPEAR Y FORMATAR LOS EVENTOS
            $events = $rows->map(function ($row, $index) {
                // Adaptado al formato de tu Excel ("Título del Evento", "Fecha Inicio", etc.)
                $title = $row['titulo_del_evento'] ?? $row['titulo'] ?? $row['title'] ?? null;
                $startRaw = $row['fecha_inicio'] ?? $row['start'] ?? null;

                $formattedDate = null;

                if ($startRaw) {
                    try {
                        if (is_numeric($startRaw)) {
                            $formattedDate = Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($startRaw))->format('Y-m-d');
                        } else {
                            $formattedDate = Carbon::parse($startRaw)->format('Y-m-d');
                        }
                    } catch (\Exception $e) {
                        $formattedDate = null;
                    }
                }

                return [
                    'id'          => $row['id'] ?? ($index + 1),
                    'title'       => $title,
                    'category'    => $row['categoria'] ?? $row['category'] ?? 'Aviso',
                    'start'       => $formattedDate,
                    'end'         => $row['fecha_fin'] ?? $row['end'] ?? null,
                    'semestre'    => $row['semestre'] ?? null,
                    'description' => $row['descripcion'] ?? '',
                ];
            })
            ->filter(function ($event) {
                // Filtra para mostrar solo los registros que tengan título y fecha de inicio válidos
                return !empty($event['title']) && !empty($event['start']);
            })
            ->sortBy('start')
            ->values();

            return response()->json($events);

        } catch (\Exception $e) {
            Log::error("ERROR AL LEER EXCEL: " . $e->getMessage());
            return response()->json([
                'error' => 'Error al procesar el archivo Excel',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
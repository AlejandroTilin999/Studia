<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\EventsImport;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TeacherCalendarController extends Controller
{
    /**
     * Permite subir/actualizar el archivo Excel.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        $file = $request->file('file');
        $file->move(storage_path('app'), 'calendar.xlsx');

        return response()->json(['message' => 'Calendario actualizado correctamente']);
    }

    /**
     * Lee y devuelve los eventos del archivo Excel.
     */
    public function index()
    {
        $fullPath = storage_path('app/calendar.xlsx');

        if (!file_exists($fullPath)) {
            Log::warning("Archivo de calendario no encontrado en: " . $fullPath);
            return response()->json([
                'error' => 'El archivo calendar.xlsx no existe en storage/app/'
            ], 404);
        }

        try {
            $collections = Excel::toCollection(new EventsImport, $fullPath);
            $rows = $collections->first();

            if (!$rows || $rows->isEmpty()) {
                return response()->json([]);
            }

            $events = $rows->map(function ($row, $index) {
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
                return !empty($event['title']) && !empty($event['start']);
            })
            ->sortBy('start')
            ->values();

            return response()->json($events);

        } catch (\Exception $e) {
            Log::error("Error al procesar el archivo Excel: " . $e->getMessage());
            return response()->json([
                'error' => 'Error interno al procesar el calendario',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
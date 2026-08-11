<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EventsImport implements ToCollection, WithHeadingRow
{
    /**
     * Fila del Excel donde están los encabezados reales de las columnas.
     */
    public function headingRow(): int
    {
        return 4;
    }

    public function collection(Collection $rows)
    {
        return $rows;
    }
}
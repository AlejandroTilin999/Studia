<?php

namespace App\Services\Academic;

use App\Models\AcademicPeriod;
use App\Models\Course;

class AcademicService
{
    /**
     * Registra un nuevo ciclo escolar y asegura que solo exista uno activo a la vez.
     */
    public function createPeriod(array $data, bool $isActive)
    {
        if ($isActive) {
            // Desactivar cualquier ciclo previo para evitar conflictos de fechas
            AcademicPeriod::where('is_active', true)->update(['is_active' => false]);
        }

        return AcademicPeriod::create([
            'name' => $data['name'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'is_active' => $isActive,
        ]);
    }

    /**
     * Registra una materia asegurando que el código esté en mayúsculas.
     */
    public function createCourse(array $data)
    {
        $data['code'] = strtoupper($data['code']);
        return Course::create($data);
    }
}
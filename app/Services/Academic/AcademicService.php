<?php

namespace App\Services\Academic;

use App\Models\AcademicPeriod;
use App\Models\Course;

class AcademicService
{
    /**
     * Registra un nuevo ciclo escolar y asegura que solo exista uno activo a la vez. (Español)
     */
    public function createPeriod(array $data, bool $isActive)
    {
        if ($isActive) {
            AcademicPeriod::where('activo', true)->update(['activo' => false]);
        }

        return AcademicPeriod::create([
            'nombre'       => $data['name'],
            'fecha_inicio' => $data['start_date'],
            'fecha_fin'    => $data['end_date'],
            'activo'       => $isActive,
        ]);
    }

    /**
     * Registra una materia asegurando que el código esté en mayúsculas. (Español)
     */
    public function createCourse(array $data)
    {
        return Course::create([
            'codigo'      => strtoupper($data['code']),
            'nombre'      => $data['name'],
            'semestre'    => $data['semestre'],
            'descripcion' => $data['description'] ?? null,
            'docente_id'  => $data['teacher_id'] ?? null,
            'tipo'        => $data['tipo'] ?? 'General',
        ]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    const UPDATED_AT = null;

    protected $table = 'ciclos_escolares';
    protected $fillable = ['nombre', 'fecha_inicio', 'fecha_fin', 'activo'];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Un ciclo escolar alberga muchas inscripciones de alumnos
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'ciclo_id');
    }

    // Un ciclo escolar tiene muchas cargas académicas
    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'ciclo_id');
    }
}

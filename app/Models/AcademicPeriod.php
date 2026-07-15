<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    const UPDATED_AT = null;

    protected $table = 'ciclos_escolares';
    protected $fillable = ['name', 'start_date', 'end_date', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Un ciclo escolar alberga muchas inscripciones de alumnos
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    // Un ciclo escolar tiene muchas cargas académicas
    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'academic_period_id');
    }
}
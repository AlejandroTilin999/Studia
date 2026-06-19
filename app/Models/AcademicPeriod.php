<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    protected $fillable = ['name', 'start_date', 'end_date', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Un ciclo escolar alberga muchas inscripciones de alumnos
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}
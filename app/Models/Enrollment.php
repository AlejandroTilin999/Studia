<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = ['user_id', 'academic_period_id', 'status'];

    // La inscripción pertenece a un estudiante específico
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // La inscripción corresponde a un ciclo escolar determinado
    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    // Una inscripción acumula las calificaciones de sus materias vinculadas
    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}
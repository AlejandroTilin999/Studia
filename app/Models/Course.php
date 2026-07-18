<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $table = 'materias';
    protected $fillable = ['codigo', 'nombre', 'semestre', 'descripcion', 'docente_id', 'tipo'];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'docente_id');
    }

    public function academicGroups()
    {
        // Usamos la tabla de cargas_academicas como pivote para saber en qué grupos está la materia
        return $this->belongsToMany(AcademicGroup::class, 'cargas_academicas', 'materia_id', 'grupo_id');
    }

    public function groups()
    {
        return $this->academicGroups();
    }

    public function specialties()
    {
        return $this->belongsToMany(Specialty::class, 'especialidad_materia', 'materia_id', 'especialidad_id');
    }
}

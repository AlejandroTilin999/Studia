<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicGroup extends Model
{
    protected $table = 'grupos';
    protected $fillable = ['codigo', 'nombre', 'semestre', 'generacion', 'turno', 'especialidad', 'docente_tutor_id', 'activo'];

    public function tutor()
    {
        return $this->belongsTo(Teacher::class, 'docente_tutor_id');
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'cargas_academicas', 'grupo_id', 'materia_id');
    }

    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'grupo_id');
    }
}

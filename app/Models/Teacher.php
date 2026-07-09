<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    // 1. Añadimos tus nuevas columnas al fillable para permitir su creación/edición
    protected $fillable = [
        'employee_code', 
        'nombre', 
        'apellido_paterno', 
        'apellido_materno', 
        'specialty', 
        'phone'
    ];

    // Relación Uno a Muchos con Cursos (Materias) mediante la columna teacher_id
    public function courses()
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    // Relación con los grupos tutoreados usando el foreign key correcto (tutor_teacher_id)
    public function tutoredGroups()
    {
        return $this->hasMany(AcademicGroup::class, 'tutor_teacher_id');
    }

    // Relación con las cargas académicas
    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'teacher_id');
    }
}
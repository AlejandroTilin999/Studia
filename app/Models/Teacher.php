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

    // 2. CORREGIDO: Relación Muchos a Muchos con Cursos mediante la tabla intermedia
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_teacher');
    }

    public function tutoredGroups()
    {
        return $this->hasMany(AcademicGroup::class, 'tutor_teacher_id');
    }
}
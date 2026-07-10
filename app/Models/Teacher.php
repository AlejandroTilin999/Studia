<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $fillable = [
        'employee_code', 
        'nombre', 
        'apellido_paterno', 
        'apellido_materno', 
        'specialty', 
        'phone'
    ];

    // CORREGIDO: De la tabla 'courses', usando la columna 'teacher_id'
    public function courses()
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    public function tutoredGroups()
    {
        return $this->hasMany(AcademicGroup::class, 'tutor_teacher_id');
    }
}
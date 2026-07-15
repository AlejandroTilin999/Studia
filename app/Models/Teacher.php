<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $table = 'docentes';

    protected $fillable = [
        'user_id',
        'employee_code', 
        'nombre', 
        'apellido_paterno', 
        'apellido_materno', 
        'specialty', 
        'phone',
        'activo'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Accessor to get full name as ->name attribute
    public function getNameAttribute()
    {
        return trim("{$this->nombre} {$this->apellido_paterno} {$this->apellido_materno}");
    }

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
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $table = 'materias';
    protected $fillable = ['code', 'name', 'description', 'teacher_id', 'tipo'];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function academicGroups()
    {
        return $this->belongsToMany(AcademicGroup::class, 'course_group');
    }

    public function groups()
    {
        return $this->academicGroups();
    }

    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'course_id');
    }

    public function specialties()
    {
        return $this->belongsToMany(Specialty::class, 'especialidad_materia', 'materia_id', 'especialidad_id');
    }
}
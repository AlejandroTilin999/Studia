<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicGroup extends Model
{
    protected $table = 'grupos';
    protected $fillable = ['code', 'name', 'shift', 'major', 'tutor_teacher_id', 'plan_id', 'turno_id', 'activo'];

    public function tutor()
    {
        return $this->belongsTo(Teacher::class, 'tutor_teacher_id');
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'cargas_academicas', 'academic_group_id', 'course_id');
    }

    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'academic_group_id');
    }

    public function plan()
    {
        return $this->belongsTo(PlanEstudio::class, 'plan_id');
    }

    public function turnoRel()
    {
        return $this->belongsTo(Turno::class, 'turno_id');
    }
}

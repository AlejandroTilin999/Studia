<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicGroup extends Model
{
    protected $table = 'academic_groups';
    protected $fillable = ['code', 'name', 'shift', 'major', 'tutor_teacher_id'];

    public function tutor()
    {
        return $this->belongsTo(Teacher::class, 'tutor_teacher_id');
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_group');
    }

    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'academic_group_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['code', 'name', 'description', 'teacher_id'];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function academicGroups()
    {
        return $this->belongsToMany(AcademicGroup::class, 'course_group');
    }

    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'course_id');
    }
}
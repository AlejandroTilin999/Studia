<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicGroup extends Model
{
    protected $table = 'academic_groups';
    protected $fillable = ['code', 'name', 'shift', 'specialty', 'teacher_id'];

    public function tutor()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}
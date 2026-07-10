<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'teacher_id',
    ];

    /**
     * Relación con los grupos académicos (Muchos a Muchos).
     */
    public function groups()
    {
        return $this->belongsToMany(
            AcademicGroup::class, 
            'course_group', 
            'course_id', 
            'academic_group_id'
        );
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}
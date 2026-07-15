<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicLoad extends Model
{
    use HasFactory;

    protected $table = 'cargas_academicas';

    protected $fillable = [
        'academic_period_id',
        'academic_group_id',
        'course_id',
        'teacher_id'
    ];

    /**
     * Relación con el Ciclo Escolar (AcademicPeriod)
     */
    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class, 'academic_period_id');
    }

    /**
     * Relación con el Grupo Académico (AcademicGroup)
     */
    public function academicGroup()
    {
        return $this->belongsTo(AcademicGroup::class, 'academic_group_id');
    }

    /**
     * Relación con la Materia (Course)
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * Relación con el Profesor (Teacher)
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}

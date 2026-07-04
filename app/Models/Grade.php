<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'course_id',
        'score',
        'period',
    ];

    /**
     * Relación inversa con el Alumno Inscrito
     */
    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class, 'enrollment_id');
    }

    /**
     * Relación con la Materia (Course)
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
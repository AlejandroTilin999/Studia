<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    protected $fillable = ['enrollment_id', 'course_id', 'score', 'remarks'];

    // La calificación pertenece a la boleta/inscripción de un alumno
    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    // La calificación está asignada a una materia en particular
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
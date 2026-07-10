<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicGroup extends Model
{
    use HasFactory;

    // Agrega aquí las columnas exactas de tu tabla
    protected $fillable = [
        'code',
        'name',
        'major',
        'shift',
        'tutor_teacher_id',
    ];

    // Tu relación con el tutor (asegúrate de que use la llave correcta si la cambiaste)
    public function tutor()
    {
        return $this->belongsTo(Teacher::class, 'tutor_teacher_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'matricula',
        'telefono',
        'fecha_nacimiento',
    ];

    // Relación inversa para jalar el nombre y correo del alumno desde la tabla users
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relación con la inscripción del alumno para jalar grupo y estatus académico
    public function enrollment()
    {
        return $this->hasOne(Enrollment::class, 'user_id', 'user_id');
    }
}
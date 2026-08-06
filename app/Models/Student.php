<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'alumnos';
    protected $fillable = [
        'usuario_id',
        'matricula',
        'fecha_nacimiento',
        'estatus'
    ];

    // Relación inversa para jalar el nombre y correo del alumno desde la tabla users
    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function getNombreAttribute()
    {
        return $this->user ? $this->user->nombre : '';
    }

    public function getApellidoPaternoAttribute()
    {
        return $this->user ? $this->user->apellido_paterno : '';
    }

    public function getApellidoMaternoAttribute()
    {
        return $this->user ? $this->user->apellido_materno : '';
    }

    public function getTelefonoAttribute()
    {
        return $this->user ? $this->user->telefono : '';
    }

    public function getNombreCompletoAttribute()
    {
        return $this->user ? $this->user->nombre_completo : 'Sin nombre';
    }

    // Relación con la inscripción del alumno para jalar grupo y estatus académico
    public function enrollment()
    {
        return $this->hasOne(Enrollment::class, 'usuario_id', 'usuario_id');
    }

    // Un alumno puede tener múltiples inscripciones a lo largo de su historial (por ciclo)
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'usuario_id', 'usuario_id');
    }

    public function documents()
    {
        return $this->hasMany(StudentDocument::class, 'alumno_id');
    }
}


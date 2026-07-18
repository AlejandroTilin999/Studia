<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $table = 'docentes';

    protected $fillable = [
        'usuario_id',
        'codigo_empleado',
        'especialidad',
        'area'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Accessor para obtener el nombre completo desde el usuario vinculado.
     */
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

    public function getNameAttribute()
    {
        if (!$this->user) return $this->codigo_empleado ?: 'Sin docente';

        return $this->user->nombre_completo;
    }

    // Relación Uno a Muchos con Cursos (Materias) mediante la columna docente_id
    public function courses()
    {
        return $this->hasMany(Course::class, 'docente_id');
    }

    // Relación con los grupos tutoreados usando el foreign key correcto (docente_tutor_id)
    public function tutoredGroups()
    {
        return $this->hasMany(AcademicGroup::class, 'docente_tutor_id');
    }

    // Relación con las cargas académicas
    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'docente_id');
    }
}

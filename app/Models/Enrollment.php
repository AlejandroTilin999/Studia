<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';

    // Asegúrate de agregar phone y address al array $fillable
    protected $fillable = [
        'usuario_id',
        'grupo_id',
        'ciclo_id',
        'codigo_alumno',
        'estatus',
        'telefono',
        'direccion',
        'fecha_baja',
    ];

    /**
     * Relación con las Calificaciones (Kardex)
     */
    public function grades()
    {
        return $this->hasMany(Grade::class, 'usuario_id', 'usuario_id');
    }

    /**
     * Relación con el Usuario (Nombre, Email)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Relación con el Grupo Académico
     */
    public function academicGroup()
    {
        return $this->belongsTo(AcademicGroup::class, 'grupo_id');
    }

    /**
     * Relación con el Periodo Académico (Ciclo Escolar)
     */
    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class, 'ciclo_id');
    }
}

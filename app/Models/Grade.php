<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $table = 'calificaciones';

    protected $fillable = [
        'usuario_id',
        'carga_id',
        'criterio_id',
        'calificacion',
        'p1',
        'p2',
        'p3',
        'final',
        'estatus'
    ];

    /**
     * Relación con el Criterio de Evaluación (opcional)
     */
    public function criterio()
    {
        return $this->belongsTo(CriterioEvaluacion::class, 'criterio_id');
    }

    /**
     * Relación con el Usuario (Alumno)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Relación con la Carga Académica
     */
    public function academicLoad()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }
}

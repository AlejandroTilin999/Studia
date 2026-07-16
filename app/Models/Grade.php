<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $table = 'calificaciones';

    protected $fillable = [
        'criterio_id',
        'user_id',
        'score',
    ];

    /**
     * Relación con el Criterio de Evaluación
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
        return $this->belongsTo(User::class, 'user_id');
    }
}
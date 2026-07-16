<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsolidadoCalificacion extends Model
{
    use HasFactory;

    protected $table = 'consolidado_calificaciones';

    protected $fillable = [
        'user_id',
        'carga_id',
        'p1',
        'p2',
        'p3',
        'final',
        'estatus'
    ];

    /**
     * Relación con el Alumno
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con la Carga Académica
     */
    public function academicLoad()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }
}

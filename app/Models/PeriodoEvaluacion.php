<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeriodoEvaluacion extends Model
{
    protected $table = 'periodos_evaluacion';
    protected $fillable = ['ciclo_id', 'nombre', 'tipo', 'numero', 'fecha_inicio', 'fecha_fin'];

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class, 'ciclo_id');
    }
}

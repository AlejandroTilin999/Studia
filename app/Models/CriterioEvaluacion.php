<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CriterioEvaluacion extends Model
{
    protected $table = 'criterios_evaluacion';
    protected $fillable = ['carga_id', 'nombre', 'porcentaje'];

    public function load()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }
}

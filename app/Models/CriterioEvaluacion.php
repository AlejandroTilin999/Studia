<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CriterioEvaluacion extends Model
{
    protected $table = 'criterios_evaluacion';
    protected $fillable = ['carga_id', 'parcial', 'nombre', 'porcentaje', 'sync_tasks'];

    public function academicLoad()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }
}

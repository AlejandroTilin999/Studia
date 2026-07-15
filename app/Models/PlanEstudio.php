<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanEstudio extends Model
{
    protected $table = 'planes_estudio';
    protected $fillable = ['especialidad_id', 'nombre', 'anio_inicio', 'anio_fin', 'activo'];

    public function specialty()
    {
        return $this->belongsTo(Specialty::class, 'especialidad_id');
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'plan_materias', 'plan_id', 'materia_id');
    }
}

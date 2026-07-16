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
        // La tabla plan_materias fue eliminada.
        return $this->belongsToMany(Course::class, 'cargas_academicas', 'id', 'course_id');
    }
}

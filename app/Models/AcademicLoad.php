<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicLoad extends Model
{
    use HasFactory;

    protected $table = 'cargas_academicas';

    protected $fillable = [
        'ciclo_id',
        'grupo_id',
        'materia_id',
        'docente_id',
        'uuid',
        'color_tema',
        'p1_cerrado',
        'p2_cerrado',
        'p3_cerrado'
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                do {
                    $uuid = strtoupper(\Illuminate\Support\Str::random(12));
                } while (static::where('uuid', $uuid)->exists());
                $model->uuid = $uuid;
            }
        });
    }

    /**
     * Relación con el Ciclo Escolar (AcademicPeriod)
     */
    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class, 'ciclo_id');
    }

    /**
     * Relación con el Grupo Académico (AcademicGroup)
     */
    public function academicGroup()
    {
        return $this->belongsTo(AcademicGroup::class, 'grupo_id');
    }

    /**
     * Relación con la Materia (Course)
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'materia_id');
    }

    /**
     * Relación con el Profesor (Teacher)
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'docente_id');
    }

    /**
     * Relación con los Criterios de Evaluación
     */
    public function criterios()
    {
        return $this->hasMany(CriterioEvaluacion::class, 'carga_id');
    }

    /**
     * Relación con las Tareas
     */
    public function tareas()
    {
        return $this->hasMany(Tarea::class, 'carga_id');
    }
}

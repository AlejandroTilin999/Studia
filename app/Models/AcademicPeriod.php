<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    const UPDATED_AT = null;

    protected $table = 'ciclos_escolares';

    const STATUS_PLANNING = 'planificacion';
    const STATUS_ACTIVE = 'activo';
    const STATUS_CLOSED = 'cerrado';

    protected $fillable = [
        'nombre', 'fecha_inicio', 'fecha_fin', 'activo', 'status',
        'p1_inicio', 'p1_fin', 'p1_activo',
        'p2_inicio', 'p2_fin', 'p2_activo',
        'p3_inicio', 'p3_fin', 'p3_activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'p1_activo' => 'boolean',
        'p2_activo' => 'boolean',
        'p3_activo' => 'boolean',
        'p1_inicio' => 'date',
        'p1_fin' => 'date',
        'p2_inicio' => 'date',
        'p2_fin' => 'date',
        'p3_inicio' => 'date',
        'p3_fin' => 'date',
    ];

    protected $attributes = [
        'p1_activo' => true,
        'p2_activo' => false,
        'p3_activo' => false,
    ];

    protected static function booted()
    {
        static::updated(function ($period) {
            event(new \App\Events\AcademicPeriodChanged($period));
        });
    }

    // Un ciclo escolar alberga muchas inscripciones de alumnos
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'ciclo_id');
    }

    // Un ciclo escolar tiene muchas cargas académicas
    public function academicLoads()
    {
        return $this->hasMany(AcademicLoad::class, 'ciclo_id');
    }
}

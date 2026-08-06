<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tarea extends Model
{
    protected $table = 'tareas';
    protected $fillable = ['carga_id', 'parcial', 'nombre', 'descripcion', 'fecha_entrega', 'puntos', 'tipo'];

    protected static function booted()
    {
        static::created(function ($tarea) {
            \Cache::increment('student_cache_version');
            event(new \App\Events\TaskCreated($tarea));
        });
        static::updated(function ($tarea) {
            \Cache::increment('student_cache_version');
            event(new \App\Events\TaskUpdated($tarea));
        });
        static::deleted(function ($tarea) {
            \Cache::increment('student_cache_version');
            event(new \App\Events\TaskDeleted($tarea));
        });
    }

    public function academicLoad()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }

    public function submissions()
    {
        return $this->hasMany(EntregaTarea::class, 'tarea_id');
    }

    public function entregas()
    {
        return $this->hasMany(EntregaTarea::class, 'tarea_id');
    }
}

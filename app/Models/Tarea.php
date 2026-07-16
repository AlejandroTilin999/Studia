<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tarea extends Model
{
    protected $table = 'tareas';
    protected $fillable = ['carga_id', 'parcial', 'name', 'description', 'deadline', 'points'];

    public function academicLoad()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }

    public function submissions()
    {
        return $this->hasMany(EntregaTarea::class, 'tarea_id');
    }
}

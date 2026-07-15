<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntregaTarea extends Model
{
    protected $table = 'entregas_tareas';
    protected $fillable = ['tarea_id', 'alumno_id', 'fecha_entrega', 'archivo', 'calificacion'];

    public function assignment()
    {
        return $this->belongsTo(Tarea::class, 'tarea_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'alumno_id');
    }
}

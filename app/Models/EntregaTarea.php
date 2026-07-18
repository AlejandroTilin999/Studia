<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntregaTarea extends Model
{
    protected $table = 'entregas_tareas';
    protected $fillable = ['tarea_id', 'usuario_id', 'calificacion', 'estatus'];

    public function assignment()
    {
        return $this->belongsTo(Tarea::class, 'tarea_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntregaTarea extends Model
{
    protected $table = 'entregas_tareas';
    protected $fillable = ['tarea_id', 'user_id', 'score', 'status'];

    public function assignment()
    {
        return $this->belongsTo(Tarea::class, 'tarea_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

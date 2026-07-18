<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    protected $fillable = ['usuario_id', 'titulo', 'mensaje', 'leido'];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

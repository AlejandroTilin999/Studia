<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aviso extends Model
{
    protected $table = 'avisos';
    protected $fillable = ['usuario_id', 'titulo', 'mensaje', 'fecha_publicacion'];

    public function author()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archivo extends Model
{
    protected $table = 'archivos';
    protected $fillable = ['usuario_id', 'nombre', 'ruta', 'tipo'];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

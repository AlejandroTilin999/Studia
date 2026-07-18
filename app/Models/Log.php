<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    public $timestamps = false;
    protected $table = 'logs';
    protected $fillable = ['usuario_id', 'accion', 'tabla', 'fecha'];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

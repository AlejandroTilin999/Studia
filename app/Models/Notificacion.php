<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    protected $fillable = ['usuario_id', 'titulo', 'mensaje', 'leido'];

    protected static function booted()
    {
        static::created(function ($notificacion) {
            event(new \App\Events\NotificationCreated($notificacion));
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

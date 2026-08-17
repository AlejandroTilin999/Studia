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
            cache()->forget("unread_notifs_{$notificacion->usuario_id}");
            event(new \App\Events\NotificationCreated($notificacion));
        });

        static::updated(function ($notificacion) {
            cache()->forget("unread_notifs_{$notificacion->usuario_id}");
        });

        static::deleted(function ($notificacion) {
            cache()->forget("unread_notifs_{$notificacion->usuario_id}");
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

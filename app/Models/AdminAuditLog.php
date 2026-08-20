<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAuditLog extends Model
{
    protected $table = 'auditoria_administrativa';

    protected $fillable = [
        'usuario_id',
        'accion',
        'descripcion',
        'metadata'
    ];

    protected static function booted()
    {
        static::created(function ($log) {
            try {
                event(new \App\Events\AuditLogCreated($log));
            } catch (\Throwable $e) {
                \Log::warning("No se pudo transmitir la auditoría por WebSocket: " . $e->getMessage());
            }
        });
    }

    protected $casts = [
        'metadata' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

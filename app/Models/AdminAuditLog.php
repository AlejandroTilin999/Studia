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

    protected $casts = [
        'metadata' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

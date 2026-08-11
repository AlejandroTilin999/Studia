<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'asunto',
        'tipo',
        'contenido_html',
        'variables_disponibles',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}

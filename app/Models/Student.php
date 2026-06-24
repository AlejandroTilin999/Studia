<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;

    // Esto le dice a Laravel que este modelo usa la tabla 'students'
    protected $table = 'students';

    // Esto define qué campos se pueden llenar masivamente
    protected $fillable = [
        'matricula', 
        'nombre', 
        'grado_grupo'
    ];

    // Opcional: Si no usas columnas de tiempo (created_at, updated_at) 
    // en tu tabla, descomenta la siguiente línea:
    // public $timestamps = false;
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrupoTutor extends Model
{
    protected $table = 'grupo_tutores';
    protected $fillable = ['grupo_id', 'docente_id', 'fecha_inicio', 'fecha_fin'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocenteMateria extends Model
{
    protected $table = 'docente_materias';
    protected $fillable = ['docente_id', 'materia_id'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanMateria extends Model
{
    protected $table = 'plan_materias';
    protected $fillable = ['plan_id', 'materia_id', 'semestre', 'orden', 'obligatoria'];
}

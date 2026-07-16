<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $table = 'horarios';
    protected $fillable = ['carga_id', 'aula_id', 'dia_semana', 'hora_inicio', 'hora_fin'];

    public function academicLoad()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }

    public function classroom()
    {
        return $this->belongsTo(Aula::class, 'aula_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asistencia extends Model
{
    protected $table = 'asistencias';
    protected $fillable = ['alumno_id', 'carga_id', 'horario_id', 'fecha', 'estado', 'observacion'];

    public function student()
    {
        return $this->belongsTo(Student::class, 'alumno_id');
    }

    public function academicLoad()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }

    public function schedule()
    {
        return $this->belongsTo(Horario::class, 'horario_id');
    }
}

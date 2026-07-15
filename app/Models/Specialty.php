<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    protected $table = 'especialidades';
    protected $fillable = ['name', 'code'];

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'especialidad_materia', 'especialidad_id', 'materia_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    protected $table = 'especialidades';
    protected $fillable = ['name', 'code'];
}

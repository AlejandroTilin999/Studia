<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Administrativo extends Model
{
    protected $table = 'administrativos';
    protected $fillable = ['user_id', 'puesto'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

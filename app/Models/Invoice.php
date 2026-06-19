<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = ['user_id', 'concept', 'amount', 'status'];

    // El cobro/factura le pertenece a un usuario específico
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
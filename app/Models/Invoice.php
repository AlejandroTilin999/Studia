<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $table = 'facturas'; // Se llamará facturas si se crea
    protected $fillable = ['usuario_id', 'concepto', 'monto', 'estatus'];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

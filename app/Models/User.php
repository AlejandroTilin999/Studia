<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'password_changed', // 👈 Agrega esta línea
        'activo',
        'telefono',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'password_changed' => 'boolean', // 👈 Fuerza a que Laravel lo trate como booleano (true/false)
        'activo' => 'boolean',
    ];

    // --- RELACIONES ESCOLARES ---

    // Un usuario (alumno) puede tener muchas inscripciones a lo largo del tiempo
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    // Un usuario puede tener muchas facturas o cobros de colegiatura
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
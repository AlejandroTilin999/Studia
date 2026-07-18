<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'email',
        'password',
        'rol',
        'activo',
        'password_changed',
        'telefono',
    ];

    /**
     * Accessor para obtener el nombre completo.
     */
    public function getNombreCompletoAttribute()
    {
        $fullName = trim("{$this->nombre} {$this->apellido_paterno} {$this->apellido_materno}");
        return $fullName ?: 'Sin nombre registrado';
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // --- RELACIONES ESCOLARES ---

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'usuario_id');
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'usuario_id');
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'usuario_id');
    }
}

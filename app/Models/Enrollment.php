<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';

    // Asegúrate de agregar phone y address al array $fillable
    protected $fillable = [
        'user_id',
        'academic_group_id',
        'academic_period_id',
        'student_code',
        'status',
        'phone',    // 👈 Permitir guardar teléfono
        'address',  // 👈 Permitir guardar dirección
        'fecha_baja',
    ];

    /**
     * Relación con las Calificaciones (Kardex)
     */
    public function grades()
    {
        return $this->hasMany(Grade::class, 'enrollment_id');
    }

    /**
     * Relación con el Usuario (Nombre, Email)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación con el Grupo Académico
     */
    public function academicGroup()
    {
        return $this->belongsTo(AcademicGroup::class, 'academic_group_id');
    }
}
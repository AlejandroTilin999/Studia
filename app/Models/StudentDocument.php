<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentDocument extends Model
{
    use HasFactory;

    protected $table = 'documentos_alumnos';

    protected $fillable = [
        'alumno_id',
        'nombre_archivo',
        'tipo_documento',
        'google_drive_file_id',
        'google_drive_url',
        'fecha_subida',
    ];

    protected $casts = [
        'fecha_subida' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'alumno_id');
    }
}

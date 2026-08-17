<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Tarea extends Model
{
    protected $table = 'tareas';
    protected $fillable = ['carga_id', 'parcial', 'nombre', 'descripcion', 'fecha_entrega', 'hora_entrega', 'puntos', 'tipo', 'drive_folder_id', 'archivos'];

    protected $casts = [
        'archivos' => 'array',
    ];

    /**
     * Fecha límite canónica de la tarea.
     *
     * Las tareas históricas pueden tener sólo la fecha en `fecha_entrega`.
     * En ese caso el límite es el final de ese día, no las 12:00 AM. Las
     * tareas nuevas conservan la hora concreta elegida por el docente en
     * `hora_entrega`.
     */
    public function deadlineAt(): ?Carbon
    {
        $rawDate = $this->getRawOriginal('fecha_entrega');
        $rawTime = trim((string) ($this->getRawOriginal('hora_entrega') ?? ''));

        return self::parseDeadline($rawDate, $rawTime);
    }

    /** Convierte una fecha y una hora HH:mm/HH:mm:ss en el límite oficial. */
    public static function parseDeadline(?string $rawDate, ?string $rawTime = null): ?Carbon
    {
        if (empty($rawDate)) {
            return null;
        }

        $timezone = config('app.timezone', 'America/Mexico_City');
        $date = Carbon::parse($rawDate, $timezone);
        $rawTime = trim((string) $rawTime);

        if ($rawTime !== '') {
            return Carbon::parse(
                $date->toDateString() . ' ' . $rawTime,
                $timezone
            );
        }

        // Si no hubo una hora explícita, una fecha con 00:00:00 proviene de
        // una tarea guardada sin hora; no debe vencer al iniciar el día.
        if ($date->format('H:i:s') === '00:00:00') {
            return $date->endOfDay();
        }

        return $date;
    }

    public function isOverdue(): bool
    {
        return $this->deadlineAt()?->isPast() ?? false;
    }

    protected static function booted()
    {
        static::created(function ($tarea) {
            \App\Services\GradeService::invalidateStudentCache();
            event(new \App\Events\TaskCreated($tarea));
        });
        static::updated(function ($tarea) {
            \App\Services\GradeService::invalidateStudentCache();
            event(new \App\Events\TaskUpdated($tarea));
        });
        static::deleted(function ($tarea) {
            \App\Services\GradeService::invalidateStudentCache();
            event(new \App\Events\TaskDeleted($tarea));
        });
    }

    public function academicLoad()
    {
        return $this->belongsTo(AcademicLoad::class, 'carga_id');
    }

    public function submissions()
    {
        return $this->hasMany(EntregaTarea::class, 'tarea_id');
    }

    public function entregas()
    {
        return $this->hasMany(EntregaTarea::class, 'tarea_id');
    }
}

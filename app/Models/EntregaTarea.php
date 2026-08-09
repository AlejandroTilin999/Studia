<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntregaTarea extends Model
{
    protected $table = 'entregas_tareas';
    protected $fillable = [
        'tarea_id', 
        'usuario_id', 
        'calificacion', 
        'estatus', 
        'archivo_url', 
        'archivo_nombre',
        'google_drive_file_id',
        'google_drive_url'
    ];

    protected static function booted()
    {
        $notifyGroup = function ($entrega) {
            try {
                $tarea = $entrega->assignment;
                $groupId = $tarea?->academicLoad?->grupo_id;
                if ($groupId) {
                    \Illuminate\Support\Facades\Log::info("RT_DEBUG: EntregaTarea notifyGroup for Group ID: {$groupId}");
                    event(new \App\Events\GroupDataUpdated($groupId, 'all'));
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Error notifying group from EntregaTarea: " . $e->getMessage());
            }
        };

        static::created($notifyGroup);
        static::updated($notifyGroup);
        static::deleted($notifyGroup);
    }

    public function assignment()
    {
        return $this->belongsTo(Tarea::class, 'tarea_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

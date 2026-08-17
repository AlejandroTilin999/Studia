<?php

namespace App\Events;

use App\Models\Tarea;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

abstract class EventoDeTarea implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Tarea $tarea)
    {
    }

    public function broadcastOn(): array
    {
        if (!$this->tarea->relationLoaded('academicLoad')) {
            $this->tarea->load('academicLoad');
        }

        $grupoId = $this->tarea->academicLoad?->grupo_id;

        return $grupoId ? [new PrivateChannel('AcademicGroup.' . $grupoId)] : [];
    }
}

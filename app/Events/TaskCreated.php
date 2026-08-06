<?php

namespace App\Events;

use App\Models\Tarea;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TaskCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $tarea;

    public function __construct(Tarea $tarea)
    {
        $this->tarea = $tarea;
    }

    public function broadcastOn(): array
    {
        if (!$this->tarea->relationLoaded('academicLoad')) {
            $this->tarea->load('academicLoad');
        }

        $groupId = $this->tarea->academicLoad->grupo_id ?? null;
        $channels = [new Channel('Public.Global')];
        if ($groupId) {
            $channels[] = new PrivateChannel('AcademicGroup.' . $groupId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'TaskCreated';
    }
}

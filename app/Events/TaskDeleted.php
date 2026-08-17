<?php

namespace App\Events;

use App\Models\Tarea;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $taskId;
    public $groupId;

    public function __construct(Tarea $tarea)
    {
        $this->taskId = $tarea->id;
        if (!$tarea->relationLoaded('academicLoad')) {
            $tarea->load('academicLoad');
        }
        $this->groupId = $tarea->academicLoad->grupo_id ?? null;
    }

    public function broadcastOn(): array
    {
        return $this->groupId ? [new PrivateChannel('AcademicGroup.' . $this->groupId)] : [];
    }

    public function broadcastAs(): string
    {
        return 'TaskDeleted';
    }
}

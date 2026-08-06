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
        $channels = [\Illuminate\Broadcasting\Channel::class => new \Illuminate\Broadcasting\Channel('Public.Global')];
        $channels = [new \Illuminate\Broadcasting\Channel('Public.Global')];
        if ($this->groupId) {
            $channels[] = new PrivateChannel('AcademicGroup.' . $this->groupId);
        }
        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'TaskDeleted';
    }
}

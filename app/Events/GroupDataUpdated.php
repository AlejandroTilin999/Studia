<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupDataUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $groupId;
    public $type;
    public $data;

    /**
     * Create a new event instance.
     * @param int|string $groupId
     * @param string $type 'grades', 'tasks', 'all'
     */
    public function __construct($groupId, $type = 'all', array $data = [])
    {
        $this->groupId = $groupId;
        $this->type = $type;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('AcademicGroup.' . $this->groupId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'GroupDataUpdated';
    }

    public function broadcastWith(): array
    {
        return array_merge(['type' => $this->type], $this->data);
    }
}

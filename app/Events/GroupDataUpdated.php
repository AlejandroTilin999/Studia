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

    /**
     * Create a new event instance.
     * @param int|string $groupId
     * @param string $type 'grades', 'tasks', 'all'
     */
    public function __construct($groupId, $type = 'all')
    {
        $this->groupId = $groupId;
        $this->type = $type;
        \Illuminate\Support\Facades\Log::info("RT_DEBUG: GroupDataUpdated Event Created for Group ID: {$groupId}");
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        \Illuminate\Support\Facades\Log::info("RT_DEBUG: Broadcasting GroupDataUpdated to AcademicGroup.{$this->groupId}");
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
}

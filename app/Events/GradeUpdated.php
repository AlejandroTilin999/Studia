<?php

namespace App\Events;

use App\Models\Grade;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GradeUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $grade;

    public function __construct(Grade $grade)
    {
        $this->grade = $grade;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->grade->usuario_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'GradeUpdated';
    }
}

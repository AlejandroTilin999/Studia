<?php

namespace App\Events;

use App\Models\AcademicPeriod;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AcademicPeriodChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $period;

    /**
     * Create a new event instance.
     */
    public function __construct(AcademicPeriod $period)
    {
        $this->period = $period;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('Admin.Dashboard'),
            new PrivateChannel('Academic.Cycle'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'AcademicPeriodChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'periodId' => $this->period->id,
            'partialAvailability' => [
                1 => $this->period->p1_activo === null ? true : (bool) $this->period->p1_activo,
                2 => $this->period->p2_activo === null ? true : (bool) $this->period->p2_activo,
                3 => $this->period->p3_activo === null ? true : (bool) $this->period->p3_activo,
            ],
        ];
    }
}

<?php

namespace App\Events;

class TaskUpdated extends EventoDeTarea
{
    public function broadcastAs(): string
    {
        return 'TaskUpdated';
    }
}

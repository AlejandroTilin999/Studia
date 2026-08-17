<?php

namespace App\Events;

class TaskCreated extends EventoDeTarea
{
    public function broadcastAs(): string
    {
        return 'TaskCreated';
    }
}

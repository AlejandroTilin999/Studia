<?php

namespace App\Events;

use App\Models\Grade;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GradeUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $grade;
    public $taskId;
    public $score;

    /**
     * La calificación consolidada actualiza el kardex; cuando proviene de una
     * tarea también enviamos su id y puntaje. Así el portal del alumno puede
     * actualizar esa tarjeta y su detalle sin esperar una visita de Inertia.
     */
    public function __construct(Grade $grade, ?int $taskId = null, ?string $score = null)
    {
        $this->grade = $grade;
        $this->taskId = $taskId;
        $this->score = $score;
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

    public function broadcastWith(): array
    {
        return [
            'taskId' => $this->taskId,
            'score' => $this->score,
        ];
    }
}

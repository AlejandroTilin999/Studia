<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return Inertia::render('Admin/Notificaciones/Index', [
            'notificaciones' => Inertia::defer(fn() => 
                Notificacion::select('id', 'titulo', 'mensaje', 'leido', 'created_at')
                    ->where('usuario_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->paginate(20)
                    ->through(fn($n) => [
                        'id' => $n->id,
                        'titulo' => $n->titulo,
                        'mensaje' => $n->mensaje,
                        'leido' => (bool)$n->leido,
                        'fecha' => $n->created_at->diffForHumans(),
                    ])
            ),
            'notifStats' => Inertia::defer(function () use ($userId) {
                $stats = Notificacion::where('usuario_id', $userId)
                    ->selectRaw('COUNT(*) as total, COUNT(CASE WHEN leido = false THEN 1 END) as unread')
                    ->first();

                return [
                    'total' => (int) ($stats->total ?? 0),
                    'unread' => (int) ($stats->unread ?? 0),
                ];
            })
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        Notificacion::where('id', $id)
            ->where('usuario_id', $request->user()->id)
            ->update(['leido' => true]);

        return redirect()->back();
    }

    public function markAllAsRead(Request $request)
    {
        Notificacion::where('usuario_id', $request->user()->id)
            ->where('leido', false)
            ->update(['leido' => true]);

        return redirect()->back();
    }
}


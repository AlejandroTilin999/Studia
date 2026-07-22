<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $notificaciones = Notificacion::where('usuario_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn($n) => [
                'id' => $n->id,
                'titulo' => $n->titulo,
                'mensaje' => $n->mensaje,
                'leido' => (bool)$n->leido,
                'fecha' => $n->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Notificaciones/Index', [
            'notificaciones' => $notificaciones
        ]);
    }

    public function markAsRead($id)
    {
        $notificacion = Notificacion::findOrFail($id);
        $notificacion->update(['leido' => true]);

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

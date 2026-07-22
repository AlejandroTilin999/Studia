<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Si está autenticado, su rol NO es admin y aún no ha cambiado su contraseña genérica
        if ($user && $user->rol !== 'admin' && !$user->password_changed) {
            
            // Si intenta ir a otra ruta que no sea la de cambiar contraseña o cerrar sesión, lo bloqueamos
            if (!$request->routeIs('password.change_view', 'password.force_update', 'logout')) {
                return redirect()->route('password.change_view');
            }
        }

        return $next($request);
    }
}

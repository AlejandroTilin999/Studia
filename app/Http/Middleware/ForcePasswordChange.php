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

        // Normalizamos el rol a minúsculas
        $rol = strtolower($user?->rol ?? '');

        // Ignorar el chequeo si es 'admin' O 'alumno'
        if ($user && !in_array($rol, ['admin', 'alumno']) && !$user->password_changed) {
            
            if (!$request->routeIs('password.change_view', 'password.force_update', 'logout')) {
                return redirect()->route('password.change_view');
            }
        }

        return $next($request);
    }
}
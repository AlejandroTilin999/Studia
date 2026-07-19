<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();
        if (!$user) {
            return redirect('/login');
        }

        $userRole = strtolower($user->rol ?? '');

        if ($userRole !== strtolower($role)) {
            // Redirigir según el rol real del usuario si intenta entrar a donde no debe
            if ($userRole === 'admin') {
                return redirect()->route('admin.dashboard');
            } elseif ($userRole === 'docente') {
                return redirect()->route('docente.dashboard');
            } elseif ($userRole === 'alumno') {
                return redirect()->route('alumno.dashboard');
            }

            return redirect('/dashboard');
        }

        return $next($request);
    }
}

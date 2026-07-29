<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AcademicLoad;
use App\Services\AcademicPeriodService;

class EnsureCapturaHabilitada
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // El Administrador siempre tiene pase libre
        if (auth()->check() && auth()->user()->rol === 'admin') {
            return $next($request);
        }

        // Obtener el parcial de la petición (puede venir en el body o query)
        $parcial = $request->input('parcial') ?: $request->query('parcial');

        // Identificar la carga académica
        $uuid = $request->route('uuid');
        if (!$uuid) {
            return $next($request); // No es una ruta de clase específica
        }

        $load = AcademicLoad::with('academicPeriod')->where('uuid', $uuid)->first();
        if (!$load || !$load->academicPeriod) {
            return $next($request);
        }

        if ($parcial) {
            // [INTELIGENCIA v3.19] Detectar si es una ruta de configuración o de operación
            // Las rutas de criterios son para configurar, el resto (notas/tareas) son operativas
            $isConfigRoute = $request->is('*/criterios*');
            $tipo = $isConfigRoute ? 'config' : 'operacion';

            $validation = AcademicPeriodService::isCapturaHabilitada($load->academicPeriod, $parcial, $tipo);

            if (!$validation['allowed']) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => $validation['reason']], 403);
                }
                return back()->withErrors(['captura' => $validation['reason']]);
            }
        }

        return $next($request);
    }
}

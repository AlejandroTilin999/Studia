<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();
        if ($user) {
            $role = strtolower(trim($user->rol ?? ''));
            $firstName = $user->nombre ? explode(' ', trim($user->nombre))[0] : '';
            $welcomeMsg = $firstName 
                ? "¡Bienvenido/a, {$firstName}! Iniciaste sesión exitosamente." 
                : "¡Iniciaste sesión exitosamente!";

            $redirect = match ($role) {
                'docente' => redirect()->route('docente.dashboard'),
                'alumno' => redirect()->route('alumno.dashboard'),
                default => redirect()->route('admin.dashboard'),
            };

            return $redirect->with('flash_toast', $welcomeMsg)->with('status', $welcomeMsg);
        }

        return redirect()->route('dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $role = $request->user()?->rol;
        $acceso = ($role === 'alumno') ? 'alumno' : 'institucional';

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect("/login?acceso={$acceso}")->with('status', 'Has cerrado sesión correctamente.');
    }
}

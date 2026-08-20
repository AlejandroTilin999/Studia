<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PasswordChangeController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/ResetPassword');
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'password' => [
                'required', 
                'confirmed', 
                Password::defaults(),
                function ($attribute, $value, $fail) use ($user) {
                    if (Hash::check($value, $user->password)) {
                        $fail('La nueva contraseña no puede ser igual a tu contraseña actual.');
                    }
                }
            ],
        ]);

        // 1. Guardado forzado sin restricciones de $fillable
        $user->forceFill([
            'password' => Hash::make($request->password),
            'password_changed' => true,
        ])->save();

        // 2. Refrescamos la sesión de Laravel
        auth()->login($user->fresh());

        // 3. Redirección limpia compatible con Inertia
        if ($user->rol === 'docente') {
            return redirect()->route('docente.dashboard');
        }

        return redirect()->route('dashboard');
    }
}
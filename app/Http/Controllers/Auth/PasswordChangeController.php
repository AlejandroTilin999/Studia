<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia; // 👈 ESTA ES LA LÍNEA QUE TE FALTA

class PasswordChangeController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/ResetPassword');
    }

    public function update(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($request->password),
            'password_changed' => true,
        ]);

        return redirect()->route('dashboard')->with('success', 'Contraseña actualizada con éxito.');
    }
}
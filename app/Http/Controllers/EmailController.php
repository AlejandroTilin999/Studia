<?php

namespace App\Http\Controllers;

use App\Mail\AutomatedWelcomeEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{
    public function sendWelcome(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name'  => 'required|string',
        ]);

        // Enviar el correo usando Brevo y Laravel Queues
        Mail::to($request->email)->send(new AutomatedWelcomeEmail($request->name));

        return response()->json([
            'status'  => 'success',
            'message' => 'Correo enviado correctamente',
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\GoogleToken;
use Google\Client;
use Illuminate\Http\Request;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        $client = new Client();

        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect_uri'));

        $client->addScope('https://www.googleapis.com/auth/drive');

        $client->setAccessType('offline');
        $client->setPrompt('consent');

        return redirect($client->createAuthUrl());
    }


    public function callback(Request $request)
    {
        $client = new Client();

        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect_uri'));

        $token = $client->fetchAccessTokenWithAuthCode(
            $request->code
        );

        GoogleToken::updateOrCreate(
            ['id' => 1],
            [
                'access_token' => $token['access_token'],
                'refresh_token' => $token['refresh_token'],
                'expires_in' => $token['expires_in'],
            ]
        );

        return redirect('/dashboard')
            ->with('success', 'Conectado a Google Drive!');
    }
}
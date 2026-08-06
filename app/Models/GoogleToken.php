<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleToken extends Model
{
    protected $table = "google_tokens";

    protected $fillable = [
        'access_token',
        'refresh_token',
        'expires_in',
    ];
}
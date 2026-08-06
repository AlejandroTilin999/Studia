<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Enrollment;
use App\Models\AcademicLoad;
use App\Models\Teacher;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('AcademicGroup.{id}', function ($user, $id) {
    return (bool) $user;
});

Broadcast::channel('Admin.Dashboard', function ($user) {
    return strtolower($user->rol ?? '') === 'admin';
});

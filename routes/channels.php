<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Enrollment;
use App\Models\AcademicLoad;
use App\Models\Teacher;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('AcademicGroup.{id}', function ($user, $id) {
    $rol = strtolower($user->rol ?? '');

    if ($rol === 'admin') {
        return true;
    }

    if ($rol === 'alumno') {
        return \Illuminate\Support\Facades\Cache::remember("channel_auth_alumno_{$user->id}_{$id}", 300, function () use ($user, $id) {
            return Enrollment::where('usuario_id', $user->id)
                ->where('grupo_id', $id)
                ->where('estatus', 'active')
                ->exists();
        });
    }

    if ($rol === 'docente') {
        return \Illuminate\Support\Facades\Cache::remember("channel_auth_docente_{$user->id}_{$id}", 300, function () use ($user, $id) {
            $docenteId = Teacher::where('usuario_id', $user->id)->value('id');
            return $docenteId && AcademicLoad::where('docente_id', $docenteId)
                ->where('grupo_id', $id)
                ->exists();
        });
    }

    return false;
});

Broadcast::channel('Admin.Dashboard', function ($user) {
    return strtolower($user->rol ?? '') === 'admin';
});

Broadcast::channel('Academic.Cycle', function ($user) {
    return in_array(strtolower($user->rol ?? ''), ['admin', 'docente', 'alumno'], true);
});

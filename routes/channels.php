<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Enrollment;
use App\Models\AcademicLoad;
use App\Models\Teacher;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('AcademicGroup.{id}', function ($user, $id) {
    $role = strtolower($user->rol ?? '');

    if ($role === 'admin') {
        return true;
    }

    if ($role === 'alumno') {
        return Enrollment::where('usuario_id', $user->id)
            ->where('grupo_id', $id)
            ->where('estatus', 'active')
            ->exists();
    }

    if ($role === 'docente') {
        $teacher = Teacher::where('usuario_id', $user->id)->first();
        if (!$teacher) return false;

        return AcademicLoad::where('docente_id', $teacher->id)
            ->where('grupo_id', $id)
            ->exists();
    }

    return false;
});

Broadcast::channel('Admin.Dashboard', function ($user) {
    return strtolower($user->rol ?? '') === 'admin';
});

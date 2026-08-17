<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

use Inertia\Inertia;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Caché para el ciclo activo (Casi estático)
        $activePeriod = \Cache::remember('active_academic_period', 1800, function() {
            return \App\Models\AcademicPeriod::where('activo', true)->first();
        });

        // Caché para notificaciones no leídas por usuario (60 segundos)
        $isAdmin = strtolower($user?->rol ?? '') === 'admin';
        $unreadCount = $isAdmin ? \Cache::remember("unread_notifs_{$user->id}", 60, function() use ($user) {
            return \App\Models\Notificacion::where('usuario_id', $user->id)->where('leido', false)->count();
        }) : 0;

        return [
            ...parent::share($request),
            'activePeriod' => $activePeriod ? [
                'id' => $activePeriod->id,
                'nombre' => $activePeriod->nombre,
                'es_nones' => $activePeriod->fecha_inicio ? (\Carbon\Carbon::parse($activePeriod->fecha_inicio)->month >= 8 || \Carbon\Carbon::parse($activePeriod->fecha_inicio)->month == 1) : true,
            ] : null,
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'nombre' => $user->nombre,
                    'apellido_paterno' => $user->apellido_paterno,
                    'apellido_materno' => $user->apellido_materno,
                    'nombre_completo' => $user->nombre_completo,
                    'email' => $user->email,
                    'rol' => strtoupper($user->rol ?? ''),
                ] : null,
            ],
            'unreadNotificationsCount' => $unreadCount,
            'docenteGroups' => $this->getDocenteGroups($user),
            'alumnoGroups' => $this->getAlumnoGroups($user),
        ];
    }

    private function getDocenteGroups($user) {
        if (!$user || strtolower($user->rol ?? '') !== 'docente') return [];

        return \Cache::remember("sidebar_docente_{$user->id}", 600, function() use ($user) {
            $teacher = \App\Models\Teacher::where('usuario_id', $user->id)->first();
            if (!$teacher) return [];

            return \App\Models\AcademicLoad::where('docente_id', $teacher->id)
                ->with(['academicGroup', 'course'])
                ->get()
                ->map(fn($load) => [
                    'id' => $load->uuid,
                    'nombre_grupo' => $load->academicGroup?->nombre ?? 'Grup. s/n',
                    'materia' => $load->course?->nombre ?? 'Mat. s/n',
                    'codigo' => $load->course?->codigo ?? 'S/C'
                ])->toArray();
        });
    }

    private function getAlumnoGroups($user) {
        if (!$user || strtolower($user->rol ?? '') !== 'alumno') return [];
        // Las tareas no alteran las materias del menú. Mantener esta caché
        // independiente evita reconstruir el menú en cada publicación.
        return \Cache::remember("sidebar_alumno_{$user->id}", 600, function() use ($user) {
            $enrollment = \App\Models\Enrollment::where('usuario_id', $user->id)->where('estatus', 'active')->first();
            if (!$enrollment) return [];

            return \App\Models\AcademicLoad::where('grupo_id', $enrollment->grupo_id)
                ->where('ciclo_id', $enrollment->ciclo_id)
                ->with(['course', 'teacher.user', 'academicGroup'])
                ->get()
                ->map(fn($load) => [
                    'id' => $load->uuid,
                    'nombre' => $load->course?->nombre ?? 'N/A',
                    'docente' => ($load->teacher && $load->teacher->user) ? $load->teacher->user->nombre_completo : 'Sin docente',
                    'description' => $load->course?->descripcion ?? 'Sin descripción',
                    'descripcion' => $load->course?->descripcion ?? 'Sin descripción',
                    'nombre_grupo' => $load->academicGroup?->nombre ?? 'N/A',
                    'color_tema' => $load->color_tema ?? 'blue'
                ])->toArray();
        });
    }
}

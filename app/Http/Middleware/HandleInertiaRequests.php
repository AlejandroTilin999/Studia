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
        $partial = $request->header('X-Inertia-Partial-Data');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'nombre' => $user->nombre,
                    'nombre_completo' => $user->nombre_completo,
                    'email' => $user->email,
                    'rol' => strtoupper($user->rol),
                    // Cargamos esto solo si se solicita explícitamente para no alentar la navegación simple
                    'docenteGroups' => $partial && str_contains($partial, 'docenteGroups')
                        ? $this->getDocenteGroups($user) : [],
                    'alumnoGroups' => $partial && str_contains($partial, 'alumnoGroups')
                        ? $this->getAlumnoGroups($user) : [],
                ] : null,
            ],
        ];
    }

    private function getDocenteGroups($user) {
        if ($user->rol !== 'docente') return [];
        $teacher = \App\Models\Teacher::where('usuario_id', $user->id)->first();
        if (!$teacher) return [];
        return \App\Models\AcademicLoad::where('docente_id', $teacher->id)
            ->with(['academicGroup', 'course'])
            ->get()
            ->map(fn($load) => [
                'id' => $load->uuid,
                'nombre_grupo' => $load->academicGroup->nombre ?? 'Grup. s/n',
                'materia' => $load->course->nombre ?? 'Mat. s/n',
                'codigo' => $load->course->codigo ?? 'S/C'
            ]);
    }

    private function getAlumnoGroups($user) {
        if ($user->rol !== 'alumno') return [];
        $enrollment = \App\Models\Enrollment::where('usuario_id', $user->id)->where('estatus', 'active')->first();
        if (!$enrollment) return [];
        return \App\Models\AcademicLoad::where('grupo_id', $enrollment->grupo_id)
            ->where('ciclo_id', $enrollment->ciclo_id)
            ->with(['course', 'teacher.user', 'academicGroup'])
            ->get()
            ->map(fn($load) => [
                'id' => $load->uuid,
                'nombre' => $load->course->nombre ?? 'N/A',
                'docente' => ($load->teacher && $load->teacher->user) ? $load->teacher->user->nombre_completo : 'Sin docente',
                'descripcion' => $load->course->descripcion ?? 'Sin descripción',
                'nombre_grupo' => $load->academicGroup->nombre ?? 'N/A'
            ]);
    }
}

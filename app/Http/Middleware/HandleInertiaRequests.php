<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'nombre' => $request->user()->nombre,
                    'nombre_completo' => $request->user()->nombre_completo,
                    'email' => $request->user()->email,
                    'rol' => strtoupper($request->user()->rol),
                    'docenteGroups' => function () use ($request) {
                        if (!$request->user() || $request->user()->rol !== 'docente') {
                            return [];
                        }

                        $teacher = \App\Models\Teacher::where('usuario_id', $request->user()->id)->first();
                        if (!$teacher) {
                            return [];
                        }

                        $loads = \App\Models\AcademicLoad::where('docente_id', $teacher->id)
                            ->with(['academicGroup', 'course'])
                            ->get();

                        return $loads->map(function ($load) {
                            return [
                                'id' => $load->uuid,
                                'nombre_grupo' => $load->academicGroup->nombre ?? 'Grup. s/n',
                                'materia' => $load->course->nombre ?? 'Mat. s/n',
                                'codigo' => $load->course->codigo ?? 'S/C'
                            ];
                        })->toArray();
                    },
                    // Cargas para el alumno
                    'alumnoGroups' => function () use ($request) {
                        if (!$request->user() || $request->user()->rol !== 'alumno') {
                            return [];
                        }

                        $enrollment = \App\Models\Enrollment::where('usuario_id', $request->user()->id)
                            ->where('estatus', 'active')
                            ->first();

                        if (!$enrollment) {
                            return [];
                        }

                        return \App\Models\AcademicLoad::where('grupo_id', $enrollment->grupo_id)
                            ->where('ciclo_id', $enrollment->ciclo_id)
                            ->with(['course', 'teacher.user', 'academicGroup'])
                            ->get()
                            ->map(function ($load) {
                                return [
                                    'id' => $load->uuid,
                                    'nombre' => $load->course->nombre ?? 'N/A',
                                    'docente' => ($load->teacher && $load->teacher->user) ? $load->teacher->user->nombre_completo : 'Sin docente',
                                    'descripcion' => $load->course->descripcion ?? 'Sin descripción',
                                    'nombre_grupo' => $load->academicGroup->nombre ?? 'N/A'
                                ];
                            })->toArray();
                    },
                ] : null,
            ],
        ];
    }
}

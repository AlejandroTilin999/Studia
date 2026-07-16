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
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => strtoupper($request->user()->role),
                    'docenteGroups' => function () use ($request) {
                        if (!$request->user() || $request->user()->role !== 'docente') {
                            return [];
                        }

                        $teacher = \App\Models\Teacher::where('user_id', $request->user()->id)->first();
                        if (!$teacher) {
                            return [];
                        }

                        $loads = \App\Models\AcademicLoad::where('teacher_id', $teacher->id)
                            ->with(['academicGroup', 'course'])
                            ->get();

                        return $loads->map(function ($load) {
                            return [
                                'id' => $load->uuid,
                                'name' => $load->academicGroup->name ?? 'Grup. s/n',
                                'materia' => $load->course->name ?? 'Mat. s/n',
                                'code' => $load->course->code ?? 'S/C'
                            ];
                        })->toArray();
                    },
                    // Cargas para el alumno
                    'alumnoGroups' => function () use ($request) {
                        if (!$request->user() || $request->user()->role !== 'alumno') {
                            return [];
                        }

                        $enrollment = \App\Models\Enrollment::where('user_id', $request->user()->id)
                            ->where('status', 'active')
                            ->first();

                        if (!$enrollment) {
                            return [];
                        }

                        return \App\Models\AcademicLoad::where('academic_group_id', $enrollment->academic_group_id)
                            ->where('academic_period_id', $enrollment->academic_period_id)
                            ->with(['course', 'teacher', 'academicGroup'])
                            ->get()
                            ->map(function ($load) {
                                return [
                                    'id' => $load->uuid,
                                    'name' => $load->course->name ?? 'N/A',
                                    'teacher' => $load->teacher ? ($load->teacher->nombre . ' ' . $load->teacher->apellido_paterno) : 'Sin docente',
                                    'description' => $load->course->description ?? 'Sin descripción',
                                    'groupName' => $load->academicGroup->name ?? 'N/A'
                                ];
                            })->toArray();
                    },
                ] : null,
            ],
        ];
    }
}

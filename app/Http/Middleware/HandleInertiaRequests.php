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
                    // Cargas para el docente
                    'docenteGroups' => function () use ($request) {
                        if (!$request->user() || $request->user()->role !== 'docente') {
                            return [];
                        }
                        return \App\Models\AcademicLoad::where('teacher_id', function ($query) use ($request) {
                            $query->select('id')->from('docentes')->where('user_id', $request->user()->id)->limit(1);
                        })->with(['academicGroup', 'course'])->get()->map(function ($load) {
                            return [
                                'id' => $load->uuid,
                                'name' => $load->academicGroup->name ?? 'N/A',
                                'materia' => $load->course->name ?? 'N/A',
                                'code' => $load->course->code ?? 'N/A'
                            ];
                        })->toArray();
                    },
                    // Cargas para el alumno
                    'alumnoGroups' => function () use ($request) {
                        if (!$request->user() || $request->user()->role !== 'alumno') {
                            return [];
                        }
                        return \App\Models\AcademicLoad::where('academic_group_id', function ($query) use ($request) {
                            $query->select('academic_group_id')->from('inscripciones')->where('user_id', $request->user()->id)->where('status', 'active')->limit(1);
                        })->with(['course', 'teacher', 'academicGroup'])->get()->map(function ($load) {
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

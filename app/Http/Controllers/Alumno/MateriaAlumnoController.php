<?php

namespace App\Http\Controllers\Alumno;

use App\Http\Controllers\Controller;
use App\Models\AcademicLoad;
use App\Models\Tarea;
use App\Services\DatosAlumnoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MateriaAlumnoController extends Controller
{
    public function show(Request $request, DatosAlumnoService $datosAlumno, string $loadUuid, ?int $parcial = null, ?int $task = null)
    {
        $studentId = auth()->id();
        $user = auth()->user();
        $enrollment = $datosAlumno->obtenerInscripcionVigente($studentId);
        abort_unless($enrollment, 404);

        $periodRevision = \Cache::get('academic_period_revision', 1);
        $load = \Cache::remember("academic_load_full_v2_{$loadUuid}_r{$periodRevision}", 1800, function() use ($loadUuid) {
            return AcademicLoad::where('uuid', $loadUuid)
                ->with(['course', 'teacher.user', 'criterios', 'academicPeriod'])
                ->firstOrFail();
        });

        if ($task && !Tarea::where('id', $task)
            ->where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->exists()) {
            abort(404);
        }

        $subjectKardex = \App\Services\GradeService::getStudentSubjectKardex($studentId, $load);
        $taskList = \App\Services\GradeService::getStudentTasks($studentId, $loadUuid);

        return Inertia::render('Alumno/Dashboard', [
            'defaultView' => 'tareas',
            'studentInfo' => $datosAlumno->obtenerInformacionPortal($user, $enrollment),
            'subjectKardex' => $subjectKardex,
            'taskList' => $taskList,
            'initialParcial' => $parcial ? (int)$parcial : null,
            'initialTask' => $task ? \App\Services\GradeService::getStudentTask($studentId, $task, $load->id) : null,
            'isCycleActive' => $datosAlumno->existeCicloActivo(),
        ]);
    }
}

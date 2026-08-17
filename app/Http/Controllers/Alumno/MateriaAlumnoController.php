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

        $load = AcademicLoad::where('uuid', $loadUuid)
            ->where('grupo_id', $enrollment->grupo_id)
            ->where('ciclo_id', $enrollment->ciclo_id)
            ->firstOrFail();

        if ($task && !Tarea::where('id', $task)
            ->where('carga_id', $load->id)
            ->where('parcial', $parcial)
            ->exists()) {
            abort(404);
        }

        // La primera respuesta solo necesita los tres parciales de la materia
        // abierta. Calcular el kardex de todo el alumno aquí retrasaba la vista.
        $subjectKardex = \App\Services\GradeService::getStudentSubjectKardex($studentId, $load->id);

        return Inertia::render('Alumno/Dashboard', [
            'defaultView' => 'tareas',
            'studentInfo' => $datosAlumno->obtenerInformacionPortal($user, $enrollment),
            // Resumen pequeño y prioritario: permite pintar los tres parciales
            // de esta materia en la primera respuesta.
            'subjectKardex' => $subjectKardex,
            // El kardex completo sigue disponible para las vistas que lo usan,
            // pero ya no bloquea la primera pintura de la materia.
            'kardex' => Inertia::defer(fn() => \App\Services\GradeService::getStudentKardex($studentId)),
            // La materia abierta no necesita descargar las tareas de todas las
            // demás materias del grupo.
            'taskList' => Inertia::defer(fn() => \App\Services\GradeService::getStudentTasks($studentId, $loadUuid)),
            // La tarea de un enlace directo se entrega en la primera respuesta.
            // El resto de tareas continúa siendo diferido para no frenar la vista.
            'initialParcial' => $parcial ? (int)$parcial : null,
            'initialTask' => $task ? \App\Services\GradeService::getStudentTask($studentId, $task, $load->id) : null,
            'isCycleActive' => $datosAlumno->existeCicloActivo(),
        ]);
    }
}

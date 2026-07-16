<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\AcademicLoad;
use App\Models\CriterioEvaluacion;
use App\Models\Grade;
use App\Models\Tarea;
use App\Models\EntregaTarea;

class GradeService
{
    /**
     * Calcula las calificaciones detalladas y promedios de un alumno.
     */
    public static function getStudentKardex($userId)
    {
        // 1. Obtener todas las inscripciones del alumno
        $enrollments = Enrollment::where('user_id', $userId)
            ->with(['academicGroup', 'academicPeriod'])
            ->get();

        $kardex = [];

        foreach ($enrollments as $enrollment) {
            $periodName = $enrollment->academicPeriod->name ?? 'N/A';
            $groupId = $enrollment->academic_group_id;
            $periodId = $enrollment->academic_period_id;

            // 2. Obtener todas las cargas académicas del grupo en este periodo
            $loads = AcademicLoad::where('academic_group_id', $groupId)
                ->where('academic_period_id', $periodId)
                ->with(['course', 'teacher'])
                ->get();

            foreach ($loads as $load) {
                $subjectName = $load->course->name ?? 'Materia Desconocida';
                $teacherName = $load->teacher 
                    ? trim("{$load->teacher->nombre} {$load->teacher->apellido_paterno} {$load->teacher->apellido_materno}")
                    : 'Sin docente';

                $parcialAverages = [];
                $parcialDetails = [];

                for ($parcial = 1; $parcial <= 3; $parcial++) {
                    // Obtener criterios de evaluación
                    $criteria = CriterioEvaluacion::where('carga_id', $load->id)
                        ->where('parcial', $parcial)
                        ->get();

                    if ($criteria->isEmpty()) {
                        $parcialAverages[$parcial] = null;
                        $parcialDetails[$parcial] = [
                            'configured' => false,
                            'criteria' => [],
                            'average' => '—'
                        ];
                        continue;
                    }

                    $criteriaData = [];
                    $filled = true;
                    $weightedSum = 0;

                    foreach ($criteria as $criterion) {
                        $score = null;

                        if ($criterion->sync_tasks) {
                            // Obtener promedio de tareas
                            $tasks = Tarea::where('carga_id', $load->id)
                                ->where('parcial', $parcial)
                                ->get();

                            if ($tasks->isEmpty()) {
                                $score = 0;
                            } else {
                                $sumNormalized = 0;
                                $count = 0;
                                foreach ($tasks as $task) {
                                    $delivery = EntregaTarea::where('tarea_id', $task->id)
                                        ->where('user_id', $userId)
                                        ->first();

                                    $taskScore = ($delivery && $delivery->score !== '') ? floatval($delivery->score) : null;
                                    if ($taskScore !== null) {
                                        $maxPoints = $task->points ?: 10;
                                        $sumNormalized += ($taskScore / $maxPoints) * 10;
                                        $count++;
                                    }
                                }
                                $score = $count === 0 ? 0 : ($sumNormalized / $count);
                            }
                        } else {
                            // Obtener calificación directa del criterio
                            $grade = Grade::where('criterio_id', $criterion->id)
                                ->where('user_id', $userId)
                                ->first();

                            $score = ($grade && $grade->score !== '') ? floatval($grade->score) : null;
                        }

                        if ($score === null) {
                            $filled = false;
                        } else {
                            $weightedSum += ($score * $criterion->porcentaje / 100);
                        }

                        $criteriaData[] = [
                            'name' => $criterion->nombre,
                            'percentage' => $criterion->porcentaje,
                            'score' => $score !== null ? round($score, 1) : null
                        ];
                    }

                    $parcialAverage = $filled ? round($weightedSum, 1) : null;
                    $parcialAverages[$parcial] = $parcialAverage;
                    $parcialDetails[$parcial] = [
                        'configured' => true,
                        'criteria' => $criteriaData,
                        'average' => $parcialAverage !== null ? $parcialAverage : '—'
                    ];
                }

                // Calcular promedio final
                $sum = 0;
                $count = 0;
                foreach ($parcialAverages as $avg) {
                    if ($avg !== null) {
                        $sum += $avg;
                        $count++;
                    }
                }

                $finalScore = $count === 0 ? '—' : round($sum / $count, 1);
                $approved = ($finalScore !== '—') ? ($finalScore >= 6.0 ? 'Sí' : 'No') : '—';

                $kardex[] = [
                    'id' => $load->id,
                    'subject' => $subjectName,
                    'teacher' => $teacherName,
                    'score' => $finalScore,
                    'approved' => $approved,
                    'period' => $periodName,
                    'details' => $parcialDetails
                ];
            }
        }

        return $kardex;
    }

    /**
     * Obtiene el listado de tareas asignadas al alumno en su grupo activo.
     */
    public static function getStudentTasks($userId)
    {
        $enrollment = Enrollment::where('user_id', $userId)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return [];
        }

        $loads = AcademicLoad::where('academic_group_id', $enrollment->academic_group_id)
            ->where('academic_period_id', $enrollment->academic_period_id)
            ->with('course')
            ->get();

        $tasksList = [];

        foreach ($loads as $load) {
            $tasks = Tarea::where('carga_id', $load->id)->get();

            foreach ($tasks as $task) {
                $delivery = EntregaTarea::where('tarea_id', $task->id)
                    ->where('user_id', $userId)
                    ->first();

                $status = 'Pendiente';
                if ($delivery) {
                    if ($delivery->score !== '') {
                        $status = 'Calificado';
                    } elseif ($delivery->status === 'submitted') {
                        $status = 'Entregado';
                    }
                }

                $deadlineFormatted = $task->deadline 
                    ? date('d \d\e F', strtotime($task->deadline)) 
                    : 'Sin fecha';

                $months = [
                    'January' => 'Enero', 'February' => 'Febrero', 'March' => 'Marzo',
                    'April' => 'Abril', 'May' => 'Mayo', 'June' => 'Junio',
                    'July' => 'Julio', 'August' => 'Agosto', 'September' => 'Septiembre',
                    'October' => 'Octubre', 'November' => 'Noviembre', 'December' => 'Diciembre'
                ];
                foreach ($months as $en => $es) {
                    $deadlineFormatted = str_replace($en, $es, $deadlineFormatted);
                }

                $tasksList[] = [
                    'id' => $task->id,
                    'subjectName' => $load->course->name ?? 'Materia Desconocida',
                    'title' => $task->name,
                    'status' => $status,
                    'desc' => $task->description ?? 'Sin descripción',
                    'points' => ($task->points ?: 10) . ' puntos',
                    'deadline' => $deadlineFormatted,
                ];
            }
        }

        return $tasksList;
    }
}

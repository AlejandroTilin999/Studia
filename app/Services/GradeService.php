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
     * Aplica la lógica de redondeo global: .6 sube, .5 baja.
     * Devuelve un entero o un guion si no hay valor.
     */
    public static function formatGrade($value)
    {
        if ($value === null || $value === '—') return '—';
        $val = floatval($value);
        return (int) floor($val + 0.4);
    }

    /**
     * Calcula las calificaciones detalladas y promedios de un alumno.
     */
    public static function getStudentKardex($userId)
    {
        $enrollments = Enrollment::where('usuario_id', $userId)
            ->with(['academicGroup', 'academicPeriod'])
            ->get();

        $kardex = [];

        foreach ($enrollments as $enrollment) {
            $periodName = $enrollment->academicPeriod->nombre ?? 'N/A';
            $groupId = $enrollment->grupo_id;
            $periodId = $enrollment->ciclo_id;

            $loads = AcademicLoad::where('grupo_id', $groupId)
                ->where('ciclo_id', $periodId)
                ->with(['course', 'teacher.user'])
                ->get();

            foreach ($loads as $load) {
                $subjectName = $load->course?->nombre ?? 'Materia Desconocida';
                $teacherName = $load->teacher?->user?->nombre_completo ?? 'Sin docente';

                $consolidado = Grade::where('usuario_id', $userId)
                    ->where('carga_id', $load->id)
                    ->whereNull('criterio_id')
                    ->first();

                $parcialDetails = [];

                for ($parcial = 1; $parcial <= 3; $parcial++) {
                    $criteria = CriterioEvaluacion::where('carga_id', $load->id)
                        ->where('parcial', $parcial)
                        ->get();

                    if ($criteria->isEmpty()) {
                        $parcialDetails[$parcial] = [
                            'configured' => false,
                            'criteria' => [],
                            'average' => '—'
                        ];
                        continue;
                    }

                    $criteriaData = [];
                    foreach ($criteria as $criterion) {
                        $score = null;

                        if ($criterion->sincronizar_tareas) {
                            $tasks = Tarea::where('carga_id', $load->id)
                                ->where('parcial', $parcial)
                                ->get();

                            if ($tasks->isEmpty()) {
                                $score = 0;
                            } else {
                                $sumNormalized = 0; $count = 0;
                                foreach ($tasks as $task) {
                                    $delivery = EntregaTarea::where('tarea_id', $task->id)
                                        ->where('usuario_id', $userId)
                                        ->first();

                                    $taskScore = ($delivery && $delivery->calificacion !== '') ? floatval($delivery->calificacion) : null;
                                    if ($taskScore !== null) {
                                        $maxPoints = $task->puntos ?: 10;
                                        $sumNormalized += ($taskScore / $maxPoints) * 10;
                                        $count++;
                                    }
                                }
                                $score = $count === 0 ? 0 : ($sumNormalized / $count);
                            }
                        } else {
                            $grade = Grade::where('criterio_id', $criterion->id)
                                ->where('usuario_id', $userId)
                                ->first();

                            $score = ($grade && $grade->calificacion !== '') ? floatval($grade->calificacion) : null;
                        }

                        $criteriaData[] = [
                            'name' => $criterion->nombre,
                            'percentage' => $criterion->porcentaje,
                            'score' => self::formatGrade($score)
                        ];
                    }

                    $pKey = "p{$parcial}";
                    $parcialAvgValue = $consolidado ? $consolidado->$pKey : null;

                    $parcialDetails[$parcial] = [
                        'configured' => true,
                        'criteria' => $criteriaData,
                        'average' => $parcialAvgValue !== null ? self::formatGrade($parcialAvgValue) : '—'
                    ];
                }

                $finalScoreFormatted = ($consolidado && $consolidado->final !== null) ? self::formatGrade($consolidado->final) : '—';
                $approved = ($finalScoreFormatted !== '—') ? ($finalScoreFormatted >= 6 ? 'Sí' : 'No') : '—';

                $kardex[] = [
                    'id' => $load->id,
                    'uuid' => $load->uuid,
                    'subject' => $subjectName,
                    'code' => $load->course?->codigo ?? 'S/C',
                    'teacher' => $teacherName,
                    'score' => $finalScoreFormatted,
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
        $enrollment = Enrollment::where('usuario_id', $userId)
            ->where('estatus', 'active')
            ->first();

        if (!$enrollment) return [];

        $loads = AcademicLoad::where('grupo_id', $enrollment->grupo_id)
            ->where('ciclo_id', $enrollment->ciclo_id)
            ->with('course')
            ->get();

        $tasksList = [];

        foreach ($loads as $load) {
            $tasks = Tarea::where('carga_id', $load->id)->get();

            foreach ($tasks as $task) {
                $delivery = EntregaTarea::where('tarea_id', $task->id)
                    ->where('usuario_id', $userId)
                    ->first();

                $status = 'Pendiente';
                if ($delivery) {
                    if ($delivery->calificacion !== '') {
                        $status = 'Calificado';
                    } elseif ($delivery->estatus === 'submitted') {
                        $status = 'Entregado';
                    }
                }

                $deadlineFormatted = $task->fecha_entrega
                    ? date('d \d\e F', strtotime($task->fecha_entrega))
                    : 'Sin fecha';

                $months = [
                    'January' => 'Enero', 'February' => 'Febrero', 'March' => 'Marzo',
                    'April' => 'Abril', 'May' => 'Mayo', 'June' => 'Junio',
                    'July' => 'Julio', 'August' => 'Agosto', 'September' => 'Septiembre',
                    'October' => 'Octubre', 'November' => 'Noviembre', 'December' => 'Diciembre'
                ];
                foreach ($months as $en => $es) $deadlineFormatted = str_replace($en, $es, $deadlineFormatted);

                $tasksList[] = [
                    'id' => $task->id,
                    'subjectName' => $load->course?->nombre ?? 'Materia Desconocida',
                    'parcial' => $task->parcial,
                    'title' => $task->nombre,
                    'status' => $status,
                    'desc' => $task->descripcion ?? 'Sin descripción',
                    'points' => ($task->puntos ?: 10) . ' puntos',
                    'deadline' => $deadlineFormatted,
                ];
            }
        }

        return $tasksList;
    }
}

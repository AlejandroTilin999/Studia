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
    private static $cachedKardex = [];
    private static $cachedTasks = [];

    /**
     * Aplica la lógica de redondeo global: .6 sube, .5 baja.
     */
    public static function formatGrade($value)
    {
        if ($value === null || $value === '—' || $value === '') return '';
        // Redondeo oficial: .6 sube, .5 baja -> floor(n + 0.4)
        return (string) (int) floor(floatval($value) + 0.4);
    }

    /**
     * Calcula las calificaciones detalladas y promedios de un alumno (Optimizado con Cache).
     */
    public static function getStudentKardex($userId)
    {
        $version = \Cache::get('student_cache_version', 1);
        return \Cache::remember("student_kardex_{$userId}_v{$version}", 600, function() use ($userId) {
            // [INTELIGENCIA v4.2] Priorizar la inscripción del ciclo VIGENTE primero
            $activeCycle = \App\Models\AcademicPeriod::where('activo', true)->first();

            $enrollment = null;
            if ($activeCycle) {
                $enrollment = Enrollment::where('usuario_id', $userId)
                    ->where('ciclo_id', $activeCycle->id)
                    ->where('estatus', 'active')
                    ->with(['academicGroup', 'academicPeriod'])
                    ->first();
            }

            if (!$enrollment) {
                $enrollment = Enrollment::where('usuario_id', $userId)
                    ->where('estatus', 'active')
                    ->with(['academicGroup', 'academicPeriod'])
                    ->orderBy('ciclo_id', 'desc')
                    ->first();
            }

            if (!$enrollment) return [];

            $periodName = $enrollment->academicPeriod->nombre ?? 'N/A';

            // 1. Carga ansiosa masiva de todas las relaciones necesarias para evitar N+1
            $loads = AcademicLoad::where('grupo_id', $enrollment->grupo_id)
                ->where('ciclo_id', $enrollment->ciclo_id)
                ->with([
                    'course',
                    'teacher.user',
                    'criterios',
                    'tareas' => function($q) use ($userId) {
                        $q->with(['entregas' => fn($eq) => $eq->where('usuario_id', $userId)]);
                    }
                ])
                ->get();

            // 2. Obtener todas las calificaciones de una sola vez
            $loadIds = $loads->pluck('id');
            $allGrades = Grade::where('usuario_id', $userId)
                ->whereIn('carga_id', $loadIds)
                ->get()
                ->groupBy('carga_id');

            $kardex = [];

            // Pre-calcular disponibilidad de parciales una sola vez para todas las materias
            $parcialLocks = [];
            if ($enrollment->academicPeriod) {
                foreach ([1, 2, 3] as $p) {
                    $parcialLocks[$p] = \App\Services\AcademicPeriodService::isCapturaHabilitada($enrollment->academicPeriod, $p, 'operacion');
                }
            }

            foreach ($loads as $load) {
                // Buscar grado consolidado (sin criterio_id)
                $loadGrades = $allGrades->get($load->id) ?: collect();
                $consolidado = $loadGrades->where('criterio_id', null)->first();

                $parcialDetails = [];

                for ($parcial = 1; $parcial <= 3; $parcial++) {
                    $criteria = $load->criterios->where('parcial', $parcial);
                    if ($criteria->isEmpty()) {
                        $parcialDetails[$parcial] = ['configured' => false, 'criteria' => [], 'average' => '—'];
                        continue;
                    }

                    $criteriaData = [];
                    $calculatedWeightedAvg = 0;
                    $hasAnyScore = false;

                    foreach ($criteria as $criterion) {
                        $score = null;
                        if ($criterion->sincronizar_tareas) {
                            $tasks = $load->tareas->where('parcial', $parcial);
                            if ($tasks->isEmpty()) {
                                $score = null;
                            } else {
                                $sumNormalized = 0; $count = 0;
                                foreach ($tasks as $task) {
                                    $delivery = $task->entregas->first();
                                    $taskScore = ($delivery && $delivery->calificacion !== null && $delivery->calificacion !== '') ? floatval($delivery->calificacion) : null;
                                    if ($taskScore !== null) {
                                        $sumNormalized += ($taskScore / ($task->puntos ?: 10)) * 10;
                                        $count++;
                                    }
                                }
                                $score = ($count === 0) ? null : ($sumNormalized / $count);
                            }
                        } else {
                            $grade = $loadGrades->where('criterio_id', $criterion->id)->first();
                            $score = ($grade && $grade->calificacion !== '') ? floatval($grade->calificacion) : null;
                        }

                        if ($score !== null) {
                            $hasAnyScore = true;
                            $calculatedWeightedAvg += ($score * ($criterion->porcentaje / 100));
                        }

                        $criteriaData[] = [
                            'name' => $criterion->nombre,
                            'percentage' => $criterion->porcentaje,
                            'score' => self::formatGrade($score)
                        ];
                    }

                    $pKey = "p{$parcial}";
                    $parcialAvgValue = $consolidado ? $consolidado->$pKey : null;

                    if ($parcialAvgValue === null && $hasAnyScore) {
                        $parcialAvgValue = $calculatedWeightedAvg;
                    }

                    $lockInfo = $parcialLocks[$parcial] ?? ['allowed' => true, 'reason' => ''];

                    $parcialDetails[$parcial] = [
                        'configured' => true,
                        'criteria' => $criteriaData,
                        'average' => $parcialAvgValue !== null ? self::formatGrade($parcialAvgValue) : '—',
                        'lock_info' => $lockInfo
                    ];
                }

                $finalScoreFormatted = ($consolidado && $consolidado->final !== null) ? self::formatGrade($consolidado->final) : '—';

                $kardex[] = [
                    'id' => $load->id,
                    'uuid' => $load->uuid,
                    'subject' => $load->course?->nombre ?? 'Materia Desconocida',
                    'description' => $load->course?->descripcion ?? 'Materia inscrita en el ciclo actual.',
                    'code' => $load->course?->codigo ?? 'S/C',
                    'teacher' => $load->teacher?->user?->nombre_completo ?? 'Sin docente',
                    'score' => $finalScoreFormatted,
                    'approved' => ($finalScoreFormatted !== '—') ? ($finalScoreFormatted >= 6 ? 'Sí' : 'No') : '—',
                    'period' => $periodName,
                    'details' => $parcialDetails,
                    'color_tema' => $load->color_tema ?? 'blue'
                ];
            }

            return $kardex;
        });
    }

    /**
     * Obtiene el listado de tareas asignadas al alumno (Optimizado con Cache).
     */
    public static function getStudentTasks($userId)
    {
        $version = \Cache::get('student_cache_version', 1);
        return \Cache::remember("student_tasks_{$userId}_v{$version}", 300, function() use ($userId) {
            // [INTELIGENCIA v4.2] Priorizar la inscripción del ciclo VIGENTE primero
            $activeCycle = \App\Models\AcademicPeriod::where('activo', true)->first();

            $enrollment = null;
            if ($activeCycle) {
                $enrollment = Enrollment::where('usuario_id', $userId)
                    ->where('ciclo_id', $activeCycle->id)
                    ->where('estatus', 'active')
                    ->first();
            }

            if (!$enrollment) {
                $enrollment = Enrollment::where('usuario_id', $userId)
                    ->where('estatus', 'active')
                    ->orderBy('ciclo_id', 'desc')
                    ->first();
            }

            if (!$enrollment) return [];

            $loads = AcademicLoad::where('grupo_id', $enrollment->grupo_id)
                ->where('ciclo_id', $enrollment->ciclo_id)
                ->with(['course', 'tareas.entregas' => fn($q) => $q->where('usuario_id', $userId)])
                ->get();

            $tasksList = [];
            $months = ['January'=>'Enero','February'=>'Febrero','March'=>'Marzo','April'=>'Abril','May'=>'Mayo','June'=>'Junio','July'=>'Julio','August'=>'Agosto','September'=>'Septiembre','October'=>'Octubre','November'=>'Noviembre','December'=>'Diciembre'];

            foreach ($loads as $load) {
                foreach ($load->tareas as $task) {
                    $delivery = $task->entregas->first();
                    $status = 'Pendiente';
                    $archivo = null;
                    if ($delivery) {
                        $status = ($delivery->calificacion !== '') ? 'Calificado' : (($delivery->estatus === 'submitted') ? 'Entregado' : 'Pendiente');
                        if ($delivery->archivo_url) {
                            $decoded = json_decode($delivery->archivo_url, true);
                            if (is_array($decoded)) {
                                $archivo = $decoded;
                            } else {
                                $archivo = [
                                    [
                                        'url' => $delivery->archivo_url ?: $delivery->google_drive_url,
                                        'nombre' => $delivery->archivo_nombre ?: 'Documento de Entrega',
                                        'google_drive_file_id' => $delivery->google_drive_file_id,
                                        'google_drive_url' => $delivery->google_drive_url
                                    ]
                                ];
                            }
                        }
                    }

                    $rawDeadline = $task->fecha_entrega;
                    if ($rawDeadline && !empty($task->hora_entrega)) {
                        $onlyDate = explode(' ', $rawDeadline)[0];
                        $cleanHora = strlen($task->hora_entrega) === 5 ? $task->hora_entrega . ':00' : $task->hora_entrega;
                        $rawDeadline = $onlyDate . ' ' . $cleanHora;
                    }

                    $deadlineFormatted = $rawDeadline ? date('d \d\e F, h:i A', strtotime($rawDeadline)) : 'Sin fecha';
                    foreach ($months as $en => $es) $deadlineFormatted = str_replace($en, $es, $deadlineFormatted);

                    $taskHash = strtoupper(substr(md5('t_' . $task->id), 0, 6));

                    $tasksList[] = [
                        'id' => $task->id,
                        'hash' => $taskHash,
                        'carga_id' => $load->uuid,
                        'subjectName' => $load->course?->nombre ?? 'Materia Desconocida',
                        'parcial' => $task->parcial,
                        'title' => $task->nombre,
                        'status' => $status,
                        'desc' => $task->descripcion ?? 'Sin descripción',
                        'points' => ($task->puntos ?: 10) . ' puntos',
                        'deadline' => $deadlineFormatted,
                        'archivo' => $archivo,
                        'grade' => ($delivery && $delivery->calificacion !== '') ? $delivery->calificacion : null,
                    ];
                }
            }

            return $tasksList;
        });
    }
}

<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\AcademicLoad;
use App\Models\CriterioEvaluacion;
use App\Models\Grade;
use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Services\AcademicPeriodService;

class GradeService
{
    private static $cachedKardex = [];
    private static $cachedTasks = [];

    /** Invalida de forma segura los snapshots académicos de todos los alumnos. */
    public static function invalidateStudentCache(): void
    {
        // Cache::increment no crea la clave de forma consistente en todos los
        // drivers. Inicializarla primero evita que una tarea nueva conserve un
        // listado anterior después de limpiar caché o en una sesión nueva.
        \Cache::add('student_cache_version', 1, now()->addDays(30));
        \Cache::increment('student_cache_version');
    }

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
        $version = self::studentCacheVersion($userId);
        return \Cache::remember("student_kardex_{$userId}_v{$version}", 600, function() use ($userId) {
            // [INTELIGENCIA v4.2] Priorizar la inscripción del ciclo VIGENTE primero
            $activeCycle = AcademicPeriodService::activePeriod();

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

            // 1. Carga ansiosa masiva de todas las relaciones necesarias para evitar N+1 (Cacheada a 0ms)
            $loads = \Cache::remember("group_loads_{$enrollment->grupo_id}_{$enrollment->ciclo_id}", 600, function() use ($enrollment) {
                return AcademicLoad::where('grupo_id', $enrollment->grupo_id)
                    ->where('ciclo_id', $enrollment->ciclo_id)
                    ->with([
                        'course',
                        'teacher.user',
                        'criterios',
                    ])
                    ->get();
            });

            // 2. Obtener todas las calificaciones de una sola vez
            $loadIds = $loads->pluck('id');
            $allGrades = Grade::where('usuario_id', $userId)
                ->whereIn('carga_id', $loadIds)
                ->get()
                ->groupBy('carga_id');

            // Antes estas relaciones se resolvían dentro de cada materia y de
            // cada tarea (N+1). Una sola consulta obtiene las entregas propias
            // del alumno para todo el grupo.
            $tasksByLoad = Tarea::whereIn('carga_id', $loadIds)
                ->with(['entregas' => fn($query) => $query->where('usuario_id', $userId)])
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
                $loadTasks = $tasksByLoad->get($load->id, collect());
                // Buscar grado consolidado (sin criterio_id)
                $loadGrades = $allGrades->get($load->id) ?: collect();
                $consolidado = $loadGrades->where('criterio_id', null)->first();

                $parcialDetails = [];

                for ($parcial = 1; $parcial <= 3; $parcial++) {
                    $lockInfo = $parcialLocks[$parcial] ?? ['allowed' => true, 'reason' => ''];
                    $criteria = $load->criterios->where('parcial', $parcial);
                    if ($criteria->isEmpty()) {
                        $parcialDetails[$parcial] = [
                            'configured' => false,
                            'criteria' => [],
                            'average' => '—',
                            'lock_info' => $lockInfo
                        ];
                        continue;
                    }

                    $criteriaData = [];
                    $calculatedWeightedAvg = 0;
                    $hasAnyScore = false;

                    foreach ($criteria as $criterion) {
                        $score = null;
                        if ($criterion->sincronizar_tareas) {
                            $tasks = $loadTasks->where('parcial', $parcial);
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
     * Obtiene sólo el resumen de una materia. Esta ruta se usa al abrir una
     * materia para renderizar sus parciales sin esperar el kardex completo.
     */
    public static function getStudentSubjectKardex($userId, int $loadId): ?array
    {
        $version = self::studentCacheVersion($userId);

        return \Cache::remember("student_subject_kardex_v2_{$userId}_{$loadId}_v{$version}", 600, function () use ($userId, $loadId) {
            $emptyGrade = "\u{2014}";
            $activeCycle = AcademicPeriodService::activePeriod();
            $enrollmentQuery = Enrollment::where('usuario_id', $userId)->where('estatus', 'active');
            $enrollment = $activeCycle
                ? (clone $enrollmentQuery)->where('ciclo_id', $activeCycle->id)->with('academicPeriod')->first()
                : null;
            $enrollment ??= $enrollmentQuery->with('academicPeriod')->orderByDesc('ciclo_id')->first();

            if (!$enrollment) return null;

            $load = AcademicLoad::whereKey($loadId)
                ->where('grupo_id', $enrollment->grupo_id)
                ->where('ciclo_id', $enrollment->ciclo_id)
                ->with(['course', 'teacher.user', 'criterios'])
                ->first();
            if (!$load) return null;

            $grades = Grade::where('usuario_id', $userId)
                ->where('carga_id', $load->id)
                ->get();
            $consolidado = $grades->where('criterio_id', null)->first();
            $tasks = Tarea::where('carga_id', $load->id)
                ->with(['entregas' => fn ($query) => $query->where('usuario_id', $userId)])
                ->get();

            $locks = [];
            foreach ([1, 2, 3] as $partial) {
                $locks[$partial] = $enrollment->academicPeriod
                    ? AcademicPeriodService::isCapturaHabilitada($enrollment->academicPeriod, $partial, 'operacion')
                    : ['allowed' => true, 'reason' => ''];
            }

            $details = [];
            foreach ([1, 2, 3] as $partial) {
                $criteria = $load->criterios->where('parcial', $partial);
                $lockInfo = $locks[$partial];
                if ($criteria->isEmpty()) {
                    $details[$partial] = ['configured' => false, 'criteria' => [], 'average' => $emptyGrade, 'lock_info' => $lockInfo];
                    continue;
                }

                $weightedAverage = 0;
                $hasScore = false;
                $criteriaData = [];
                foreach ($criteria as $criterion) {
                    $score = null;
                    if ($criterion->sincronizar_tareas) {
                        $partialTasks = $tasks->where('parcial', $partial);
                        $sum = 0;
                        $count = 0;
                        foreach ($partialTasks as $task) {
                            $delivery = $task->entregas->first();
                            $taskScore = $delivery && $delivery->calificacion !== null && $delivery->calificacion !== ''
                                ? (float) $delivery->calificacion
                                : null;
                            if ($taskScore !== null) {
                                $sum += ($taskScore / ($task->puntos ?: 10)) * 10;
                                $count++;
                            }
                        }
                        $score = $count ? $sum / $count : null;
                    } else {
                        $grade = $grades->where('criterio_id', $criterion->id)->first();
                        $score = $grade && $grade->calificacion !== '' ? (float) $grade->calificacion : null;
                    }

                    if ($score !== null) {
                        $hasScore = true;
                        $weightedAverage += $score * ($criterion->porcentaje / 100);
                    }

                    $criteriaData[] = [
                        'name' => $criterion->nombre,
                        'percentage' => $criterion->porcentaje,
                        'score' => self::formatGrade($score),
                    ];
                }

                $field = "p{$partial}";
                $average = $consolidado ? $consolidado->$field : null;
                if ($average === null && $hasScore) $average = $weightedAverage;

                $details[$partial] = [
                    'configured' => true,
                    'criteria' => $criteriaData,
                    'average' => $average !== null ? self::formatGrade($average) : $emptyGrade,
                    'lock_info' => $lockInfo,
                ];
            }

            $finalScore = $consolidado && $consolidado->final !== null
                ? self::formatGrade($consolidado->final)
                : $emptyGrade;

            return [
                'id' => $load->id,
                'uuid' => $load->uuid,
                'subject' => $load->course?->nombre ?? 'Materia Desconocida',
                'description' => $load->course?->descripcion ?? 'Materia inscrita en el ciclo actual.',
                'code' => $load->course?->codigo ?? 'S/C',
                'teacher' => $load->teacher?->user?->nombre_completo ?? 'Sin docente',
                'score' => $finalScore,
                'approved' => $finalScore !== $emptyGrade ? ($finalScore >= 6 ? 'Sí' : 'No') : $emptyGrade,
                'period' => $enrollment->academicPeriod?->nombre ?? 'N/A',
                'details' => $details,
                'color_tema' => $load->color_tema ?? 'blue',
            ];
        });
    }

    /**
     * Obtiene el listado de tareas asignadas al alumno (Optimizado con Cache).
     */
    public static function getStudentTasks($userId, ?string $loadUuid = null)
    {
        $version = self::studentCacheVersion($userId);
        $scope = $loadUuid ?: 'all';
        return \Cache::remember("student_tasks_{$userId}_{$scope}_v{$version}", 300, function() use ($userId, $loadUuid) {
            // [INTELIGENCIA v4.2] Priorizar la inscripción del ciclo VIGENTE primero
            $activeCycle = AcademicPeriodService::activePeriod();

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

            $loadsQuery = AcademicLoad::where('grupo_id', $enrollment->grupo_id)
                ->where('ciclo_id', $enrollment->ciclo_id)
                ->with(['course', 'tareas.entregas' => fn($q) => $q->where('usuario_id', $userId)]);

            if ($loadUuid) {
                $loadsQuery->where('uuid', $loadUuid);
            }

            $loads = $loadsQuery->get();

            $tasksList = [];
            $months = ['January'=>'Enero','February'=>'Febrero','March'=>'Marzo','April'=>'Abril','May'=>'Mayo','June'=>'Junio','July'=>'Julio','August'=>'Agosto','September'=>'Septiembre','October'=>'Octubre','November'=>'Noviembre','December'=>'Diciembre'];

            foreach ($loads as $load) {
                foreach ($load->tareas as $task) {
                    $delivery = $task->entregas->first();
                    $status = 'Pendiente';
                    $archivo = null;
                    if ($delivery) {
                        $hasGrade = $delivery->calificacion !== null && $delivery->calificacion !== '';
                        $status = $hasGrade ? 'Calificado' : (($delivery->estatus === 'submitted') ? 'Entregado' : 'Pendiente');
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

                    $deadlineAt = $task->deadlineAt();
                    $deadlineFormatted = $deadlineAt?->format('d \d\e F, h:i A') ?? 'Sin fecha';
                    foreach ($months as $en => $es) $deadlineFormatted = str_replace($en, $es, $deadlineFormatted);

                    $isOverdue = $deadlineAt ? $deadlineAt->isPast() : false;
                    if ($status === 'Pendiente' && $isOverdue) {
                        $status = 'Vencida';
                    }

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
                        'deadlineAt' => $deadlineAt?->toIso8601String(),
                        'isOverdue' => $isOverdue,
                        // Material publicado por el docente. Este campo es distinto
                        // de `archivo`, que contiene únicamente la entrega del alumno.
                        'attachments' => is_array($task->archivos)
                            ? $task->archivos
                            : (json_decode($task->archivos, true) ?: []),
                        'archivo' => $archivo,
                        'grade' => ($delivery && $delivery->calificacion !== null && $delivery->calificacion !== '') ? $delivery->calificacion : null,
                    ];
                }
            }

            return $tasksList;
        });
    }

    /**
     * Datos mínimos de una tarea concreta para abrir enlaces directos sin
     * esperar la carga diferida del listado completo de la materia.
     */
    public static function getStudentTask($userId, int $taskId, int $loadId): ?array
    {
        $task = Tarea::query()
            ->whereKey($taskId)
            ->where('carga_id', $loadId)
            ->with([
                'academicLoad.course',
                'entregas' => fn ($query) => $query->where('usuario_id', $userId),
            ])
            ->first();

        if (!$task) return null;

        $delivery = $task->entregas->first();
        $status = $delivery && $delivery->calificacion !== null && $delivery->calificacion !== ''
            ? 'Calificado'
            : ($delivery && $delivery->estatus === 'submitted' ? 'Entregado' : 'Pendiente');

        $archivo = null;
        if ($delivery?->archivo_url) {
            $decoded = json_decode($delivery->archivo_url, true);
            $archivo = is_array($decoded) ? $decoded : [[
                'url' => $delivery->archivo_url ?: $delivery->google_drive_url,
                'nombre' => $delivery->archivo_nombre ?: 'Documento de Entrega',
                'google_drive_file_id' => $delivery->google_drive_file_id,
                'google_drive_url' => $delivery->google_drive_url,
            ]];
        }

        $deadlineAt = $task->deadlineAt();
        $deadline = $deadlineAt?->format('d \\d\\e F, h:i A') ?? 'Sin fecha';
        $deadline = str_replace(
            ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            $deadline
        );

        return [
            'id' => $task->id,
            'hash' => strtoupper(substr(md5('t_' . $task->id), 0, 6)),
            'carga_id' => $task->academicLoad?->uuid ?? $task->carga_id,
            'subjectName' => $task->academicLoad?->course?->nombre ?? 'Materia Desconocida',
            'parcial' => $task->parcial,
            'title' => $task->nombre,
            'status' => $status === 'Pendiente' && $task->isOverdue() ? 'Vencida' : $status,
            'desc' => $task->descripcion ?? 'Sin descripción',
            'points' => ($task->puntos ?: 10) . ' puntos',
            'deadline' => $deadline,
            'deadlineAt' => $deadlineAt?->toIso8601String(),
            'isOverdue' => $task->isOverdue(),
            'attachments' => is_array($task->archivos) ? $task->archivos : (json_decode($task->archivos, true) ?: []),
            'archivo' => $archivo,
            'grade' => $delivery && $delivery->calificacion !== null && $delivery->calificacion !== '' ? $delivery->calificacion : null,
        ];
    }

    private static function studentCacheVersion($userId): string
    {
        $global = \Cache::get('student_cache_version', 1);
        $personal = \Cache::get("student_cache_version_{$userId}", 1);

        return "{$global}_{$personal}";
    }

    /**
     * Obtiene el Histórico Académico Completo del Alumno (Todos los ciclos / semestres cursados).
     */
    public static function getFullStudentKardex($userId)
    {
        $version = self::studentCacheVersion($userId);
        return \Cache::remember("student_full_kardex_{$userId}_v{$version}", 600, function() use ($userId) {
            $enrollments = Enrollment::query()
                ->where('usuario_id', $userId)
                ->with(['academicGroup', 'academicPeriod'])
                ->orderBy('ciclo_id', 'desc')
                ->get();

            if ($enrollments->isEmpty()) {
                return [
                    'summary' => [
                        'gpa' => '0.0',
                        'totalSubjects' => 0,
                        'approvedSubjects' => 0,
                        'totalCredits' => 0,
                        'semestersCount' => 0,
                    ],
                    'periods' => []
                ];
            }

            $allGroupLoads = AcademicLoad::query()
                ->whereIn('grupo_id', $enrollments->pluck('grupo_id'))
                ->whereIn('ciclo_id', $enrollments->pluck('ciclo_id'))
                ->with(['course', 'teacher.user'])
                ->get();

            $loadIds = $allGroupLoads->pluck('id');
            $allGrades = Grade::where('usuario_id', $userId)
                ->whereIn('carga_id', $loadIds)
                ->get()
                ->groupBy('carga_id');

            $periodsData = [];
            $totalGradeSum = 0;
            $gradedSubjectsCount = 0;
            $approvedCount = 0;
            $totalSubjectsCount = 0;
            $totalCreditsCount = 0;

            foreach ($enrollments as $enrollment) {
                $loads = $allGroupLoads
                    ->where('grupo_id', $enrollment->grupo_id)
                    ->where('ciclo_id', $enrollment->ciclo_id);

                $subjects = [];
                foreach ($loads as $load) {
                    $loadGrades = $allGrades->get($load->id) ?: collect();
                    $consolidado = $loadGrades->where('criterio_id', null)->first();

                    $p1 = self::formatGrade($consolidado?->p1);
                    $p2 = self::formatGrade($consolidado?->p2);
                    $p3 = self::formatGrade($consolidado?->p3);
                    $finalGradeRaw = $consolidado?->final ?? $consolidado?->calificacion;
                    
                    $validParcials = array_filter([$consolidado?->p1, $consolidado?->p2, $consolidado?->p3], fn($v) => $v !== null && $v !== '' && $v !== '—');

                    if (($finalGradeRaw === null || $finalGradeRaw === '' || $finalGradeRaw === '—') && count($validParcials) === 3) {
                        $finalGradeRaw = array_sum($validParcials) / 3;
                    }

                    $finalGrade = self::formatGrade($finalGradeRaw);
                    $isCompleted = $finalGrade !== '' && $finalGrade !== '—';
                    $numericGrade = $isCompleted ? floatval($finalGrade) : (count($validParcials) > 0 ? (array_sum($validParcials) / count($validParcials)) : null);

                    if ($numericGrade !== null) {
                        $totalGradeSum += $numericGrade;
                        $gradedSubjectsCount++;
                        if ($numericGrade >= 6.0) {
                            $approvedCount++;
                        }
                    }

                    $credits = $load->course?->creditos ?? 8;
                    $totalCreditsCount += $credits;
                    $totalSubjectsCount++;

                    $status = 'En Cursamiento';
                    if ($consolidado?->estatus && $consolidado->estatus !== '' && $consolidado->estatus !== 'En Cursamiento') {
                        $status = $consolidado->estatus;
                    } else if ($isCompleted || count($validParcials) === 3) {
                        $status = ($numericGrade !== null && $numericGrade >= 6.0) ? 'Aprobada' : 'Reprobada';
                    }

                    $subjects[] = [
                        'id' => $load->id,
                        'code' => $load->course?->clave ?? ('MAT-' . $load->id),
                        'name' => $load->course?->nombre ?? 'Asignatura',
                        'teacher' => $load->teacher?->user?->nombre_completo ?? 'Sin Docente',
                        'p1' => $p1 ?: '—',
                        'p2' => $p2 ?: '—',
                        'p3' => $p3 ?: '—',
                        'finalGrade' => $finalGrade ?: '—',
                        'credits' => $credits,
                        'status' => $status,
                    ];
                }

                $periodsData[] = [
                    'cycleId' => $enrollment->ciclo_id,
                    'cycleName' => $enrollment->academicPeriod?->nombre ?? 'Ciclo Académico',
                    'semester' => $enrollment->academicGroup?->semestre ?? 1,
                    'groupName' => ($enrollment->academicGroup?->codigo ?? '') . ' ' . ($enrollment->academicGroup?->nombre ?? 'Grupo'),
                    'status' => $enrollment->estatus === 'active' ? 'Vigente' : ($enrollment->estatus === 'promoted' ? 'Promovido' : 'Concluido'),
                    'subjects' => $subjects,
                ];
            }

            $gpa = $gradedSubjectsCount > 0 ? number_format($totalGradeSum / $gradedSubjectsCount, 1) : '—';

            return [
                'summary' => [
                    'gpa' => $gpa,
                    'totalSubjects' => $totalSubjectsCount,
                    'approvedSubjects' => $approvedCount,
                    'totalCredits' => $totalCreditsCount,
                    'semestersCount' => count($periodsData),
                ],
                'periods' => $periodsData,
            ];
        });
    }
}

<?php

namespace App\Services;

use App\Models\Grade;
use App\Models\CriterioEvaluacion;
use App\Models\Tarea;
use App\Models\EntregaTarea;

class GradeConsolidator
{
    /**
     * Consolida las calificaciones de un alumno para una carga académica específica.
     * Guarda el resumen en la tabla 'calificaciones' con criterio_id = null.
     */
    public static function consolidate($userId, $cargaId)
    {
        // [OPTIMIZACIÓN] Carga masiva de datos en memoria para evitar N+1
        $criteria = CriterioEvaluacion::where('carga_id', $cargaId)->get();
        $tasks = Tarea::where('carga_id', $cargaId)->get();
        $grades = Grade::where('usuario_id', $userId)->where('carga_id', $cargaId)->get();
        $submissions = EntregaTarea::where('usuario_id', $userId)->whereIn('tarea_id', $tasks->pluck('id'))->get();

        $averages = [];
        $totalParciales = 3;

        for ($p = 1; $p <= $totalParciales; $p++) {
            $averages[$p] = self::calculateParcialAverage($userId, $cargaId, $p, $criteria, $tasks, $grades, $submissions);
        }

        // Calcular promedio final (solo de los que tengan nota)
        $validAverages = array_filter($averages, fn($v) => $v !== null);
        $finalAverage = count($validAverages) > 0 ? array_sum($validAverages) / count($validAverages) : null;

        // Determinar estatus
        $estatus = 'pendiente';
        if ($finalAverage !== null) {
            $estatus = $finalAverage >= 6.0 ? 'aprobado' : 'reprobado';
        }

        // Guardar o actualizar el consolidado (criterio_id es null para el resumen)
        return Grade::updateOrCreate(
            [
                'usuario_id' => $userId,
                'carga_id' => $cargaId,
                'criterio_id' => null
            ],
            [
                'p1' => $averages[1],
                'p2' => $averages[2],
                'p3' => $averages[3],
                'final' => $finalAverage !== null ? \App\Services\GradeService::formatGrade($finalAverage) : null,
                'estatus' => $estatus
            ]
        );
    }

    /**
     * Calcula el promedio de un parcial específico utilizando datos en memoria.
     */
    private static function calculateParcialAverage($userId, $cargaId, $parcial, $allCriteria, $allTasks, $allGrades, $allSubmissions)
    {
        $criteria = $allCriteria->where('parcial', $parcial);

        if ($criteria->isEmpty()) {
            return null;
        }

        $totalWeightedScore = 0;
        $allCriteriaFilled = true;

        foreach ($criteria as $criterion) {
            $score = 0;

            if ($criterion->sincronizar_tareas) {
                // Calcular promedio de tareas de la plataforma en memoria
                $score = self::getPlatformTasksAverage($userId, $cargaId, $parcial, $allTasks, $allSubmissions);
            } else {
                // Obtener nota capturada manualmente desde la colección en memoria
                $grade = $allGrades->where('criterio_id', $criterion->id)->first();

                if (!$grade || $grade->calificacion === '') {
                    $allCriteriaFilled = false;
                    break;
                }
                $score = (float) $grade->calificacion;
            }

            $totalWeightedScore += ($score * ($criterion->porcentaje / 100));
        }

        return $allCriteriaFilled ? \App\Services\GradeService::formatGrade($totalWeightedScore) : null;
    }

    /**
     * Calcula el promedio de tareas (normalizado a escala 0-10) utilizando datos en memoria.
     */
    private static function getPlatformTasksAverage($userId, $cargaId, $parcial, $allTasks, $allSubmissions)
    {
        $tareas = $allTasks->where('parcial', $parcial);

        if ($tareas->isEmpty()) {
            return 0;
        }

        $sumNormalized = 0;
        $count = 0;

        foreach ($tareas as $tarea) {
            $entrega = $allSubmissions->where('tarea_id', $tarea->id)->first();

            $score = $entrega ? (float)$entrega->calificacion : 0;
            $maxPoints = $tarea->puntos ?: 10;

            $normalized = ($score / $maxPoints) * 10;
            $sumNormalized += $normalized;
            $count++;
        }

        return $count > 0 ? $sumNormalized / $count : 0;
    }
}

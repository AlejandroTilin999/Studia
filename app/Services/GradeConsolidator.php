<?php

namespace App\Services;

use App\Models\ConsolidadoCalificacion;
use App\Models\CriterioEvaluacion;
use App\Models\Grade;
use App\Models\Tarea;
use App\Models\EntregaTarea;

class GradeConsolidator
{
    /**
     * Consolida las calificaciones de un alumno para una carga académica específica.
     */
    public static function consolidate($userId, $cargaId)
    {
        $averages = [];
        $passCount = 0;
        $totalParciales = 3;

        for ($p = 1; $p <= $totalParciales; $p++) {
            $averages[$p] = self::calculateParcialAverage($userId, $cargaId, $p);
        }

        // Calcular promedio final (solo de los que tengan nota)
        $validAverages = array_filter($averages, fn($v) => $v !== null);
        $finalAverage = count($validAverages) > 0 ? array_sum($validAverages) / count($validAverages) : null;

        // Determinar estatus
        $estatus = 'pendiente';
        if ($finalAverage !== null) {
            $estatus = $finalAverage >= 7.0 ? 'aprobado' : 'reprobado';
        }

        // Guardar o actualizar en la tabla de consolidado
        return ConsolidadoCalificacion::updateOrCreate(
            [
                'user_id' => $userId,
                'carga_id' => $cargaId,
            ],
            [
                'p1' => $averages[1],
                'p2' => $averages[2],
                'p3' => $averages[3],
                'final' => $finalAverage !== null ? round($finalAverage, 1) : null,
                'estatus' => $estatus
            ]
        );
    }

    /**
     * Calcula el promedio de un parcial específico para un alumno.
     */
    private static function calculateParcialAverage($userId, $cargaId, $parcial)
    {
        $criteria = CriterioEvaluacion::where('carga_id', $cargaId)
            ->where('parcial', $parcial)
            ->get();

        if ($criteria->isEmpty()) {
            return null;
        }

        $totalWeightedScore = 0;
        $allCriteriaFilled = true;

        foreach ($criteria as $criterion) {
            $score = 0;

            if ($criterion->sync_tasks) {
                // Calcular promedio de tareas de la plataforma
                $score = self::getPlatformTasksAverage($userId, $cargaId, $parcial);
            } else {
                // Obtener nota capturada manualmente
                $grade = Grade::where('criterio_id', $criterion->id)
                    ->where('user_id', $userId)
                    ->first();

                if (!$grade || $grade->score === '') {
                    $allCriteriaFilled = false;
                    break;
                }
                $score = (float) $grade->score;
            }

            $totalWeightedScore += ($score * ($criterion->porcentaje / 100));
        }

        return $allCriteriaFilled ? round($totalWeightedScore, 1) : null;
    }

    /**
     * Calcula el promedio de tareas (normalizado a escala 0-10) para la plataforma.
     */
    private static function getPlatformTasksAverage($userId, $cargaId, $parcial)
    {
        $tareas = Tarea::where('carga_id', $cargaId)
            ->where('parcial', $parcial)
            ->get();

        if ($tareas->isEmpty()) {
            return 0;
        }

        $sumNormalized = 0;
        $count = 0;

        foreach ($tareas as $tarea) {
            $entrega = EntregaTarea::where('tarea_id', $tarea->id)
                ->where('user_id', $userId)
                ->first();

            $score = $entrega ? (float)$entrega->score : 0;
            $maxPoints = $tarea->points ?: 10;

            $normalized = ($score / $maxPoints) * 10;
            $sumNormalized += $normalized;
            $count++;
        }

        return $count > 0 ? $sumNormalized / $count : 0;
    }
}

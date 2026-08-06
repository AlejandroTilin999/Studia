<?php

namespace App\Services;

use App\Models\Grade;
use App\Models\CriterioEvaluacion;
use App\Models\Tarea;
use App\Models\EntregaTarea;
use Illuminate\Support\Facades\DB;

class GradeConsolidator
{
    /**
     * Consolida las calificaciones de un alumno para una carga académica específica.
     */
    public static function consolidate($userId, $cargaId)
    {
        $criteria = CriterioEvaluacion::where('carga_id', $cargaId)->get();
        $tasks = Tarea::where('carga_id', $cargaId)->get();
        $grades = Grade::where('usuario_id', $userId)->where('carga_id', $cargaId)->get();
        $submissions = EntregaTarea::where('usuario_id', $userId)->whereIn('tarea_id', $tasks->pluck('id'))->get();

        $data = self::calculateConsolidatedData($userId, $cargaId, $criteria, $tasks, $grades, $submissions);

        return Grade::updateOrCreate(
            ['usuario_id' => $userId, 'carga_id' => $cargaId, 'criterio_id' => null],
            $data
        );
    }

    /**
     * [ALTO RENDIMIENTO] Consolida las calificaciones de TODO el grupo de una carga académica.
     * Reduce cientos de consultas a solo unas pocas.
     */
    public static function consolidateGroup($cargaId)
    {
        $criteria = CriterioEvaluacion::where('carga_id', $cargaId)->get();
        $tasks = Tarea::where('carga_id', $cargaId)->get();
        $allGrades = Grade::where('carga_id', $cargaId)->get();
        $allSubmissions = EntregaTarea::whereIn('tarea_id', $tasks->pluck('id'))->get();

        $userIds = $allGrades->pluck('usuario_id')->unique();
        $upsertData = [];

        foreach ($userIds as $userId) {
            $userGrades = $allGrades->where('usuario_id', $userId);
            $userSubmissions = $allSubmissions->where('usuario_id', $userId);

            $consolidated = self::calculateConsolidatedData($userId, $cargaId, $criteria, $tasks, $userGrades, $userSubmissions);

            $upsertData[] = array_merge([
                'usuario_id' => $userId,
                'carga_id' => $cargaId,
                'criterio_id' => null,
                'updated_at' => now(),
            ], $consolidated);
        }

        if (empty($upsertData)) return;

        // Usar upsert para guardar todo de un solo golpe (Atomic & Fast)
        Grade::upsert($upsertData, ['usuario_id', 'carga_id', 'criterio_id'], ['p1', 'p2', 'p3', 'final', 'estatus', 'updated_at']);
    }

    /**
     * Lógica compartida para calcular promedios.
     */
    private static function calculateConsolidatedData($userId, $cargaId, $criteria, $tasks, $grades, $submissions)
    {
        $averages = [];
        for ($p = 1; $p <= 3; $p++) {
            $averages[$p] = self::calculateParcialAverage($userId, $cargaId, $p, $criteria, $tasks, $grades, $submissions);
        }

        $validAverages = array_filter($averages, fn($v) => $v !== null);
        $finalAverage = count($validAverages) > 0 ? array_sum($validAverages) / count($validAverages) : null;

        $estatus = 'pendiente';
        if ($finalAverage !== null) {
            $estatus = $finalAverage >= 6.0 ? 'aprobado' : 'reprobado';
        }

        return [
            'p1' => $averages[1],
            'p2' => $averages[2],
            'p3' => $averages[3],
            'final' => $finalAverage !== null ? \App\Services\GradeService::formatGrade($finalAverage) : null,
            'estatus' => $estatus
        ];
    }

    private static function calculateParcialAverage($userId, $cargaId, $parcial, $allCriteria, $allTasks, $allGrades, $allSubmissions)
    {
        $criteria = $allCriteria->where('parcial', $parcial);
        if ($criteria->isEmpty()) return null;

        $totalWeightedScore = 0;
        $allCriteriaFilled = true;

        foreach ($criteria as $criterion) {
            $score = 0;
            if ($criterion->sincronizar_tareas) {
                $score = self::getPlatformTasksAverage($userId, $cargaId, $parcial, $allTasks, $allSubmissions);
            } else {
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

    private static function getPlatformTasksAverage($userId, $cargaId, $parcial, $allTasks, $allSubmissions)
    {
        $tareas = $allTasks->where('parcial', $parcial);
        if ($tareas->isEmpty()) return 0;

        $sumNormalized = 0;
        $count = 0;

        foreach ($tareas as $tarea) {
            $entrega = $allSubmissions->where('tarea_id', $tarea->id)->first();
            $score = $entrega ? (float)$entrega->calificacion : 0;
            $maxPoints = $tarea->puntos ?: 10;
            $sumNormalized += ($score / $maxPoints) * 10;
            $count++;
        }

        return $count > 0 ? $sumNormalized / $count : 0;
    }
}

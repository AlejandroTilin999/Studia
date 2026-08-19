<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class DatosAlumnoService
{
    public function obtenerInscripcionVigente(int $usuarioId): ?Enrollment
    {
        return Cache::remember("inscripcion_alumno_{$usuarioId}", 600, function () use ($usuarioId) {
            $cicloActivo = AcademicPeriodService::activePeriod();

            $consulta = Enrollment::where('usuario_id', $usuarioId)
                ->where('estatus', 'active')
                ->with(['academicGroup.tutor.user', 'academicPeriod']);

            if ($cicloActivo) {
                $inscripcionDelCiclo = (clone $consulta)
                    ->where('ciclo_id', $cicloActivo->id)
                    ->first();

                if ($inscripcionDelCiclo) {
                    return $inscripcionDelCiclo;
                }
            }

            return $consulta->orderByDesc('ciclo_id')->first();
        });
    }

    public function obtenerInformacionPortal(User $usuario, ?Enrollment $inscripcion): array
    {
        $nombreCiclo = $inscripcion?->academicPeriod?->nombre ?? 'Ciclo no activo';
        $ciclo = str_starts_with($nombreCiclo, 'Ciclo')
            ? $nombreCiclo
            : "Ciclo Escolar {$nombreCiclo}";

        return [
            'groupId' => $inscripcion?->grupo_id,
            'name' => $usuario->nombre_completo,
            'firstName' => $usuario->nombre,
            'lastNamePaternal' => $usuario->apellido_paterno,
            'lastNameMaternal' => $usuario->apellido_materno,
            'email' => $usuario->email,
            'matricula' => $inscripcion?->codigo_alumno ?? 'ALU-' . $usuario->id,
            'groupName' => $inscripcion?->academicGroup
                ? ($inscripcion->academicGroup->codigo . ' ' . $inscripcion->academicGroup->nombre)
                : 'Sin grupo',
            'specialty' => $inscripcion?->academicGroup?->especialidad ?? 'Técnico en Informática',
            'registeredAt' => $inscripcion?->created_at?->format('M Y'),
            'gpa' => '—',
            'tutor' => $inscripcion?->academicGroup?->tutor?->user?->nombre_completo ?? 'Sin tutor',
            'ciclo' => $ciclo,
        ];
    }

    public function existeCicloActivo(): bool
    {
        return AcademicPeriodService::activePeriod() !== null;
    }
}

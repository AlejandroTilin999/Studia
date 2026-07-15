<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Specialty;
use App\Models\Turno;
use App\Models\PlanEstudio;
use App\Models\Aula;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Especialidades
        $inf = Specialty::updateOrCreate(['code' => 'INF'], ['name' => 'Informática']);
        $gts = Specialty::updateOrCreate(['code' => 'GTS'], ['name' => 'Gastronomía']);

        // 2. Turnos
        Turno::updateOrCreate(['nombre' => 'Matutino']);
        Turno::updateOrCreate(['nombre' => 'Vespertino']);
        Turno::updateOrCreate(['nombre' => 'Horario único']);

        // 3. Planes de estudio
        PlanEstudio::updateOrCreate(
            ['nombre' => 'Plan de Estudios 2026 (Informática)'],
            ['especialidad_id' => $inf->id, 'anio_inicio' => 2026, 'activo' => true]
        );
        PlanEstudio::updateOrCreate(
            ['nombre' => 'Plan de Estudios 2026 (Gastronomía)'],
            ['especialidad_id' => $gts->id, 'anio_inicio' => 2026, 'activo' => true]
        );

        // 4. Aulas
        Aula::updateOrCreate(['nombre' => 'Aula 101'], ['edificio' => 'Edificio A', 'capacidad' => 30]);
        Aula::updateOrCreate(['nombre' => 'Aula 102'], ['edificio' => 'Edificio A', 'capacidad' => 30]);
    }
}

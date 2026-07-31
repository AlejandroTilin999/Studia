<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use Carbon\Carbon;

class DatabasePowerBISeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_MX');

        echo "Cleaning database...\n";
        $this->truncateTables();

        echo "Creating master admin...\n";
        $adminId = DB::table('users')->insertGetId([
            'nombre' => 'Admin',
            'apellido_paterno' => 'Prepa',
            'apellido_materno' => 'HID',
            'email' => 'admin.prepahid@gmail.com',
            'password' => Hash::make('Prepahid2026'),
            'rol' => 'admin',
            'activo' => true,
            'password_changed' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        echo "Creating cycles...\n";
        $this->createCycles();

        echo "Creating specialties...\n";
        $specialties = $this->createSpecialties();

        echo "Creating subject catalog...\n";
        $subjects = $this->createSubjects($specialties);

        echo "Creating 40 teachers...\n";
        $teachers = $this->createTeachers($faker);

        echo "Creating groups and students (300 total)...\n";
        $this->createGroupsAndStudents($faker, $specialties, $teachers, $subjects);

        echo "Generating audit logs...\n";
        $this->createLogs($faker, $adminId);

        echo "Big Data Generation Finished Successfully!\n";
    }

    private function truncateTables()
    {
        $tables = [
            'notificaciones', 'reporte_descargas', 'auditoria_administrativa',
            'password_reset_requests', 'entregas_tareas', 'tareas',
            'calificaciones', 'criterios_evaluacion', 'cargas_academicas',
            'inscripciones', 'alumnos', 'docentes', 'especialidad_materia',
            'materias', 'grupos', 'especialidades', 'ciclos_escolares', 'users'
        ];

        DB::statement('SET CONSTRAINTS ALL DEFERRED');
        foreach ($tables as $table) {
            DB::statement("TRUNCATE TABLE $table CASCADE");
        }
    }

    private function createCycles()
    {
        $cycleData = [
            ['id' => 1, 'nombre' => 'Ciclo Escolar 2024-2025 / Periodo A', 'status' => 'cerrado', 'fecha_inicio' => '2024-08-20', 'fecha_fin' => '2024-12-15'],
            ['id' => 2, 'nombre' => 'Ciclo Escolar 2024-2025 / Periodo B', 'status' => 'cerrado', 'fecha_inicio' => '2025-02-05', 'fecha_fin' => '2025-06-25'],
            ['id' => 3, 'nombre' => 'Ciclo Escolar 2025-2026 / Periodo A', 'status' => 'cerrado', 'fecha_inicio' => '2025-08-25', 'fecha_fin' => '2025-12-18'],
            ['id' => 4, 'nombre' => 'Ciclo Escolar 2025-2026 / Periodo B', 'status' => 'cerrado', 'fecha_inicio' => '2026-02-02', 'fecha_fin' => '2026-06-20'],
            ['id' => 5, 'nombre' => 'Ciclo Escolar 2026-2027 / Periodo A', 'status' => 'activo', 'fecha_inicio' => '2026-08-31', 'fecha_fin' => '2026-12-18', 'activo' => true],
        ];

        foreach ($cycleData as $c) {
            DB::table('ciclos_escolares')->insert(array_merge($c, [
                'p1_inicio' => $c['fecha_inicio'],
                'p1_fin' => Carbon::parse($c['fecha_inicio'])->addWeeks(6)->toDateString(),
                'p2_inicio' => Carbon::parse($c['fecha_inicio'])->addWeeks(7)->toDateString(),
                'p2_fin' => Carbon::parse($c['fecha_inicio'])->addWeeks(12)->toDateString(),
                'p3_inicio' => Carbon::parse($c['fecha_inicio'])->addWeeks(13)->toDateString(),
                'p3_fin' => $c['fecha_fin'],
                'created_at' => now()
            ]));
        }
    }

    private function createSpecialties()
    {
        $data = [
            ['id' => 1, 'nombre' => 'Informática', 'codigo' => 'INF', 'sub_areas' => json_encode(['Desarrollo Web', 'Redes', 'Bases de Datos'])],
            ['id' => 2, 'nombre' => 'Administración', 'codigo' => 'ADM', 'sub_areas' => json_encode(['Recursos Humanos', 'Mercadotecnia', 'Finanzas'])],
            ['id' => 3, 'nombre' => 'Contabilidad', 'codigo' => 'CON', 'sub_areas' => json_encode(['Auditoría', 'Impuestos', 'Costos'])],
        ];
        DB::table('especialidades')->insert($data);
        return $data;
    }

    private function createSubjects($specialties)
    {
        $subjects = [];
        $areas = ['Matemáticas', 'Ciencias', 'Comunicación', 'Ciencias Sociales', 'Especialidad'];

        for ($s = 1; $s <= 6; $s++) {
            $baseSubjects = ["Matemáticas $s", "Inglés $s", "Química $s", "Física $s", "Historia $s", "Ética $s"];
            foreach ($baseSubjects as $name) {
                $id = DB::table('materias')->insertGetId([
                    'codigo' => strtoupper(Str::random(6)),
                    'nombre' => $name,
                    'semestre' => $s,
                    'area' => $areas[rand(0, 3)],
                    'tipo' => 'General',
                    'created_at' => now(),
                ]);
                $subjects[] = ['id' => $id, 'semestre' => $s, 'tipo' => 'General'];
                foreach ($specialties as $spec) {
                    DB::table('especialidad_materia')->insert(['materia_id' => $id, 'especialidad_id' => $spec['id']]);
                }
            }
        }

        foreach ($specialties as $spec) {
            for ($s = 1; $s <= 6; $s++) {
                $id = DB::table('materias')->insertGetId([
                    'codigo' => $spec['codigo'] . "-00$s",
                    'nombre' => $spec['nombre'] . " Técnica $s",
                    'semestre' => $s,
                    'area' => 'Especialidad',
                    'tipo' => 'Especialidad',
                    'created_at' => now(),
                ]);
                $subjects[] = ['id' => $id, 'semestre' => $s, 'tipo' => 'Especialidad', 'spec_id' => $spec['id']];
                DB::table('especialidad_materia')->insert(['materia_id' => $id, 'especialidad_id' => $spec['id']]);
            }
        }
        return $subjects;
    }

    private function createTeachers($faker)
    {
        $teachers = [];
        for ($i = 1; $i <= 40; $i++) {
            $nombre = $faker->firstName;
            $paterno = $faker->lastName;
            $email = strtolower($nombre . "." . $paterno . "." . substr($nombre, 0, 1) . substr($paterno, 0, 1) . $i . "@prepahidalgo.edu.mx");

            $userId = DB::table('users')->insertGetId([
                'nombre' => $nombre, 'apellido_paterno' => $paterno, 'apellido_materno' => $faker->lastName,
                'email' => $email, 'password' => Hash::make('Prepahid2026'), 'rol' => 'docente',
                'telefono' => '443' . $faker->numerify('#######'), 'activo' => true, 'created_at' => now(),
            ]);

            $spec = ($i <= 20) ? 'Informática' : (($i <= 32) ? 'Administración' : 'Contabilidad');
            $id = DB::table('docentes')->insertGetId([
                'usuario_id' => $userId, 'codigo_empleado' => "DOC-" . strtoupper(substr($nombre, 0, 1) . substr($paterno, 0, 1)) . "2024$i",
                'especialidad' => $spec, 'created_at' => now(),
            ]);
            $teachers[] = ['id' => $id, 'spec' => $spec];
        }
        return $teachers;
    }

    private function createGroupsAndStudents($faker, $specialties, $teachers, $subjects)
    {
        $studentCount = 0;
        $targetTotal = 300;
        $specConfig = ['Informática' => ['code' => 'INF', 'sec' => ['A', 'B']], 'Administración' => ['code' => 'ADM', 'sec' => ['A']], 'Contabilidad' => ['code' => 'CON', 'sec' => ['A']]];

        foreach ($specConfig as $specName => $conf) {
            for ($s = 1; $s <= 6; $s++) {
                foreach ($conf['sec'] as $sec) {
                    $genYear = 2026 - (int)floor(($s - 1) / 2);
                    $groupId = DB::table('grupos')->insertGetId([
                        'codigo' => "{$s}{$sec}-{$conf['code']}", 'nombre' => "{$s}°{$sec} $specName",
                        'semestre' => $s, 'generacion' => "$genYear-" . ($genYear + 1), 'turno' => 'Matutino',
                        'especialidad' => $specName, 'activo' => true, 'created_at' => now(),
                    ]);

                    $perGroup = ($specName === 'Informática') ? 18 : (($specName === 'Administración') ? 15 : 12);
                    for ($a = 0; $a < $perGroup; $a++) {
                        if ($studentCount >= $targetTotal) break;
                        $this->createStudentWithHistory($faker, $groupId, $s, $specName, $genYear, $studentCount, $teachers, $subjects);
                        $studentCount++;
                    }
                }
            }
        }
    }

    private function createStudentWithHistory($faker, $currGroupId, $sem, $spec, $genYear, $idx, $teachers, $subjects)
    {
        $nombre = $faker->firstName; $paterno = $faker->lastName; $materno = $faker->lastName;
        $initials = strtoupper(substr($nombre, 0, 1) . substr($paterno, 0, 1) . substr($materno, 0, 1));
        $matricula = "{$initials}{$currGroupId}{$genYear}" . str_pad($idx, 3, '0', STR_PAD_LEFT);

        $userId = DB::table('users')->insertGetId([
            'nombre' => $nombre, 'apellido_paterno' => $paterno, 'apellido_materno' => $materno,
            'email' => strtolower("$nombre.$paterno.$initials$idx@prepahidalgo.edu.mx"),
            'password' => Hash::make('Prepahid2026'), 'rol' => 'alumno', 'activo' => true, 'created_at' => now(),
        ]);

        DB::table('alumnos')->insert(['usuario_id' => $userId, 'matricula' => $matricula, 'fecha_nacimiento' => $faker->date('Y-m-d', '2008-12-31'), 'estatus' => 'active', 'created_at' => now()]);

        // Inscripción y Operación del Ciclo Actual (5)
        DB::table('inscripciones')->insert(['usuario_id' => $userId, 'grupo_id' => $currGroupId, 'ciclo_id' => 5, 'codigo_alumno' => $matricula, 'estatus' => 'active', 'created_at' => now()]);

        $this->seedGradesForStudent($userId, $currGroupId, $sem, $spec, 5, $teachers, $subjects);
    }

    private function seedGradesForStudent($uid, $gid, $sem, $spec, $cid, $teachers, $subjects)
    {
        $subList = collect($subjects)->filter(fn($sub) => $sub['semestre'] == $sem && ($sub['tipo'] === 'General' || ($sub['tipo'] === 'Especialidad' && $sub['spec_id'] == DB::table('especialidades')->where('nombre', $spec)->value('id'))));

        foreach ($subList as $sub) {
            $carga = DB::table('cargas_academicas')->where(['ciclo_id' => $cid, 'grupo_id' => $gid, 'materia_id' => $sub['id']])->first();
            if (!$carga) {
                $docente = collect($teachers)->where('spec', $spec)->random();
                $cargaId = DB::table('cargas_academicas')->insertGetId(['ciclo_id' => $cid, 'grupo_id' => $gid, 'materia_id' => $sub['id'], 'docente_id' => $docente['id'], 'uuid' => strtoupper(Str::random(12)), 'created_at' => now()]);
            } else { $cargaId = $carga->id; }

            $p1 = rand(6, 10); $p2 = rand(6, 10); $p3 = rand(7, 10); $final = ($p1 + $p2 + $p3) / 3;
            DB::table('calificaciones')->insert(['usuario_id' => $uid, 'carga_id' => $cargaId, 'p1' => $p1, 'p2' => $p2, 'p3' => $p3, 'final' => $final, 'estatus' => ($final >= 7) ? 'aprobado' : 'reprobado', 'created_at' => now()]);
        }
    }

    private function createLogs($faker, $adminId)
    {
        $logs = [];
        for ($i = 0; $i < 50; $i++) {
            $logs[] = ['usuario_id' => $adminId, 'accion' => $faker->randomElement(['APERTURA_CICLO', 'REGISTRO_ALUMNO', 'ASIGNACION_DOCENTE']), 'descripcion' => 'Actividad Power BI', 'metadata' => json_encode(['ip' => $faker->ipv4]), 'created_at' => now(), 'updated_at' => now()];
        }
        DB::table('auditoria_administrativa')->insert($logs);
    }
}

<?php

namespace Database\Seeders;

use App\Models\AcademicGroup;
use App\Models\AcademicLoad;
use App\Models\AcademicPeriod;
use App\Models\CriterioEvaluacion;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Specialty;
use App\Models\Student;
use App\Models\Tarea;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class InitialAcademicStructureSeeder extends Seeder
{
    /**
     * Estructura inicial acordada para iniciar el plantel en agosto de 2026.
     * Es idempotente: puede ejecutarse nuevamente sin duplicar registros.
     */
    public function run(): void
    {
        AcademicPeriod::updateOrCreate(
            ['nombre' => '2026 / Periodo A'],
            [
                'fecha_inicio' => '2026-08-24',
                'fecha_fin' => '2026-12-18',
                'activo' => true,
                'status' => AcademicPeriod::STATUS_ACTIVE,
                'p1_inicio' => '2026-08-24',
                'p1_fin' => '2026-10-02',
                'p1_activo' => true,
                'p2_inicio' => '2026-10-05',
                'p2_fin' => '2026-11-13',
                'p2_activo' => false,
                'p3_inicio' => '2026-11-16',
                'p3_fin' => '2026-12-18',
                'p3_activo' => false,
            ],
        );

        $specialties = collect([
            ['nombre' => 'Programación', 'codigo' => 'PRO'],
            ['nombre' => 'Administración', 'codigo' => 'ADM'],
            ['nombre' => 'Contabilidad', 'codigo' => 'CON'],
        ])->mapWithKeys(function (array $specialtyData) {
            $specialty = Specialty::updateOrCreate(
                ['codigo' => $specialtyData['codigo']],
                $specialtyData,
            );

            return [$specialtyData['codigo'] => $specialty];
        });

        foreach ($specialties as $specialty) {

            for ($semester = 1; $semester <= 6; $semester++) {
                AcademicGroup::firstOrCreate(
                    [
                        'generacion' => '2026-2029',
                        'semestre' => $semester,
                        'seccion' => 'A',
                        'especialidad' => $specialty->nombre,
                    ],
                    [
                        'codigo' => sprintf('%dA-%s-2026', $semester, $specialty->codigo),
                        'nombre' => "{$semester}°A {$specialty->nombre}",
                        'turno' => 'Matutino',
                        'activo' => $semester === 1,
                    ],
                );
            }
        }

        $hasExtendedCourseFields = Schema::hasColumn('materias', 'tipo')
            && Schema::hasColumn('materias', 'area');
        $hasSpecialtyCourseType = Schema::hasColumn('especialidad_materia', 'tipo');

        foreach ([
            ['codigo' => 'MAT-101', 'nombre' => 'Matemáticas I', 'tipo' => 'General', 'area' => 'Formación general', 'especialidades' => ['PRO', 'ADM', 'CON']],
            ['codigo' => 'LYC-101', 'nombre' => 'Lengua y Comunicación I', 'tipo' => 'General', 'area' => 'Formación general', 'especialidades' => ['PRO', 'ADM', 'CON']],
            ['codigo' => 'PRO-101', 'nombre' => 'Fundamentos de Programación', 'tipo' => 'Especialidad', 'area' => 'Programación', 'especialidades' => ['PRO']],
            ['codigo' => 'PRO-102', 'nombre' => 'Introducción a Bases de Datos', 'tipo' => 'Especialidad', 'area' => 'Programación', 'especialidades' => ['PRO']],
            ['codigo' => 'ADM-101', 'nombre' => 'Fundamentos de Administración', 'tipo' => 'Especialidad', 'area' => 'Administración', 'especialidades' => ['ADM']],
            ['codigo' => 'ADM-102', 'nombre' => 'Introducción a la Economía', 'tipo' => 'Especialidad', 'area' => 'Administración', 'especialidades' => ['ADM']],
            ['codigo' => 'CON-101', 'nombre' => 'Fundamentos de Contabilidad', 'tipo' => 'Especialidad', 'area' => 'Contabilidad', 'especialidades' => ['CON']],
            ['codigo' => 'CON-102', 'nombre' => 'Introducción a Finanzas', 'tipo' => 'Especialidad', 'area' => 'Contabilidad', 'especialidades' => ['CON']],
        ] as $courseData) {
            $attributes = ['codigo' => $courseData['codigo']];
            $values = ['nombre' => $courseData['nombre'], 'semestre' => 1];

            if ($hasExtendedCourseFields) {
                $values['tipo'] = $courseData['tipo'];
                $values['area'] = $courseData['area'];
            }

            $course = Course::updateOrCreate($attributes, $values);
            $specialtyIds = collect($courseData['especialidades'])
                ->map(fn (string $code) => $specialties[$code]->id)
                ->all();

            if ($hasSpecialtyCourseType) {
                $course->specialties()->syncWithoutDetaching(
                    collect($specialtyIds)->mapWithKeys(fn (int $id) => [
                        $id => ['tipo' => $courseData['tipo'] === 'General' ? 'tronco_comun' : 'especialidad'],
                    ])->all(),
                );
            } else {
                $course->specialties()->syncWithoutDetaching($specialtyIds);
            }
        }

        $teachers = collect([
            ['key' => 'MAT', 'nombre' => 'Mariana', 'paterno' => 'Herrera', 'materno' => 'García', 'email' => 'mariana.herrera@prepahidalgo.edu.mx', 'telefono' => '7712001001', 'especialidad' => 'General', 'areas' => ['Matemáticas'], 'codigo' => 'DOC-MHG2026'],
            ['key' => 'LYC', 'nombre' => 'Jorge', 'paterno' => 'Salinas', 'materno' => 'Mendoza', 'email' => 'jorge.salinas@prepahidalgo.edu.mx', 'telefono' => '7712001002', 'especialidad' => 'General', 'areas' => ['Comunicación'], 'codigo' => 'DOC-JSM2026'],
            ['key' => 'PRO1', 'nombre' => 'Valeria', 'paterno' => 'Cruz', 'materno' => 'Ramírez', 'email' => 'valeria.cruz@prepahidalgo.edu.mx', 'telefono' => '7712001003', 'especialidad' => 'Programación', 'areas' => [], 'codigo' => 'DOC-VCR2026'],
            ['key' => 'PRO2', 'nombre' => 'Diego', 'paterno' => 'Martínez', 'materno' => 'Luna', 'email' => 'diego.martinez@prepahidalgo.edu.mx', 'telefono' => '7712001004', 'especialidad' => 'Programación', 'areas' => [], 'codigo' => 'DOC-DML2026'],
            ['key' => 'ADM1', 'nombre' => 'Paola', 'paterno' => 'Sánchez', 'materno' => 'Vega', 'email' => 'paola.sanchez@prepahidalgo.edu.mx', 'telefono' => '7712001005', 'especialidad' => 'Administración', 'areas' => [], 'codigo' => 'DOC-PSV2026'],
            ['key' => 'ADM2', 'nombre' => 'Ricardo', 'paterno' => 'Torres', 'materno' => 'Flores', 'email' => 'ricardo.torres@prepahidalgo.edu.mx', 'telefono' => '7712001006', 'especialidad' => 'Administración', 'areas' => [], 'codigo' => 'DOC-RTF2026'],
            ['key' => 'CON1', 'nombre' => 'Adriana', 'paterno' => 'Morales', 'materno' => 'Castillo', 'email' => 'adriana.morales@prepahidalgo.edu.mx', 'telefono' => '7712001007', 'especialidad' => 'Contabilidad', 'areas' => [], 'codigo' => 'DOC-AMC2026'],
            ['key' => 'CON2', 'nombre' => 'Héctor', 'paterno' => 'Navarro', 'materno' => 'Ruiz', 'email' => 'hector.navarro@prepahidalgo.edu.mx', 'telefono' => '7712001008', 'especialidad' => 'Contabilidad', 'areas' => [], 'codigo' => 'DOC-HNR2026'],
        ])->mapWithKeys(function (array $teacherData) {
            $user = User::firstOrCreate(
                ['email' => $teacherData['email']],
                [
                    'nombre' => $teacherData['nombre'],
                    'apellido_paterno' => $teacherData['paterno'],
                    'apellido_materno' => $teacherData['materno'],
                    'telefono' => $teacherData['telefono'],
                    'password' => Hash::make('Prepahid2026'),
                    'rol' => 'docente',
                    'activo' => true,
                ],
            );

            $teacher = Teacher::updateOrCreate(
                ['usuario_id' => $user->id],
                [
                    'codigo_empleado' => $teacherData['codigo'],
                    'especialidad' => $teacherData['especialidad'],
                    'areas' => $teacherData['areas'],
                ],
            );

            return [$teacherData['key'] => $teacher];
        });

        $period = AcademicPeriod::where('nombre', '2026 / Periodo A')->firstOrFail();
        $groups = AcademicGroup::where('generacion', '2026-2029')->where('semestre', 1)->get()
            ->keyBy('especialidad');
        $courses = Course::where('semestre', 1)->get()->keyBy('codigo');

        $assignments = [
            ['specialty' => 'Programación', 'course' => 'MAT-101', 'teacher' => 'MAT', 'color' => 'blue'],
            ['specialty' => 'Programación', 'course' => 'LYC-101', 'teacher' => 'LYC', 'color' => 'purple'],
            ['specialty' => 'Programación', 'course' => 'PRO-101', 'teacher' => 'PRO1', 'color' => 'indigo'],
            ['specialty' => 'Programación', 'course' => 'PRO-102', 'teacher' => 'PRO2', 'color' => 'cyan'],
            ['specialty' => 'Administración', 'course' => 'MAT-101', 'teacher' => 'MAT', 'color' => 'blue'],
            ['specialty' => 'Administración', 'course' => 'LYC-101', 'teacher' => 'LYC', 'color' => 'purple'],
            ['specialty' => 'Administración', 'course' => 'ADM-101', 'teacher' => 'ADM1', 'color' => 'amber'],
            ['specialty' => 'Administración', 'course' => 'ADM-102', 'teacher' => 'ADM2', 'color' => 'orange'],
            ['specialty' => 'Contabilidad', 'course' => 'MAT-101', 'teacher' => 'MAT', 'color' => 'blue'],
            ['specialty' => 'Contabilidad', 'course' => 'LYC-101', 'teacher' => 'LYC', 'color' => 'purple'],
            ['specialty' => 'Contabilidad', 'course' => 'CON-101', 'teacher' => 'CON1', 'color' => 'emerald'],
            ['specialty' => 'Contabilidad', 'course' => 'CON-102', 'teacher' => 'CON2', 'color' => 'teal'],
        ];

        foreach ($assignments as $assignment) {
            $group = $groups->get($assignment['specialty']);
            $course = $courses->get($assignment['course']);
            $teacher = $teachers->get($assignment['teacher']);

            AcademicLoad::updateOrCreate(
                [
                    'ciclo_id' => $period->id,
                    'grupo_id' => $group->id,
                    'materia_id' => $course->id,
                ],
                [
                    'docente_id' => $teacher->id,
                    'color_tema' => $assignment['color'],
                ],
            );
        }

        $periodSchedules = [
            1 => ['deadline' => '2026-09-18 23:59:00', 'label' => 'Actividad diagnóstica'],
            2 => ['deadline' => '2026-10-30 23:59:00', 'label' => 'Práctica de aplicación'],
            3 => ['deadline' => '2026-12-04 23:59:00', 'label' => 'Evidencia integradora'],
        ];
        $hasTaskSyncColumn = Schema::hasColumn('criterios_evaluacion', 'sincronizar_tareas');

        AcademicLoad::where('ciclo_id', $period->id)->with('course')->each(function (AcademicLoad $load) use ($periodSchedules, $hasTaskSyncColumn) {
            foreach ($periodSchedules as $partial => $schedule) {
                foreach ([
                    ['nombre' => 'Actividades y tareas', 'porcentaje' => 40, 'sincronizar' => true],
                    ['nombre' => 'Proyecto o práctica', 'porcentaje' => 40, 'sincronizar' => false],
                    ['nombre' => 'Examen', 'porcentaje' => 20, 'sincronizar' => false],
                ] as $criterionData) {
                    $criterionValues = ['porcentaje' => $criterionData['porcentaje']];
                    if ($hasTaskSyncColumn) {
                        $criterionValues['sincronizar_tareas'] = $criterionData['sincronizar'];
                    }

                    CriterioEvaluacion::firstOrCreate([
                        'carga_id' => $load->id,
                        'parcial' => $partial,
                        'nombre' => $criterionData['nombre'],
                    ], $criterionValues);
                }

                // Las actividades sólo se publican cuando el parcial esté activo.
                // P2 y P3 quedan preparados con criterios, sin saturar al alumno
                // con trabajos futuros.
                if ($partial !== 1) {
                    continue;
                }

                Tarea::firstOrCreate([
                    'carga_id' => $load->id,
                    'parcial' => 1,
                    'nombre' => $schedule['label'] . ': ' . $load->course->nombre,
                ], [
                    'descripcion' => 'Realiza la actividad inicial indicada por tu docente y entrega tu evidencia antes de la fecha límite.',
                    'fecha_entrega' => $schedule['deadline'],
                    'hora_entrega' => '23:59:00',
                    'puntos' => 10,
                    'archivos' => [],
                ]);
            }
        });

        foreach ([
            'Programación' => $teachers['PRO1']->id,
            'Administración' => $teachers['ADM1']->id,
            'Contabilidad' => $teachers['CON1']->id,
        ] as $specialty => $tutorId) {
            $groups[$specialty]->update(['docente_tutor_id' => $tutorId]);
        }

        $studentsBySpecialty = [
            'Programación' => [
                ['Emiliano', 'Rojas', 'García', '2010-01-18'], ['Fernanda', 'Méndez', 'Torres', '2010-02-23'],
                ['Iván', 'Cortés', 'López', '2010-03-11'], ['Ximena', 'Vargas', 'Nava', '2010-04-07'],
                ['Mateo', 'Serrano', 'Pérez', '2010-05-15'], ['Renata', 'Chávez', 'Moreno', '2010-06-21'],
                ['Santiago', 'Beltrán', 'Ruiz', '2010-07-29'], ['Camila', 'Fuentes', 'León', '2010-08-14'],
                ['Diego', 'Pacheco', 'Soto', '2010-09-06'], ['Natalia', 'Cervantes', 'Gil', '2010-10-19'],
            ],
            'Administración' => [
                ['Alejandro', 'Campos', 'Lara', '2010-01-26'], ['Daniela', 'Ríos', 'Molina', '2010-02-08'],
                ['Bruno', 'Guzmán', 'Herrera', '2010-03-24'], ['Mariana', 'Ortega', 'Salas', '2010-04-12'],
                ['Rodrigo', 'Castañeda', 'Pineda', '2010-05-30'], ['Andrea', 'Villalobos', 'Cruz', '2010-06-17'],
                ['Luis', 'Montoya', 'Rangel', '2010-07-05'], ['Regina', 'Escobar', 'Mejía', '2010-08-22'],
                ['Carlos', 'Padilla', 'Acosta', '2010-09-13'], ['Sofía', 'Delgado', 'Ibarra', '2010-10-27'],
            ],
            'Contabilidad' => [
                ['Miguel', 'Galindo', 'Silva', '2010-01-09'], ['Valentina', 'Cuevas', 'Romero', '2010-02-16'],
                ['Joaquín', 'Estrada', 'Márquez', '2010-03-28'], ['Lucía', 'Zamora', 'Reyes', '2010-04-18'],
                ['Kevin', 'Miranda', 'Bravo', '2010-05-08'], ['Paola', 'Cárdenas', 'Núñez', '2010-06-25'],
                ['Ángel', 'Trejo', 'Carrillo', '2010-07-16'], ['Elena', 'Bautista', 'Sánchez', '2010-08-31'],
                ['Omar', 'Velasco', 'Domínguez', '2010-09-20'], ['Karla', 'Maldonado', 'Téllez', '2010-10-04'],
            ],
        ];

        $studentNumber = 1;
        foreach ($studentsBySpecialty as $specialty => $studentRows) {
            $group = $groups->get($specialty);

            foreach ($studentRows as [$name, $paternalLastName, $maternalLastName, $birthDate]) {
                $initials = strtoupper(
                    substr(Str::ascii($name), 0, 1)
                    . substr(Str::ascii($paternalLastName), 0, 1)
                    . substr(Str::ascii($maternalLastName), 0, 1),
                );
                $matricula = sprintf('%s%d2026', $initials, $group->id);
                $email = sprintf('%s.%s.%02d@prepahidalgo.edu.mx',
                    strtolower(Str::ascii($name)),
                    strtolower(Str::ascii($paternalLastName)),
                    $studentNumber,
                );

                $student = Student::with('user')->where('matricula', $matricula)->first();

                if ($student) {
                    $user = $student->user;
                } else {
                    $user = User::firstOrCreate(
                        ['email' => $email],
                        [
                            'nombre' => $name,
                            'apellido_paterno' => $paternalLastName,
                            'apellido_materno' => $maternalLastName,
                            'telefono' => sprintf('771300%04d', $studentNumber),
                            'password' => Hash::make('Prepahid2026'),
                            'rol' => 'alumno',
                            'activo' => true,
                        ],
                    );

                    $student = Student::firstOrCreate(
                        ['usuario_id' => $user->id],
                        [
                            'matricula' => $matricula,
                            'fecha_nacimiento' => $birthDate,
                            'estatus' => 'active',
                        ],
                    );
                }

                Enrollment::updateOrCreate(
                    ['usuario_id' => $student->usuario_id, 'ciclo_id' => $period->id],
                    [
                        'grupo_id' => $group->id,
                        'codigo_alumno' => $student->matricula,
                        'estatus' => 'active',
                    ],
                );

                $studentNumber++;
            }
        }

        // La siembra también debe ser visible de inmediato en los listados que
        // usan cache corto dentro del panel administrativo.
        Cache::put(
            'admin:docentes:list:revision',
            (int) Cache::get('admin:docentes:list:revision', 1) + 1,
            now()->addDay(),
        );
        Cache::forget('admin_docentes_especialidades_catalog');
        Cache::forget('admin_docentes_cycles_catalog');
        Cache::forget('admin_alumnos_cycles_catalog');
        Cache::forget('admin_alumnos_groups_catalog');
        Cache::put(
            'admin:alumnos:list:revision',
            (int) Cache::get('admin:alumnos:list:revision', 1) + 1,
            now()->addDay(),
        );
    }
}

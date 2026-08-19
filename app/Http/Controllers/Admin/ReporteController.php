<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicGroup;
use App\Models\Enrollment;
use App\Models\ReportDownload;
use App\Models\Student;
use App\Services\AcademicPeriodService;
use App\Services\GradeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReporteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | CACHE
    |--------------------------------------------------------------------------
    */

    private const REPORT_STATS_CACHE = 'reports:stats';

    private const RECENT_DOWNLOADS_CACHE = 'reports:recent-downloads';

    private const CACHE_TTL = 1800;

    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        /*
         * Antes:
         *
         * ACTIVE query
         *      ↓ si no existe
         * PLANNING query
         *
         * Ahora reutilizamos la caché global del ciclo operativo.
         */
        $workingPeriod = AcademicPeriodService::workingPeriod();

        return Inertia::render('Admin/Reportes/Index', [

            /*
            |--------------------------------------------------------------------------
            | GRUPOS
            |--------------------------------------------------------------------------
            |
            | Deferred + una sola query.
            */
            'groups' => Inertia::defer(
                fn () => $workingPeriod
                    ? $this->getGroupsForPeriod($workingPeriod->id)
                    : []
            ),

            /*
            |--------------------------------------------------------------------------
            | ALUMNOS
            |--------------------------------------------------------------------------
            |
            | Antes Enrollment::with('user') = mínimo 2 queries.
            |
            | Ahora Enrollment + User mediante JOIN = 1 query.
            */
            'students' => Inertia::defer(
                fn () => $workingPeriod
                    ? $this->getStudentsForPeriod($workingPeriod->id)
                    : []
            ),

            /*
            |--------------------------------------------------------------------------
            | CICLO DISPONIBLE
            |--------------------------------------------------------------------------
            */
            'periods' => $workingPeriod
                ? [
                    [
                        'id' => $workingPeriod->id,
                        'nombre' => $workingPeriod->nombre,
                    ],
                ]
                : [],

            'defaultPeriodId' => $workingPeriod?->id,

            'hasWorkingPeriod' => (bool) $workingPeriod,

            /*
            |--------------------------------------------------------------------------
            | ESTADÍSTICAS / HISTORIAL
            |--------------------------------------------------------------------------
            */
            'stats' => Inertia::defer(
                fn () => $this->getReportStats()
            ),

            'recentDownloads' => Inertia::defer(
                fn () => $this->getRecentDownloads()
            ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DATOS INDEX
    |--------------------------------------------------------------------------
    */

    private function getGroupsForPeriod(int $periodId): array
    {
        return Cache::remember(
            "reports:period:{$periodId}:groups",
            self::CACHE_TTL,
            static fn (): array =>
                DB::table('grupos as g')
                    ->join(
                        'inscripciones as i',
                        'i.grupo_id',
                        '=',
                        'g.id'
                    )
                    ->where(
                        'i.ciclo_id',
                        $periodId
                    )
                    ->where(
                        'i.estatus',
                        'active'
                    )
                    ->select([
                        'g.id',
                        'g.nombre',
                    ])
                    ->distinct()
                    ->orderBy('g.nombre')
                    ->get()
                    ->map(
                        static fn ($row): array => [
                            'id' => $row->id,
                            'nombre' => $row->nombre,
                        ]
                    )
                    ->all()
        );
    }

    private function getStudentsForPeriod(int $periodId): array
    {
        return Cache::remember(
            "reports:period:{$periodId}:students",
            self::CACHE_TTL,
            static fn (): array =>
                DB::table('inscripciones as i')
                    ->join(
                        'users as u',
                        'u.id',
                        '=',
                        'i.usuario_id'
                    )
                    ->where(
                        'i.ciclo_id',
                        $periodId
                    )
                    ->where(
                        'i.estatus',
                        'active'
                    )
                    ->select([
                        'i.codigo_alumno as matricula',
                        'i.grupo_id',

                        'u.nombre',
                        'u.apellido_paterno',
                        'u.apellido_materno',
                    ])
                    ->orderBy('u.apellido_paterno')
                    ->orderBy('u.apellido_materno')
                    ->orderBy('u.nombre')
                    ->get()
                    ->map(
                        static function ($row): array {
                            $name = trim(
                                implode(
                                    ' ',
                                    array_filter([
                                        $row->nombre,
                                        $row->apellido_paterno,
                                        $row->apellido_materno,
                                    ])
                                )
                            );

                            return [
                                'matricula' => $row->matricula,
                                'nombre' => $name ?: 'Sin nombre',
                                'grupo_id' => $row->grupo_id,
                            ];
                        }
                    )
                    ->all()
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ESTADÍSTICAS
    |--------------------------------------------------------------------------
    */

    protected function getReportStats(): array
    {
        return Cache::remember(
            self::REPORT_STATS_CACHE,
            300,
            static function (): array {
                $counts = DB::table(
                    'reporte_descargas'
                )
                    ->select(
                        'tipo_reporte',
                        DB::raw('COUNT(*) as total')
                    )
                    ->groupBy(
                        'tipo_reporte'
                    )
                    ->pluck(
                        'total',
                        'tipo_reporte'
                    );

                return [
                    'total' =>
                        (int) $counts->sum(),

                    'asistencia' =>
                        (int) $counts->get(
                            'asistencia',
                            0
                        ),

                    'boleta' =>
                        (int) $counts->get(
                            'boleta',
                            0
                        ),

                    'constancia' =>
                        (int) $counts->get(
                            'constancia',
                            0
                        ),

                    'historial' =>
                        (int) $counts->get(
                            'historial',
                            0
                        ),

                    'lote' =>
                        (int) $counts->get(
                            'lote',
                            0
                        ),
                ];
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DESCARGAS RECIENTES
    |--------------------------------------------------------------------------
    */

    protected function getRecentDownloads(): array
    {
        return Cache::remember(
            self::RECENT_DOWNLOADS_CACHE,
            300,
            static fn (): array =>
                DB::table(
                    'reporte_descargas as rd'
                )
                    ->leftJoin(
                        'users as u',
                        'u.id',
                        '=',
                        'rd.usuario_id'
                    )
                    ->select([
                        'rd.id',
                        'rd.tipo_reporte',
                        'rd.metadata',
                        'rd.created_at',

                        'u.nombre',
                        'u.apellido_paterno',
                        'u.apellido_materno',
                    ])
                    ->orderByDesc(
                        'rd.created_at'
                    )
                    ->limit(100)
                    ->get()
                    ->map(
                        static function ($row): array {
                            $metadata =
                                is_string($row->metadata)
                                    ? json_decode(
                                        $row->metadata,
                                        true
                                    ) ?? []
                                    : (
                                        (array) $row->metadata
                                    );

                            $adminName = trim(
                                implode(
                                    ' ',
                                    array_filter([
                                        $row->nombre,
                                        $row->apellido_paterno,
                                        $row->apellido_materno,
                                    ])
                                )
                            );

                            $date = Carbon::parse(
                                $row->created_at
                            );

                            return [
                                'id' =>
                                    $row->id,

                                'folio' =>
                                    'PH-' . ($date ? $date->year : date('Y')) . '-' . str_pad($row->id, 5, '0', STR_PAD_LEFT),

                                'tipo' =>
                                    $row->tipo_reporte,

                                'sujeto' =>
                                    $metadata['sujeto']
                                        ?? 'N/A',

                                'admin' =>
                                    $adminName
                                        ? mb_strtoupper(
                                            $adminName
                                        )
                                        : 'SISTEMA',

                                'fecha' =>
                                    $date
                                        ->locale('es')
                                        ->isoFormat(
                                            'D MMM YYYY, h:mm a'
                                        ),

                                'raw_date' =>
                                    $date->format(
                                        'Y-m-d'
                                    ),

                                'metadata' =>
                                    $metadata,
                            ];
                        }
                    )
                    ->all()
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CACHE INVALIDATION
    |--------------------------------------------------------------------------
    */

    private function clearReportDashboardCache(): void
    {
        Cache::forget(
            self::REPORT_STATS_CACHE
        );

        Cache::forget(
            self::RECENT_DOWNLOADS_CACHE
        );
    }

    /*
    |--------------------------------------------------------------------------
    | REGISTRAR DESCARGA
    |--------------------------------------------------------------------------
    */

    public function logDownload(Request $request)
    {
        $validated = $request->validate([
            'tipo_reporte' =>
                'required|string',

            'sujeto' =>
                'nullable|string',

            'metadata' =>
                'nullable|array',
        ]);

        $metadata =
            $validated['metadata'] ?? [];

        $metadata['sujeto'] =
            $validated['sujeto'] ?? null;

        ReportDownload::create([
            'usuario_id' =>
                auth()->id(),

            'tipo_reporte' =>
                $validated['tipo_reporte'],

            'metadata' =>
                $metadata,
        ]);

        /*
         * Estadísticas e historial cambiaron.
         */
        $this->clearReportDashboardCache();

        return back();
    }

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR DESCARGA
    |--------------------------------------------------------------------------
    */

    public function destroyDownload($id)
    {
        DB::transaction(
            function () use ($id): void {
                $download =
                    ReportDownload::findOrFail(
                        $id
                    );

                \App\Models\AdminAuditLog::create([
                    'usuario_id' =>
                        auth()->id(),

                    'accion' =>
                        'ELIMINAR_REPORTE',

                    'descripcion' =>
                        "Se eliminó el folio de reporte {$download->folio} del historial.",

                    'metadata' => [
                        'id' =>
                            $download->id,

                        'folio' =>
                            $download->folio,
                    ],
                ]);

                $download->delete();
            }
        );

        $this->clearReportDashboardCache();

        return redirect()
            ->route(
                'admin.reportes.index'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | LIMPIAR HISTORIAL
    |--------------------------------------------------------------------------
    */

    public function clearDownloadHistory()
    {
        DB::transaction(
            function (): void {
                DB::table(
                    'reporte_descargas'
                )->delete();

                \App\Models\AdminAuditLog::create([
                    'usuario_id' =>
                        auth()->id(),

                    'accion' =>
                        'LIMPIAR_HISTORIAL_REPORTES',

                    'descripcion' =>
                        'Se vació completamente el historial de descargas de reportes.',
                ]);
            }
        );

        $this->clearReportDashboardCache();

        return redirect()
            ->route(
                'admin.reportes.index'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | ASISTENCIA
    |--------------------------------------------------------------------------
    */

    public function getAttendanceData(
        $groupId,
        $periodId
    ) {
        return response()->json(
            $this->makeAttendanceData(
                $groupId,
                $periodId
            )
        );
    }

    public function exportAttendanceCsv(
        $groupId,
        $periodId
    ) {
        $data =
            $this->makeAttendanceData(
                $groupId,
                $periodId
            );

        $filename =
            'asistencia-'
            . str(
                $data['group']['nombre']
            )->slug()
            . '-'
            . $periodId
            . '.csv';

        return response()->streamDownload(
            function () use ($data): void {
                $output = fopen(
                    'php://output',
                    'w'
                );

                fwrite(
                    $output,
                    "\xEF\xBB\xBF"
                );

                fputcsv(
                    $output,
                    [
                        'Lista de asistencia',
                        $data['group']['nombre'],
                        $data['period']['nombre'],
                    ]
                );

                fputcsv(
                    $output,
                    []
                );

                fputcsv(
                    $output,
                    array_merge(
                        [
                            '#',
                            'Matricula',
                            'Nombre',
                        ],
                        range(1, 20)
                    )
                );

                foreach (
                    $data['enrollments']
                    as $index => $enrollment
                ) {
                    fputcsv(
                        $output,
                        array_merge(
                            [
                                $index + 1,

                                $enrollment[
                                    'matricula'
                                ],

                                $enrollment[
                                    'nombre'
                                ],
                            ],

                            array_fill(
                                0,
                                20,
                                ''
                            )
                        )
                    );
                }

                fclose($output);
            },
            $filename,
            [
                'Content-Type' =>
                    'text/csv; charset=UTF-8',
            ]
        );
    }

    protected function makeAttendanceData(
        $groupId,
        $periodId
    ): array {
        return Cache::remember(
            "report:attendance:g{$groupId}:p{$periodId}",
            900,
            static function () use (
                $groupId,
                $periodId
            ): array {
                /*
                |--------------------------------------------------------------------------
                | Grupo + tutor + usuario + ciclo
                |--------------------------------------------------------------------------
                |
                | 1 query.
                */
                $group = DB::table(
                    'grupos as g'
                )
                    ->leftJoin(
                        'docentes as t',
                        't.id',
                        '=',
                        'g.docente_tutor_id'
                    )
                    ->leftJoin(
                        'users as tu',
                        'tu.id',
                        '=',
                        't.usuario_id'
                    )
                    ->join(
                        'ciclos_escolares as ce',
                        'ce.id',
                        '=',
                        DB::raw(
                            (int) $periodId
                        )
                    )
                    ->where(
                        'g.id',
                        $groupId
                    )
                    ->select([
                        'g.nombre',
                        'g.codigo',
                        'g.especialidad',
                        'g.turno',

                        'ce.nombre as periodo_nombre',

                        'tu.nombre as tutor_nombre',

                        'tu.apellido_paterno as tutor_apellido_paterno',

                        'tu.apellido_materno as tutor_apellido_materno',
                    ])
                    ->first();

                abort_if(
                    !$group,
                    404,
                    'Grupo o ciclo no encontrado.'
                );

                /*
                |--------------------------------------------------------------------------
                | Inscripciones + usuarios
                |--------------------------------------------------------------------------
                |
                | 1 query.
                */
                $enrollments = DB::table(
                    'inscripciones as i'
                )
                    ->join(
                        'users as u',
                        'u.id',
                        '=',
                        'i.usuario_id'
                    )
                    ->where(
                        'i.grupo_id',
                        $groupId
                    )
                    ->where(
                        'i.ciclo_id',
                        $periodId
                    )
                    ->select([
                        'i.usuario_id',

                        'i.codigo_alumno',

                        'u.nombre',

                        'u.apellido_paterno',

                        'u.apellido_materno',
                    ])
                    ->get()
                    ->map(
                        static function ($row): array {
                            $formattedName =
                                mb_strtoupper(
                                    trim(
                                        implode(
                                            ' ',
                                            array_filter([
                                                $row->apellido_paterno,

                                                $row->apellido_materno,

                                                $row->nombre,
                                            ])
                                        )
                                    )
                                );

                            return [
                                'usuario_id' =>
                                    $row->usuario_id,

                                'matricula' =>
                                    $row->codigo_alumno,

                                'nombre' =>
                                    $formattedName,

                                'apellido_paterno' =>
                                    $row->apellido_paterno,

                                'apellido_materno' =>
                                    $row->apellido_materno,
                            ];
                        }
                    )
                    ->sortBy(
                        'nombre'
                    )
                    ->values()
                    ->all();

                $tutorName = trim(
                    implode(
                        ' ',
                        array_filter([
                            $group->tutor_apellido_paterno,

                            $group->tutor_apellido_materno,

                            $group->tutor_nombre,
                        ])
                    )
                );

                return [
                    'group' => [
                        'nombre' =>
                            mb_strtoupper(
                                $group->nombre
                            ),

                        'codigo' =>
                            $group->codigo,

                        'especialidad' =>
                            mb_strtoupper(
                                $group->especialidad
                            ),

                        'turno' =>
                            mb_strtoupper(
                                $group->turno
                                    ?: 'Matutino'
                            ),

                        'tutor' =>
                            $tutorName
                                ? mb_strtoupper(
                                    $tutorName
                                )
                                : 'PENDIENTE',
                    ],

                    'period' => [
                        'nombre' =>
                            mb_strtoupper(
                                $group->periodo_nombre
                            ),
                    ],

                    'enrollments' =>
                        $enrollments,

                    'generated_at' =>
                        Carbon::now()
                            ->locale('es')
                            ->isoFormat(
                                'dddd, D [de] MMMM [de] YYYY'
                            )
                        . ' a las '
                        . now()->format(
                            'h:i a'
                        ),
                ];
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CONSTANCIA
    |--------------------------------------------------------------------------
    */

    public function getCertificateData(
        $matricula,
        $enrollment = null
    ) {
        return response()->json(
            $this->makeCertificateData(
                $matricula,
                $enrollment
            )
        );
    }

    protected function makeCertificateData(
        $matricula,
        $enrollment = null
    ): array {
        /*
         * Batch puede enviar Enrollment ya cargado.
         * Conservamos ese camino para no repetir consultas.
         */
        if ($enrollment) {
            $user =
                $enrollment->user;

            $group =
                $enrollment->academicGroup;

            $period =
                $enrollment->academicPeriod;

            $semestre = '1';

            if (
                preg_match(
                    '/(\d+)/',
                    $group->nombre,
                    $matches
                )
            ) {
                $semestre =
                    $matches[1];
            }

            return [
                'student' => [
                    'nombre' =>
                        mb_strtoupper(
                            trim(
                                "{$user->apellido_paterno} {$user->apellido_materno} {$user->nombre}"
                            )
                        ),

                    'matricula' =>
                        $enrollment->codigo_alumno,
                ],

                'academic' => [
                    'grupo' =>
                        mb_strtoupper(
                            $group->nombre
                        ),

                    'especialidad' =>
                        mb_strtoupper(
                            $group->especialidad
                        ),

                    'ciclo' =>
                        mb_strtoupper(
                            $period->nombre
                        ),

                    'semestre' =>
                        $semestre,

                    'turno' =>
                        mb_strtoupper(
                            $group->turno
                                ?? 'MATUTINO'
                        ),
                ],

                'issued_at' =>
                    $this->issuedAt(),
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Consulta individual optimizada
        |--------------------------------------------------------------------------
        |
        | Enrollment + User + Group + Period en UNA query.
        */
        $row = DB::table(
            'inscripciones as i'
        )
            ->join(
                'users as u',
                'u.id',
                '=',
                'i.usuario_id'
            )
            ->join(
                'grupos as g',
                'g.id',
                '=',
                'i.grupo_id'
            )
            ->join(
                'ciclos_escolares as ce',
                'ce.id',
                '=',
                'i.ciclo_id'
            )
            ->where(
                'i.codigo_alumno',
                $matricula
            )
            ->where(
                'i.estatus',
                'active'
            )
            ->select([
                'i.codigo_alumno',

                'u.nombre',
                'u.apellido_paterno',
                'u.apellido_materno',

                'g.nombre as grupo',
                'g.especialidad',
                'g.turno',

                'ce.nombre as ciclo',
            ])
            ->first();

        abort_if(
            !$row,
            404,
            'Inscripción no encontrada.'
        );

        $semestre = '1';

        if (
            preg_match(
                '/(\d+)/',
                $row->grupo,
                $matches
            )
        ) {
            $semestre =
                $matches[1];
        }

        return [
            'student' => [
                'nombre' =>
                    mb_strtoupper(
                        trim(
                            "{$row->apellido_paterno} {$row->apellido_materno} {$row->nombre}"
                        )
                    ),

                'matricula' =>
                    $row->codigo_alumno,
            ],

            'academic' => [
                'grupo' =>
                    mb_strtoupper(
                        $row->grupo
                    ),

                'especialidad' =>
                    mb_strtoupper(
                        $row->especialidad
                    ),

                'ciclo' =>
                    mb_strtoupper(
                        $row->ciclo
                    ),

                'semestre' =>
                    $semestre,

                'turno' =>
                    mb_strtoupper(
                        $row->turno
                            ?: 'MATUTINO'
                    ),
            ],

            'issued_at' =>
                $this->issuedAt(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | BOLETA
    |--------------------------------------------------------------------------
    */

    public function getGradeReportData(
        $matricula,
        $periodId,
        $enrollment = null
    ) {
        return response()->json(
            $this->makeGradeReportData(
                $matricula,
                $periodId,
                $enrollment
            )
        );
    }

    protected function makeGradeReportData(
        $matricula,
        $periodId,
        $enrollment = null
    ): array {
        /*
         * Batch reutiliza Enrollment cargado.
         */
        if (!$enrollment) {
            $enrollment =
                Enrollment::query()
                    ->where(
                        'codigo_alumno',
                        $matricula
                    )
                    ->where(
                        'ciclo_id',
                        $periodId
                    )
                    ->with([
                        'user:id,nombre,apellido_paterno,apellido_materno',

                        'academicGroup:id,nombre,especialidad',

                        'academicPeriod:id,nombre',
                    ])
                    ->firstOrFail();
        }

        $userId =
            $enrollment->usuario_id;

        $user =
            $enrollment->user;

        $group =
            $enrollment->academicGroup;

        $period =
            $enrollment->academicPeriod;

        /*
         * GradeService ya tiene su propia lógica/cache.
         */
        $kardex =
            GradeService::getStudentKardex(
                $userId
            );

        $totalScore = 0;

        $subjectCount = 0;

        foreach (
            $kardex
            as $item
        ) {
            if (
                $item['score'] !== '—'
            ) {
                $totalScore +=
                    (int) $item['score'];

                $subjectCount++;
            }
        }

        $gpa =
            $subjectCount > 0
                ? number_format(
                    $totalScore
                    / $subjectCount,
                    0
                )
                : '—';

        return [
            'student' => [
                'nombre' =>
                    mb_strtoupper(
                        trim(
                            "{$user->apellido_paterno} {$user->apellido_materno} {$user->nombre}"
                        )
                    ),

                'matricula' =>
                    $enrollment->codigo_alumno,
            ],

            'academic' => [
                'grupo' =>
                    mb_strtoupper(
                        $group->nombre
                    ),

                'especialidad' =>
                    mb_strtoupper(
                        $group->especialidad
                    ),

                'ciclo' =>
                    mb_strtoupper(
                        $period->nombre
                    ),
            ],

            'grades' =>
                $kardex,

            'gpa' =>
                $gpa,

            'issued_at' => [
                'full' =>
                    Carbon::now()
                        ->locale('es')
                        ->isoFormat(
                            'dddd, D [de] MMMM [de] YYYY'
                        )
                    . ' a las '
                    . now()->format(
                        'h:i a'
                    ),
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | KARDEX COMPLETO
    |--------------------------------------------------------------------------
    */

    public function getFullKardexData(
        $matricula
    ) {
        /*
         * Cacheamos exclusivamente datos académicos.
         *
         * issued_at se agrega después para que siempre
         * corresponda al momento real de generación.
         */
        $data = Cache::remember(
            "report:kardex-full:{$matricula}",
            self::CACHE_TTL,
            static function () use (
                $matricula
            ): array {
                /*
                |--------------------------------------------------------------------------
                | Alumno + Usuario
                |--------------------------------------------------------------------------
                |
                | 1 query en lugar de Student + eager User.
                */
                $student = DB::table(
                    'alumnos as a'
                )
                    ->join(
                        'users as u',
                        'u.id',
                        '=',
                        'a.usuario_id'
                    )
                    ->where(
                        'a.matricula',
                        $matricula
                    )
                    ->select([
                        'a.matricula',
                        'a.usuario_id',

                        'u.nombre',
                        'u.apellido_paterno',
                        'u.apellido_materno',
                    ])
                    ->first();

                abort_if(
                    !$student,
                    404,
                    'Alumno no encontrado.'
                );

                /*
                 * Conservamos las relaciones académicas actuales
                 * porque GradeService / relación grades puede tener
                 * reglas internas específicas.
                 *
                 * El resultado completo queda cacheado después.
                 */
                $enrollments =
                    Enrollment::query()
                        ->where(
                            'usuario_id',
                            $student->usuario_id
                        )
                        ->with([
                            'academicGroup:id,nombre,especialidad',

                            'academicPeriod:id,nombre',

                            'academicGroup.academicLoads' =>
                                function ($query): void {
                                    $query->select(
                                        'id',
                                        'grupo_id',
                                        'ciclo_id',
                                        'materia_id'
                                    );
                                },

                            'academicGroup.academicLoads.course:id,nombre,codigo,semestre',

                            'academicGroup.academicLoads.grades' =>
                                function ($query) use ($student): void {
                                    $query
                                        ->where(
                                            'usuario_id',
                                            $student->usuario_id
                                        )
                                        ->whereNull(
                                            'criterio_id'
                                        );
                                },
                        ])
                        ->get();

                $history = [];

                $totalSum = 0;

                $totalSubjects = 0;

                foreach (
                    $enrollments
                    as $enrollment
                ) {
                    $periodName =
                        $enrollment
                            ->academicPeriod
                            ?->nombre
                        ?? 'N/A';

                    $loads =
                        $enrollment
                            ->academicGroup
                            ?->academicLoads
                        ?? collect();

                    foreach (
                        $loads
                        as $load
                    ) {
                        /*
                         * El grupo puede poseer cargas de otros ciclos.
                         */
                        if (
                            (int) $load->ciclo_id
                            !==
                            (int) $enrollment->ciclo_id
                        ) {
                            continue;
                        }

                        $gradeRecord =
                            $load
                                ->grades
                                ->first();

                        $finalGrade =
                            $gradeRecord
                                ? GradeService::formatGrade(
                                    $gradeRecord->final
                                )
                                : '—';

                        if (
                            $finalGrade !== '—'
                        ) {
                            $totalSum +=
                                (int) $finalGrade;

                            $totalSubjects++;
                        }

                        $history[] = [
                            'period' =>
                                mb_strtoupper(
                                    $periodName
                                ),

                            'semestre' =>
                                $load
                                    ->course
                                    ?->semestre
                                ?? '—',

                            'codigo' =>
                                mb_strtoupper(
                                    $load
                                        ->course
                                        ?->codigo
                                    ?? 'S/C'
                                ),

                            'materia' =>
                                mb_strtoupper(
                                    $load
                                        ->course
                                        ?->nombre
                                    ?? 'S/N'
                                ),

                            'calificacion' =>
                                $finalGrade,
                        ];
                    }
                }

                $globalGpa =
                    $totalSubjects > 0
                        ? number_format(
                            $totalSum
                            / $totalSubjects,
                            0
                        )
                        : '—';

                $specialty =
                    $enrollments
                        ->isNotEmpty()
                        ? (
                            $enrollments
                                ->last()
                                ->academicGroup
                                ?->especialidad
                            ?? 'GENERAL'
                        )
                        : 'GENERAL';

                $fullName = trim(
                    implode(
                        ' ',
                        array_filter([
                            $student->nombre,

                            $student->apellido_paterno,

                            $student->apellido_materno,
                        ])
                    )
                );

                return [
                    'student' => [
                        'nombre' =>
                            mb_strtoupper(
                                $fullName
                            ),

                        'matricula' =>
                            $student->matricula,

                        'especialidad' =>
                            mb_strtoupper(
                                $specialty
                            ),
                    ],

                    'history' =>
                        $history,

                    'globalGpa' =>
                        $globalGpa,
                ];
            }
        );

        /*
         * Nunca cacheamos la fecha de impresión.
         */
        $data['issued_at'] = [
            'full' =>
                Carbon::now()
                    ->locale('es')
                    ->isoFormat(
                        'dddd, D [de] MMMM [de] YYYY'
                    ),
        ];

        return response()->json(
            $data
        );
    }

    /*
    |--------------------------------------------------------------------------
    | BATCH
    |--------------------------------------------------------------------------
    */

    public function getBatchData(
        Request $request
    ) {
        set_time_limit(300);

        ini_set(
            'memory_limit',
            '512M'
        );

        $validated =
            $request->validate([
                'tipo_reporte' =>
                    'required|string|in:boleta,constancia,asistencia',

                'grupo_id' =>
                    'required|string',

                'ciclo_id' =>
                    'required|exists:ciclos_escolares,id',
            ]);

        $tipo =
            $validated['tipo_reporte'];

        $groupId =
            $validated['grupo_id'];

        $periodId =
            (int) $validated['ciclo_id'];

        /*
        |--------------------------------------------------------------------------
        | GRUPOS
        |--------------------------------------------------------------------------
        */
        $groupsToProcess =
            $groupId === 'all'
                ? AcademicGroup::query()
                    ->select(
                        'id',
                        'nombre',
                        'codigo',
                        'especialidad',
                        'turno',
                        'tutor_id'
                    )
                    ->where(
                        'activo',
                        true
                    )
                    ->get()

                : AcademicGroup::query()
                    ->select(
                        'id',
                        'nombre',
                        'codigo',
                        'especialidad',
                        'turno',
                        'tutor_id'
                    )
                    ->where(
                        'id',
                        $groupId
                    )
                    ->get();

        $batchData = [];

        /*
        |--------------------------------------------------------------------------
        | ASISTENCIA
        |--------------------------------------------------------------------------
        */
        if (
            $tipo === 'asistencia'
        ) {
            foreach (
                $groupsToProcess
                as $group
            ) {
                try {
                    $batchData[] =
                        $this->makeAttendanceData(
                            $group->id,
                            $periodId
                        );
                } catch (\Throwable) {
                    continue;
                }
            }

            return response()->json([
                'tipo' =>
                    $tipo,

                'items' =>
                    $batchData,

                'count' =>
                    count(
                        $batchData
                    ),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | BOLETAS / CONSTANCIAS
        |--------------------------------------------------------------------------
        |
        | Antes consultabas Enrollment dentro de cada grupo.
        |
        | Ahora obtenemos TODAS las inscripciones necesarias
        | en una sola consulta Eloquent.
        */
        $groupIds =
            $groupsToProcess
                ->pluck('id')
                ->all();

        if (
            !empty($groupIds)
        ) {
            $enrollments =
                Enrollment::query()
                    ->whereIn(
                        'grupo_id',
                        $groupIds
                    )
                    ->where(
                        'ciclo_id',
                        $periodId
                    )
                    ->where(
                        'estatus',
                        'active'
                    )
                    ->with([
                        'user:id,nombre,apellido_paterno,apellido_materno',

                        'academicGroup:id,nombre,especialidad,turno',

                        'academicPeriod:id,nombre',
                    ])
                    ->get();

            foreach (
                $enrollments
                as $enrollment
            ) {
                try {
                    if (
                        $tipo === 'boleta'
                    ) {
                        $batchData[] =
                            $this->makeGradeReportData(
                                $enrollment->codigo_alumno,

                                $periodId,

                                $enrollment
                            );
                    } else {
                        $batchData[] =
                            $this->makeCertificateData(
                                $enrollment->codigo_alumno,

                                $enrollment
                            );
                    }
                } catch (\Throwable) {
                    continue;
                }
            }
        }

        return response()->json([
            'tipo' =>
                $tipo,

            'items' =>
                $batchData,

            'count' =>
                count(
                    $batchData
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    private function issuedAt(): array
    {
        $now =
            Carbon::now()
                ->locale('es');

        return [
            'day' =>
                $now->format('d'),

            'month' =>
                $now->monthName,

            'year' =>
                $now->format('Y'),

            'full' =>
                $now->isoFormat(
                    'D [días del mes de] MMMM [de] YYYY'
                ),
        ];
    }
}
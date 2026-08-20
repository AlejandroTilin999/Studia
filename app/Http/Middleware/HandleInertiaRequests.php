<?php

namespace App\Http\Middleware;

use App\Models\AcademicLoad;
use App\Models\Enrollment;
use App\Models\Notificacion;
use App\Models\Teacher;
use App\Services\AcademicPeriodService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Vista raíz de Inertia.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determina la versión actual de assets.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Props globales compartidas por Inertia.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        /*
        |--------------------------------------------------------------------------
        | Usuario autenticado
        |--------------------------------------------------------------------------
        |
        | Laravel ya resolvió este usuario mediante auth.
        | No hacemos User::find() adicional.
        */
        $user = $request->user();

        $role = strtolower(
            $user?->rol ?? ''
        );

        return [
            ...parent::share($request),

            /*
            |--------------------------------------------------------------------------
            | AUTH
            |--------------------------------------------------------------------------
            */
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'nombre' => $user->nombre,
                        'apellido_paterno' => $user->apellido_paterno,
                        'apellido_materno' => $user->apellido_materno,
                        'nombre_completo' => $user->nombre_completo,
                        'email' => $user->email,
                        'rol' => strtoupper($user->rol ?? ''),
                    ]
                    : null,
            ],

            /*
            |--------------------------------------------------------------------------
            | CICLO ACTIVO
            |--------------------------------------------------------------------------
            |
            | Una sola fuente de verdad:
            | AcademicPeriodService.
            */
            'activePeriod' => fn () =>
                $this->getActivePeriod(),

            /*
            |--------------------------------------------------------------------------
            | NOTIFICACIONES
            |--------------------------------------------------------------------------
            |
            | Solo ADMIN necesita contador global.
            */
            'unreadNotificationsCount' => fn () =>
                $role === 'admin' && $user
                    ? $this->getUnreadNotificationsCount(
                        $user->id
                    )
                    : 0,

            /*
            |--------------------------------------------------------------------------
            | SIDEBAR DOCENTE
            |--------------------------------------------------------------------------
            */
            'docenteGroups' => fn () =>
                $role === 'docente' && $user
                    ? $this->getDocenteGroups(
                        $user->id
                    )
                    : [],

            /*
            |--------------------------------------------------------------------------
            | SIDEBAR ALUMNO
            |--------------------------------------------------------------------------
            */
            'alumnoGroups' => fn () =>
                $role === 'alumno' && $user
                    ? $this->getAlumnoGroups(
                        $user->id
                    )
                    : [],
        ];
    }

    /**
     * Devuelve información mínima del ciclo activo.
     */
    private function getActivePeriod(): ?array
    {
        $period = AcademicPeriodService::activePeriod();

        if (!$period) {
            return null;
        }

        /*
         * Si AcademicPeriod tiene cast de fecha, esto será Carbon.
         */
        $month = null;

        if ($period->fecha_inicio) {
            if ($period->fecha_inicio instanceof \DateTimeInterface) {
                $month = (int) $period->fecha_inicio->format('n');
            } else {
                $month = (int) date(
                    'n',
                    strtotime((string) $period->fecha_inicio)
                );
            }
        }

        return [
            'id' => $period->id,

            'nombre' => $period->nombre,

            'es_nones' =>
                $month !== null
                    ? (
                        $month >= 8 ||
                        $month === 1
                    )
                    : true,
        ];
    }

    /**
     * Obtiene notificaciones no leídas del administrador.
     */
    private function getUnreadNotificationsCount(
        int $userId
    ): int {
        return (int) Cache::remember(
            "unread_notifs_{$userId}",
            120,
            static fn (): int =>
                Notificacion::query()
                    ->where(
                        'usuario_id',
                        $userId
                    )
                    ->where(
                        'leido',
                        false
                    )
                    ->count()
        );
    }

    /**
     * Obtiene grupos del docente para el sidebar.
     *
     * Cache MISS:
     * - 1 query para teacher
     * - 1 query con joins para cargas/grupo/materia
     *
     * Cache HIT:
     * - 0 queries
     */
    private function getDocenteGroups(
        int $userId
    ): array {
        $activePeriod = AcademicPeriodService::activePeriod();
        if (!$activePeriod) {
            return [];
        }

        $revision = Cache::get('admin:cargas:list:revision', 1);

        return Cache::remember(
            "sidebar_docente_{$userId}_c{$activePeriod->id}_v{$revision}",
            1800,
            static function () use (
                $userId,
                $activePeriod
            ): array {
                $teacherId = Teacher::query()
                    ->where(
                        'usuario_id',
                        $userId
                    )
                    ->value('id');

                if (!$teacherId) {
                    return [];
                }

                return DB::table(
                    'cargas_academicas as ca'
                )
                    ->leftJoin(
                        'grupos as g',
                        'g.id',
                        '=',
                        'ca.grupo_id'
                    )
                    ->leftJoin(
                        'materias as m',
                        'm.id',
                        '=',
                        'ca.materia_id'
                    )
                    ->where(
                        'ca.docente_id',
                        $teacherId
                    )
                    ->where(
                        'ca.ciclo_id',
                        $activePeriod->id
                    )
                    ->select([
                        'ca.uuid as id',
                        'g.nombre as nombre_grupo',
                        'm.nombre as materia',
                        'm.codigo as codigo',
                    ])
                    ->get()
                    ->map(
                        static fn ($row): array => [
                            'id' => $row->id,

                            'nombre_grupo' =>
                                $row->nombre_grupo
                                    ?: 'Grup. s/n',

                            'materia' =>
                                $row->materia
                                    ?: 'Mat. s/n',

                            'codigo' =>
                                $row->codigo
                                    ?: 'S/C',
                        ]
                    )
                    ->all();
            }
        );
    }

    /**
     * Obtiene materias del alumno para el sidebar.
     *
     * Cache MISS:
     * - 1 query Enrollment
     * - 1 query con joins
     *
     * Cache HIT:
     * - 0 queries
     */
    private function getAlumnoGroups(
        int $userId
    ): array {
        return Cache::remember(
            "sidebar_alumno_{$userId}",
            1800,
            static function () use (
                $userId
            ): array {
                /*
                |--------------------------------------------------------------------------
                | Inscripción actual
                |--------------------------------------------------------------------------
                |
                | Solo necesitamos grupo_id y ciclo_id.
                */
                $enrollment = Enrollment::query()
                    ->where(
                        'usuario_id',
                        $userId
                    )
                    ->where(
                        'estatus',
                        'active'
                    )
                    ->orderByDesc(
                        'ciclo_id'
                    )
                    ->first([
                        'grupo_id',
                        'ciclo_id',
                    ]);

                if (!$enrollment) {
                    return [];
                }

                /*
                |--------------------------------------------------------------------------
                | Materias del sidebar
                |--------------------------------------------------------------------------
                |
                | Una sola query con joins.
                |
                | IMPORTANTE:
                | Verifica nombres reales de tablas:
                |
                | cargas_academicas
                | materias
                | docentes
                | users
                | grupos
                |
                */
                return DB::table(
                    'cargas_academicas as ca'
                )
                    ->leftJoin(
                        'materias as m',
                        'm.id',
                        '=',
                        'ca.materia_id'
                    )
                    ->leftJoin(
                        'docentes as d',
                        'd.id',
                        '=',
                        'ca.docente_id'
                    )
                    ->leftJoin(
                        'users as u',
                        'u.id',
                        '=',
                        'd.usuario_id'
                    )
                    ->leftJoin(
                        'grupos as g',
                        'g.id',
                        '=',
                        'ca.grupo_id'
                    )
                    ->where(
                        'ca.grupo_id',
                        $enrollment->grupo_id
                    )
                    ->where(
                        'ca.ciclo_id',
                        $enrollment->ciclo_id
                    )
                    ->select([
                        'ca.uuid as id',
                        'ca.color_tema',

                        'm.nombre',
                        'm.descripcion',

                        'g.nombre as nombre_grupo',

                        'u.nombre as docente_nombre',
                        'u.apellido_paterno as docente_apellido_paterno',
                        'u.apellido_materno as docente_apellido_materno',
                    ])
                    ->get()
                    ->map(
                        static function (
                            $row
                        ): array {
                            $teacherName = trim(
                                implode(
                                    ' ',
                                    array_filter([
                                        $row->docente_nombre,
                                        $row->docente_apellido_paterno,
                                        $row->docente_apellido_materno,
                                    ])
                                )
                            );

                            $description =
                                $row->descripcion
                                    ?: 'Sin descripción';

                            return [
                                'id' => $row->id,
                                'uuid' => $row->id,

                                'nombre' =>
                                    $row->nombre
                                        ?: 'N/A',

                                'docente' =>
                                    $teacherName
                                        ?: 'Sin docente',

                                /*
                                 * Conservamos ambas claves
                                 * por compatibilidad con frontend.
                                 */
                                'description' =>
                                    $description,

                                'descripcion' =>
                                    $description,

                                'nombre_grupo' =>
                                    $row->nombre_grupo
                                        ?: 'N/A',

                                'color_tema' =>
                                    $row->color_tema
                                        ?: 'blue',
                            ];
                        }
                    )
                    ->all();
            }
        );
    }
}
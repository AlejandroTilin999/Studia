<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\Teacher;
use App\Models\User;
use App\Models\AcademicPeriod;
use App\Services\AcademicPeriodService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DocenteController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $selectedCycleId = $request->query('cycle');

        $operatingCycle = AcademicPeriodService::workingPeriod();
        $activeCycle = $operatingCycle?->status === AcademicPeriod::STATUS_ACTIVE ? $operatingCycle : null;
        $planningCycle = $operatingCycle?->status === AcademicPeriod::STATUS_PLANNING ? $operatingCycle : null;

        // Determinar el ciclo de trabajo (Prioridad: Seleccionado > Activo > Planificación)
        $workingCycle = null;
        if ($selectedCycleId) {
            $workingCycle = AcademicPeriod::find($selectedCycleId);
        }

        if (!$workingCycle) {
            $workingCycle = $activeCycle ?: $planningCycle;
        }

        return Inertia::render('Admin/Docentes/Index', [
            'teachers' => (function () use ($search, $workingCycle) {
                $revision = Cache::get('admin:docentes:list:revision', 1);
                $cacheKey = 'admin:docentes:list:' . $revision . ':' . ($workingCycle?->id ?: 'none') . ':' . md5((string) $search);

                return Cache::remember($cacheKey, now()->addSeconds(15), function () use ($search, $workingCycle) {
                $query = Teacher::query()
                    ->join('users', 'docentes.usuario_id', '=', 'users.id')
                    ->select([
                        'docentes.id',
                        'docentes.codigo_empleado',
                        'docentes.especialidad',
                        'users.nombre as user_nombre',
                        'users.apellido_paterno as user_paterno',
                        'users.apellido_materno as user_materno',
                        'users.email as user_email',
                        'users.telefono as user_telefono'
                    ]);

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('docentes.codigo_empleado', 'like', "%{$search}%")
                          ->orWhere('users.nombre', 'like', "%{$search}%")
                          ->orWhere('users.apellido_paterno', 'like', "%{$search}%")
                          ->orWhere('users.email', 'like', "%{$search}%");
                    });
                }

                $loadsRelation = $workingCycle
                    ? ['academicLoads' => fn($q) => $q->where('ciclo_id', $workingCycle->id)->with(['course', 'academicGroup'])]
                    : ['academicLoads.course', 'academicLoads.academicGroup'];

                return $query->with($loadsRelation)
                    ->orderBy('users.apellido_paterno')
                    ->orderBy('users.nombre')
                    ->get()
                    ->map(function ($t) {
                        return [
                            'id'                => $t->id,
                            'codigo_empleado'   => $t->codigo_empleado,
                            'nombre'            => $t->user_nombre ?? '',
                            'apellido_paterno'  => $t->user_paterno ?? '',
                            'apellido_materno'  => $t->user_materno ?? '',
                            'especialidad'      => $t->especialidad,
                            'telefono'          => $t->user_telefono ?? '',
                            'usuario'           => ['email' => $t->user_email ?? ''],
                            'materias'          => $t->academicLoads ? $t->academicLoads->map(fn($l) => [
                                'id'             => $l->course->id ?? null,
                                'nombre'         => $l->course->nombre ?? 'N/A',
                                'codigo'         => $l->course->codigo ?? '',
                                'nombre_group'   => $l->academicGroup->nombre ?? 'N/A',
                            ])->values()->toArray() : [],
                        ];
                    })->values()->toArray();
                });
            })(),
            'filters' => [
                'search' => $search,
                'cycle' => $workingCycle ? $workingCycle->id : null
            ],
            'availableCycles' => \Cache::remember('admin_docentes_cycles_catalog', 300, function() {
                return \App\Models\AcademicPeriod::whereIn('status', [
                    \App\Models\AcademicPeriod::STATUS_ACTIVE,
                    \App\Models\AcademicPeriod::STATUS_PLANNING
                ])->orderBy('fecha_inicio', 'desc')->get()->map(fn($c) => [
                    'id' => $c->id,
                    'nombre' => $c->nombre,
                    'status' => $c->status
                ])->toArray();
            }),
            'especialidades' => \Cache::remember('admin_docentes_especialidades_catalog', 300, function() {
                return \App\Models\Specialty::all()->map(fn($s) => [
                    'id' => $s->id,
                    'nombre' => $s->nombre,
                    'sub_areas' => $s->sub_areas ?? []
                ])->toArray();
            }),
            'isCycleActive' => (bool)$activeCycle,
            'canRegister' => \App\Models\AcademicPeriod::whereIn('status', [
                \App\Models\AcademicPeriod::STATUS_PLANNING,
                \App\Models\AcademicPeriod::STATUS_ACTIVE
            ])->exists(),
            'activeCycleTeachersCount' => \Cache::remember('active_teachers_count', 120, function() use ($activeCycle) {
                if (!$activeCycle) return 0;
                return \DB::table('cargas_academicas')->where('ciclo_id', $activeCycle->id)->distinct('docente_id')->count();
            })
        ]);
    }

    public function store(Request $request)
    {
        // [SAFETY LOCK v3.6] Permitir registros si hay ciclo activo o en planeación
        if (!\App\Models\AcademicPeriod::whereIn('status', [
            \App\Models\AcademicPeriod::STATUS_PLANNING,
            \App\Models\AcademicPeriod::STATUS_ACTIVE
        ])->exists()) {
            return redirect()->back()->withErrors([
                'nombre' => 'Operación bloqueada. Debes tener un Ciclo Escolar vigente o en modo Planeación para registrar docentes.'
            ]);
        }

        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'required|string|max:255',
            'especialidad'     => 'required|string|max:255',
            'areas'            => 'nullable|array',
            'telefono'         => 'required|numeric|digits:10',
        ], [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_materno.required' => 'El apellido materno es obligatorio.',
            'especialidad.required'     => 'La especialidad es obligatoria.',
            'telefono.required'         => 'El número de celular es obligatorio.',
            'telefono.numeric'          => 'El celular solo debe contener números.',
            'telefono.digits'           => 'El número de celular debe tener exactamente 10 dígitos.',
        ]);

        // Generar matrícula docente: DOC-{INICIALES}{AÑO}, garantizando unicidad
        $firstInit    = strtoupper(substr(trim($request->nombre), 0, 1));
        $paternoInit  = strtoupper(substr(trim($request->apellido_paterno), 0, 1));
        $maternoInit  = (strtoupper(substr(trim($request->apellido_materno ?? ''), 0, 1))) ?: 'X';
        $year         = date('Y');
        $baseCode     = "DOC-{$firstInit}{$paternoInit}{$maternoInit}{$year}";
        $employeeCode = $baseCode;
        $counter      = 1;
        while (Teacher::where('codigo_empleado', $employeeCode)->exists()) {
            $employeeCode = $baseCode . $counter;
            $counter++;
        }

        // [ESTANDARIZACIÓN v4.0] Generación de correo profesional
        // Usar el correo enviado por el frontend como sugerencia base
        $generatedEmail = $request->email;

        // Si por alguna razón no viene el correo o ya existe, lo generamos/ajustamos
        if (empty($generatedEmail) || User::where('email', $generatedEmail)->exists()) {
            $firstNamePart  = strtolower(explode(' ', trim($request->nombre))[0] ?? '');
            $paternoPartRaw = strtolower(explode(' ', trim($request->apellido_paterno))[0] ?? '');
            $firstNamePart  = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $firstNamePart));
            $paternoPart    = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $paternoPartRaw));

            $initials = substr($firstNamePart, 0, 1) . substr($paternoPart, 0, 1);
            $emailBase = "{$firstNamePart}.{$paternoPart}.{$initials}";

            // Buscar un número único
            $counter = rand(10, 99);
            do {
                $generatedEmail = "{$emailBase}{$counter}@prepahidalgo.edu.mx";
                $counter++;
            } while (User::where('email', $generatedEmail)->exists());
        }

        $user = DB::transaction(function () use ($request, $employeeCode, $generatedEmail) {
            // 1. Crear el usuario correspondiente
            $u = User::create([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $generatedEmail,
                'password'         => Hash::make('Prepahid2026'),
                'rol'              => 'docente',
            ]);

            // 2. Crear el docente enlazado
            Teacher::create([
                'usuario_id'       => $u->id,
                'codigo_empleado'  => $employeeCode,
                'especialidad'     => $request->especialidad,
                'areas'            => $request->areas ?? [],
            ]);

            return $u;
        });

        $this->invalidateListCache($user->id);
        return redirect()->route('admin.docentes.index');
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'required|string|max:255',
            'email'            => "required|string|email|max:255|unique:users,email,{$teacher->usuario_id}",
            'especialidad'     => 'required|string|max:255',
            'areas'            => 'nullable|array',
            'telefono'         => 'required|numeric|digits:10',
        ], [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_materno.required' => 'El apellido materno es obligatorio.',
            'email.required'            => 'El correo electrónico es obligatorio.',
            'email.unique'              => 'Este correo electrónico ya está registrado por otro usuario.',
            'especialidad.required'     => 'La especialidad es obligatoria.',
            'telefono.required'         => 'El número de celular es obligatorio.',
            'telefono.numeric'          => 'El celular solo debe contener números.',
            'telefono.digits'           => 'El número de celular debe tener exactamente 10 dígitos.',
        ]);

        DB::transaction(function () use ($request, $teacher) {
            // 1. Si está enlazado a un usuario, actualizar sus datos personales
            if ($teacher->user) {
                $teacher->user->update([
                    'nombre'           => $request->nombre,
                    'apellido_paterno' => $request->apellido_paterno,
                    'apellido_materno' => $request->apellido_materno,
                    'telefono'         => $request->telefono,
                    'email'            => $request->email,
                ]);
            }

            // 2. Actualizar docente
            $teacher->update([
                'especialidad'     => $request->especialidad,
                'areas'            => $request->areas ?? [],
            ]);
        });

        $this->invalidateListCache($teacher->usuario_id);
        return redirect()->route('admin.docentes.index');
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);

        // 1. Verificar si tiene materias asignadas (Cargas Académicas)
        $loadsCount = $teacher->academicLoads()->count();
        if ($loadsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar al docente '{$teacher->user->nombre}' porque tiene {$loadsCount} materias asignadas actualmente."
            ]);
        }

        // 2. Verificar si es tutor de algún grupo
        $groupTutor = \App\Models\AcademicGroup::where('docente_tutor_id', $teacher->id)->first();
        if ($groupTutor) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar al docente '{$teacher->user->nombre}' porque es tutor titular del grupo '{$groupTutor->nombre}'."
            ]);
        }

        DB::transaction(function () use ($teacher) {
            if ($teacher->user) {
                $teacher->user->delete();
            }
            $teacher->delete();
        });

        $this->invalidateListCache($teacher->usuario_id);
        return redirect()->route('admin.docentes.index');
    }

    private function invalidateListCache(?int $teacherUserId = null): void
    {
        Cache::add('admin:docentes:list:revision', 1, now()->addDays(30));
        Cache::increment('admin:docentes:list:revision');
        Cache::forget('admin_system_metrics');
        Cache::forget('admin_users_stats_cache');
        if ($teacherUserId) {
            Cache::forget("sidebar_docente_{$teacherUserId}");
        }
    }
}

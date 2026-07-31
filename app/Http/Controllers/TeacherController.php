<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use App\Models\AcademicGroup;
use App\Models\Specialty;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $selectedCycleId = $request->query('cycle');

        // [OPTIMIZACIÓN 1] Obtener periodos relevantes en UNA sola consulta
        $periods = AcademicPeriod::select('id', 'nombre', 'status', 'fecha_inicio')
            ->whereIn('status', [AcademicPeriod::STATUS_ACTIVE, AcademicPeriod::STATUS_PLANNING])
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        $activeCycle = $periods->firstWhere('status', AcademicPeriod::STATUS_ACTIVE);
        $planningCycle = $periods->firstWhere('status', AcademicPeriod::STATUS_PLANNING);

        // Determinar el ciclo de trabajo en memoria sin hacer extra query
        $workingCycle = null;
        if ($selectedCycleId) {
            $workingCycle = $periods->firstWhere('id', $selectedCycleId) ?? AcademicPeriod::find($selectedCycleId);
        }
        $workingCycle = $workingCycle ?: ($activeCycle ?: $planningCycle);

        $isCycleActive = !is_null($activeCycle);
        $canRegister = $periods->isNotEmpty();

        return Inertia::render('Admin/Docentes/Index', [
            'teachers' => Inertia::defer(function () use ($search, $workingCycle) {
                // [OPTIMIZACIÓN 2] Carga selectiva de relaciones y uso de ilike para Postgres
                $query = Teacher::select('id', 'usuario_id', 'codigo_empleado', 'especialidad', 'areas')
                    ->whereHas('user');

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('codigo_empleado', 'ilike', "%{$search}%")
                          ->orWhereHas('user', function($qu) use ($search) {
                              $qu->where('nombre', 'ilike', "%{$search}%")
                                 ->orWhere('apellido_paterno', 'ilike', "%{$search}%")
                                 ->orWhere('email', 'ilike', "%{$search}%");
                          });
                    });
                }

                // Carga optimizada de cargas académicas solo seleccionando columnas necesarias
                $loadsRelation = $workingCycle
                    ? ['academicLoads' => fn($q) => $q->where('ciclo_id', $workingCycle->id)
                        ->select('id', 'docente_id', 'materia_id', 'grupo_id')
                        ->with([
                            'course:id,nombre,codigo',
                            'academicGroup:id,nombre'
                        ])]
                    : ['academicLoads' => fn($q) => $q->select('id', 'docente_id', 'materia_id', 'grupo_id')
                        ->with([
                            'course:id,nombre,codigo',
                            'academicGroup:id,nombre'
                        ])];

                return $query->with(array_merge($loadsRelation, ['user:id,nombre,apellido_paterno,apellido_materno,telefono,email']))
                    ->paginate(50)
                    ->through(fn ($t) => [
                        'id'               => $t->id,
                        'codigo_empleado'  => $t->codigo_empleado,
                        'nombre'           => $t->user->nombre ?? '',
                        'apellido_paterno' => $t->user->apellido_paterno ?? '',
                        'apellido_materno' => $t->user->apellido_materno ?? '',
                        'especialidad'     => $t->especialidad,
                        'areas'            => $t->areas ?? [],
                        'telefono'         => $t->user->telefono ?? '',
                        'usuario'          => $t->user ? ['email' => $t->user->email] : null,
                        'materias'         => $t->academicLoads->map(fn($l) => [
                            'id'           => $l->course->id ?? null,
                            'nombre'       => $l->course->nombre ?? 'N/A',
                            'codigo'       => $l->course->codigo ?? '',
                            'nombre_group' => $l->academicGroup->nombre ?? 'N/A',
                        ])->values()->toArray(),
                    ])
                    ->withQueryString();
            }),

            'filters' => [
                'search' => $search,
                'cycle' => $workingCycle ? $workingCycle->id : null
            ],

            'availableCycles' => $periods->map(fn($c) => [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'status' => $c->status
            ]),

            // Proyección liviana de especialidades
            'especialidades' => Inertia::defer(fn() => Specialty::select('id', 'nombre', 'sub_areas')->get()),

            'isCycleActive' => $isCycleActive,
            'canRegister' => $canRegister,

            'activeCycleTeachersCount' => Inertia::defer(function() use ($activeCycle) {
                if (!$activeCycle) return 0;
                return DB::table('cargas_academicas')
                    ->where('ciclo_id', $activeCycle->id)
                    ->distinct('docente_id')
                    ->count('docente_id');
            })
        ]);
    }

    public function store(Request $request)
    {
        if (!AcademicPeriod::whereIn('status', [AcademicPeriod::STATUS_PLANNING, AcademicPeriod::STATUS_ACTIVE])->exists()) {
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

        // Generar código de empleado con búsqueda directa en BD
        $firstInit   = strtoupper(substr(trim($request->nombre), 0, 1));
        $paternoInit = strtoupper(substr(trim($request->apellido_paterno), 0, 1));
        $maternoInit = (strtoupper(substr(trim($request->apellido_materno ?? ''), 0, 1))) ?: 'X';
        $year        = date('Y');
        $baseCode    = "DOC-{$firstInit}{$paternoInit}{$maternoInit}{$year}";

        $countExisting = Teacher::where('codigo_empleado', 'like', "{$baseCode}%")->count();
        $employeeCode = $countExisting > 0 ? "{$baseCode}{$countExisting}" : $baseCode;

        // Generación de correo profesional
        $generatedEmail = $request->email;

        if (empty($generatedEmail) || User::where('email', $generatedEmail)->exists()) {
            $firstNamePart  = strtolower(explode(' ', trim($request->nombre))[0] ?? '');
            $paternoPartRaw = strtolower(explode(' ', trim($request->apellido_paterno))[0] ?? '');
            $firstNamePart  = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $firstNamePart));
            $paternoPart    = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $paternoPartRaw));

            $initials = substr($firstNamePart, 0, 1) . substr($paternoPart, 0, 1);
            $emailBase = "{$firstNamePart}.{$paternoPart}.{$initials}";

            $randomNum = rand(10, 99);
            $generatedEmail = "{$emailBase}{$randomNum}@prepahidalgo.edu.mx";
            
            while (User::where('email', $generatedEmail)->exists()) {
                $randomNum++;
                $generatedEmail = "{$emailBase}{$randomNum}@prepahidalgo.edu.mx";
            }
        }

        DB::transaction(function () use ($request, $employeeCode, $generatedEmail) {
            $user = User::create([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $generatedEmail,
                'password'         => Hash::make('Prepahid2026'),
                'rol'              => 'docente',
            ]);

            Teacher::create([
                'usuario_id'      => $user->id,
                'codigo_empleado' => $employeeCode,
                'especialidad'    => $request->especialidad,
                'areas'           => $request->areas ?? [],
            ]);
        });

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
            if ($teacher->usuario_id) {
                User::where('id', $teacher->usuario_id)->update([
                    'nombre'           => $request->nombre,
                    'apellido_paterno' => $request->apellido_paterno,
                    'apellido_materno' => $request->apellido_materno,
                    'telefono'         => $request->telefono,
                    'email'            => $request->email,
                ]);
            }

            $teacher->update([
                'especialidad' => $request->especialidad,
                'areas'        => $request->areas ?? [],
            ]);
        });

        return redirect()->route('admin.docentes.index');
    }

    public function destroy($id)
    {
        $teacher = Teacher::with('user:id,nombre')->findOrFail($id);

        $loadsCount = $teacher->academicLoads()->count();
        if ($loadsCount > 0) {
            $nombre = $teacher->user->nombre ?? 'Docente';
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar al docente '{$nombre}' porque tiene {$loadsCount} materias asignadas actualmente."
            ]);
        }

        $groupTutor = AcademicGroup::select('nombre')->where('docente_tutor_id', $teacher->id)->first();
        if ($groupTutor) {
            $nombre = $teacher->user->nombre ?? 'Docente';
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar al docente '{$nombre}' porque es tutor titular del grupo '{$groupTutor->nombre}'."
            ]);
        }

        DB::transaction(function () use ($teacher) {
            $userId = $teacher->usuario_id;
            $teacher->delete();
            if ($userId) {
                User::where('id', $userId)->delete();
            }
        });

        return redirect()->route('admin.docentes.index');
    }
}
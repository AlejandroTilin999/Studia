<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\User;
use App\Models\Student;
use App\Models\AcademicGroup;
use App\Models\Enrollment;
use App\Models\AcademicPeriod;
use App\Services\AcademicPeriodService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AlumnoController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $group = $request->query('group');
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

        // La lista no cambia entre recargas salvo que se modifique un alumno
        // (caso en el que invalidateListCache() cambia la revisi\u00f3n). Si ya
        // existe, se entrega en la respuesta inicial y evitamos una segunda
        // petici\u00f3n diferida que retrasaba el primer pintado de la pantalla.
        $revision = Cache::get('admin:alumnos:list:revision', 1);
        $page = max(1, (int) $request->query('page', 1));
        $studentsCacheKey = $workingCycle
            ? "admin:alumnos:list:{$revision}:{$workingCycle->id}:{$page}:" . ($group ?: 'all') . ':' . md5((string) $search)
            : null;
        $cachedStudents = $studentsCacheKey ? Cache::get($studentsCacheKey) : null;

        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => $cachedStudents ?? Inertia::defer(function () use ($search, $group, $workingCycle, $studentsCacheKey) {
                // Si no hay ciclo de trabajo, no hay alumnos operativos
                if (!$workingCycle) {
                    return [
                        'items' => ['data' => [], 'total' => 0, 'current_page' => 1, 'last_page' => 1],
                        'summary' => ['total' => 0, 'active' => 0, 'suspended' => 0],
                    ];
                }

                return Cache::remember($studentsCacheKey, now()->addMinutes(5), function () use ($search, $group, $workingCycle) {
                $query = Student::query()
                    ->join('users', 'alumnos.usuario_id', '=', 'users.id')
                    ->join('inscripciones', function($join) use ($workingCycle) {
                        $join->on('alumnos.usuario_id', '=', 'inscripciones.usuario_id')
                             ->where('inscripciones.ciclo_id', '=', $workingCycle->id);
                    })
                    ->leftJoin('grupos', 'inscripciones.grupo_id', '=', 'grupos.id')
                    ->select([
                        'alumnos.id',
                        'alumnos.usuario_id',
                        'alumnos.matricula',
                        'alumnos.fecha_nacimiento',
                        'users.nombre as user_nombre',
                        'users.apellido_paterno as user_paterno',
                        'users.apellido_materno as user_materno',
                        'users.email as user_email',
                        'users.telefono as user_telefono',
                        'grupos.id as grupo_id',
                        'grupos.nombre as grupo_nombre',
                        'inscripciones.estatus as inscripcion_estatus'
                    ]);

                if ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('alumnos.matricula', 'like', "%{$search}%")
                          ->orWhere('users.nombre', 'like', "%{$search}%")
                          ->orWhere('users.apellido_paterno', 'like', "%{$search}%")
                          ->orWhere('users.apellido_materno', 'like', "%{$search}%")
                          ->orWhere('users.email', 'like', "%{$search}%");
                    });
                }

                if ($group && $group !== 'all') {
                    $query->where('inscripciones.grupo_id', $group);
                }

                $summary = (clone $query)->select(DB::raw(
                    "COUNT(*) as total, SUM(CASE WHEN inscripciones.estatus = 'active' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN inscripciones.estatus = 'suspended' THEN 1 ELSE 0 END) as suspended"
                ))->first();

                $items = $query->orderBy('users.apellido_paterno')->orderBy('users.nombre')
                    ->paginate(50)
                    ->through(function ($item) {
                        return [
                            'id' => $item->id,
                            'usuario_id' => $item->usuario_id,
                            'nombre' => trim("{$item->user_nombre} {$item->user_paterno} {$item->user_materno}"),
                            'rawNombre' => $item->user_nombre ?? '',
                            'rawPaterno' => $item->user_paterno ?? '',
                            'rawMaterno' => $item->user_materno ?? '',
                            'email' => $item->user_email ?? 'Sin correo',
                            'matricula' => $item->matricula,
                            'telefono' => $item->user_telefono ?? '',
                            'fecha_nacimiento' => $item->fecha_nacimiento ?? '',
                            'grupo' => $item->grupo_id ? [
                                'id' => $item->grupo_id,
                                'nombre' => $item->grupo_nombre,
                            ] : null,
                            'estatus' => $item->inscripcion_estatus ?? 'active',
                        ];
                    })
                    ->withQueryString();

                return [
                    'items' => $items,
                    'summary' => [
                        'total' => (int) ($summary->total ?? 0),
                        'active' => (int) ($summary->active ?? 0),
                        'suspended' => (int) ($summary->suspended ?? 0),
                    ],
                ];
                });
            }),
            'groups' => \Cache::remember('admin_alumnos_groups_catalog', 300, function() {
                return AcademicGroup::select('id', 'nombre', 'codigo', 'especialidad')->get()->map(fn($g) => [
                    'id' => $g->id,
                    'nombre' => $g->nombre,
                    'codigo' => $g->codigo,
                    'especialidad' => $g->especialidad,
                ])->toArray();
            }),
            'filters' => [
                'search' => $search,
                'group' => $group,
                'cycle' => $workingCycle ? $workingCycle->id : null
            ],
            'availableCycles' => \Cache::remember('admin_alumnos_cycles_catalog', 300, function() {
                return \App\Models\AcademicPeriod::select('id', 'nombre', 'status', 'fecha_inicio')
                    ->whereIn('status', [
                        \App\Models\AcademicPeriod::STATUS_ACTIVE,
                        \App\Models\AcademicPeriod::STATUS_PLANNING
                    ])->orderBy('fecha_inicio', 'desc')->get()->map(fn($c) => [
                        'id' => $c->id,
                        'nombre' => $c->nombre,
                        'status' => $c->status
                    ])->toArray();
            }),
            'isCycleActive' => (bool)$activeCycle,
            'canRegister' => (bool) $operatingCycle,
        ]);
    }

    public function store(Request $request)
    {
        // [SAFETY LOCK v3.6] Permitir inscripciones en ciclos Activos o en Planeación
        $targetCycle = \App\Models\AcademicPeriod::whereIn('status', [
            \App\Models\AcademicPeriod::STATUS_ACTIVE,
            \App\Models\AcademicPeriod::STATUS_PLANNING
        ])->first();

        if (!$targetCycle) {
            return redirect()->back()->withErrors([
                'grupo_id' => 'Operación bloqueada. Debes tener un Ciclo Escolar vigente o en modo Planeación para inscribir alumnos.'
            ]);
        }

        $request->validate([
            'nombre'            => 'required|string|max:255',
            'apellido_paterno'  => 'required|string|max:255',
            'apellido_materno'  => 'nullable|string|max:255',
            'email'             => 'nullable|string|email|max:255',
            'matricula'         => 'required|string|max:50',
            'telefono'          => 'required|string|max:20',
            'fecha_nacimiento'  => 'required|date',
            'grupo_id'          => 'required|exists:grupos,id',
        ]);

        // Validar cupo del grupo (límite: 22 estudiantes por grupo)
        $group = \App\Models\AcademicGroup::findOrFail($request->grupo_id);
        if ((int) $group->semestre !== 1) {
            return redirect()->back()->withErrors([
                'grupo_id' => 'Las altas ordinarias solo se permiten en grupos de primer semestre. Para otros semestres usa promoción, repetición o traslado.',
            ]);
        }

        $activeEnrollmentsCount = Enrollment::where('grupo_id', $request->grupo_id)
            ->where('ciclo_id', $targetCycle->id)
            ->where('estatus', 'active')
            ->count();

        if ($activeEnrollmentsCount >= 22) {
            return redirect()->back()->withErrors([
                'grupo_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
            ]);
        }

        // [ESTANDARIZACIÓN v4.0] Generación de correo profesional sugerido por el frontend
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

        // --- GARANTIZAR MATRÍCULA ÚNICA ---
        $matriculaBase = $request->matricula;
        $finalMatricula = $matriculaBase;
        $counter = 1;
        while (Student::where('matricula', $finalMatricula)->exists()) {
            $finalMatricula = $matriculaBase . chr(64 + $counter); // Agrega A, B, C...
            $counter++;
        }

        $targetCycleId = $targetCycle->id;

        DB::transaction(function () use ($request, $generatedEmail, $finalMatricula, $targetCycleId) {
            // 1. Crear el usuario correspondiente
            $user = User::create([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $generatedEmail,
                'password'         => Hash::make('Prepahid2026'),
                'rol'              => 'alumno',
            ]);

            // 2. Crear el perfil de estudiante
            Student::create([
                'usuario_id'       => $user->id,
                'matricula'        => $finalMatricula,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'estatus'          => 'active',
            ]);

            // 3. Registrar su inscripción en el grupo
            Enrollment::create([
                'usuario_id'    => $user->id,
                'grupo_id'      => $request->grupo_id,
                'ciclo_id'      => $targetCycleId,
                'codigo_alumno' => $finalMatricula,
                'estatus'       => 'active',
            ]);
        });

        $this->invalidateListCache();
        return redirect()->route('admin.alumnos.index');
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'nombre'            => 'required|string|max:255',
            'apellido_paterno'  => 'required|string|max:255',
            'apellido_materno'  => 'nullable|string|max:255',
            'email'             => "required|string|email|max:255|unique:users,email,{$student->usuario_id}",
            'matricula'         => "required|string|max:50|unique:alumnos,matricula,{$student->id}",
            'telefono'          => 'required|string|max:20',
            'fecha_nacimiento'  => 'required|date',
            'grupo_id'          => 'required|exists:grupos,id',
        ]);

        // Validar cupo del grupo si cambió de grupo
        $currentGroupId = $student->enrollment ? $student->enrollment->grupo_id : null;
        if ($currentGroupId != $request->grupo_id) {
            $activeEnrollmentsCount = Enrollment::where('grupo_id', $request->grupo_id)
                ->where('estatus', 'active')
                ->count();

            if ($activeEnrollmentsCount >= 22) {
                return redirect()->back()->withErrors([
                    'grupo_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
                ]);
            }
        }

        DB::transaction(function () use ($request, $student) {
            // 1. Actualizar datos en la tabla general de usuarios
            $student->user->update([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $request->email,
            ]);

            // 2. Actualizar datos específicos de la tabla estudiantes
            $student->update([
                'matricula'        => $request->matricula,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'estatus'          => $request->estatus ?? $student->estatus,
            ]);

            // 3. Actualizar inscripción (traslado con historial o asignación inicial)
            $targetCycle = \App\Models\AcademicPeriod::whereIn('status', [
                \App\Models\AcademicPeriod::STATUS_ACTIVE,
                \App\Models\AcademicPeriod::STATUS_PLANNING
            ])->first();

            $periodId = $targetCycle ? $targetCycle->id : null;

            if ($student->enrollment) {
                $student->enrollment->update([
                    'grupo_id'      => $request->grupo_id,
                    'codigo_alumno' => $request->matricula,
                    'estatus'       => $request->estatus ?? $student->enrollment->estatus,
                ]);
            } else {
                Enrollment::create([
                    'usuario_id'    => $student->usuario_id,
                    'grupo_id'      => $request->grupo_id,
                    'ciclo_id'      => $periodId,
                    'codigo_alumno' => $request->matricula,
                    'estatus'       => $request->estatus ?? 'active',
                ]);
            }
        });

        $this->invalidateListCache();
        return redirect()->route('admin.alumnos.index');
    }

    public function toggleStatus($id)
    {
        $student = Student::findOrFail($id);

        // 1. Determinar el nuevo estado
        // Usamos el estatus del alumno como fuente de verdad
        $currentStatus = $student->estatus ?? 'active';
        $newStatus = ($currentStatus === 'active') ? 'suspended' : 'active';

        // 2. Actualizar el alumno
        $student->update(['estatus' => $newStatus]);

        // 3. Sincronizar con la inscripción (si existe)
        if ($student->enrollment) {
            $student->enrollment->update(['estatus' => $newStatus]);
        }

        $this->invalidateListCache();
        return redirect()->back()->with('message', 'Estado del alumno actualizado.');
    }

    /**
     * Obtiene el Kardex detallado de un alumno (Carga bajo demanda para velocidad)
     */
    public function getKardex($id)
    {
        $student = Student::findOrFail($id);
        $kardex = \App\Services\GradeService::getStudentKardex($student->usuario_id);

        return response()->json([
            'kardex' => $kardex
        ]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        // Verificar si tiene historial de calificaciones
        $gradesCount = \App\Models\Grade::where('usuario_id', $student->usuario_id)->count();
        if ($gradesCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el expediente de '{$student->nombre}' porque ya cuenta con {$gradesCount} calificaciones asentadas en su historial."
            ]);
        }

        DB::transaction(function () use ($student) {
            // 1. Eliminar inscripciones
            if ($student->enrollment) {
                $student->enrollment->delete();
            }

            // 2. Eliminar usuario asociado
            if ($student->user) {
                $student->user->delete();
            }

            // 3. Eliminar alumno
            $student->delete();
        });

        $this->invalidateListCache();
        return redirect()->route('admin.alumnos.index');
    }

    private function invalidateListCache(): void
    {
        Cache::increment('admin:alumnos:list:revision');
    }

    /**
     * Subir documento de alumno a Google Drive y guardar en base de datos.
     */
    public function uploadDocument(Request $request, $id, \App\Services\GoogleDriveService $driveService)
    {
        $request->validate([
            'tipo_documento' => 'required|string|max:100',
            'archivo'        => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // máx 10MB
        ]);

        $student = Student::with(['user', 'enrollment.academicGroup', 'enrollment.academicPeriod'])->findOrFail($id);
        $file = $request->file('archivo');

        // 1. Guardar temporalmente en local
        $tempPath = $file->storeAs('tmp', uniqid() . '_' . $file->getClientOriginalName());
        $fullPath = storage_path('app/' . $tempPath);

        try {
            // 2. Obtener carpeta correspondiente en Google Drive
            $folderId = $driveService->getOrCreateStudentFolder($student);

            // 3. Subir archivo a la carpeta de Drive
            $driveFile = $driveService->uploadFileToFolder($fullPath, $file->getClientOriginalName(), $folderId);

            // 4. Registrar en base de datos
            $document = \App\Models\StudentDocument::create([
                'alumno_id'            => $student->id,
                'nombre_archivo'       => $file->getClientOriginalName(),
                'tipo_documento'       => $request->tipo_documento,
                'google_drive_file_id' => $driveFile->getId(),
                'google_drive_url'     => $driveFile->getWebViewLink(),
                'fecha_subida'         => now(),
            ]);

            return redirect()->back()->with('message', 'Documento subido a Google Drive con éxito.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['archivo' => 'Error al subir a Google Drive: ' . $e->getMessage()]);
        } finally {
            // 5. Eliminar temporal local
            if (file_exists($fullPath)) {
                @unlink($fullPath);
            }
        }
    }

    /**
     * Obtener lista de documentos de un alumno.
     */
    public function getDocuments($id)
    {
        $student = Student::findOrFail($id);
        $documents = \App\Models\StudentDocument::where('alumno_id', $student->id)
            ->orderBy('fecha_subida', 'desc')
            ->get();

        return response()->json(['documents' => $documents]);
    }

    /**
     * Eliminar un documento del alumno de Google Drive y DB.
     */
    public function deleteDocument($id, $documentId, \App\Services\GoogleDriveService $driveService)
    {
        $document = \App\Models\StudentDocument::where('alumno_id', $id)->findOrFail($documentId);

        try {
            $driveService->deleteFile($document->google_drive_file_id);
        } catch (\Exception $e) {
            // Log warning si ya fue borrado en Drive
        }

        $document->delete();

        return redirect()->back()->with('message', 'Documento eliminado.');
    }
}

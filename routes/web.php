<?php

use App\Http\Controllers\Admin\AlumnoController as StudentController;
use App\Http\Controllers\Admin\DocenteController as TeacherController;
use App\Http\Controllers\Admin\MateriaController as CourseController;
use App\Http\Controllers\Admin\GrupoController as GroupController;
use App\Http\Controllers\Admin\CargaAcademicaController as AcademicLoadController;
use App\Http\Controllers\Admin\CicloEscolarController as AcademicPeriodController;
use App\Http\Controllers\Admin\ReporteController as ReportController;
use App\Http\Controllers\Admin\EspecialidadController as SpecialtyController;
use App\Http\Controllers\Admin\UsuarioController as UserController;
use App\Http\Controllers\Admin\PromocionController as PromotionController;
use App\Http\Controllers\Docente\MateriaDocenteController;
use App\Http\Controllers\Alumno\EntregaTareaAlumnoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\Auth\PasswordChangeController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GoogleAuthController; 
use App\Models\AcademicPeriod;
use App\Models\AdminAuditLog;
use App\Models\Enrollment;
use App\Services\AcademicPeriodService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

Route::get('/google/auth', [GoogleAuthController::class, 'redirect']);

Route::get('/google/callback', [GoogleAuthController::class, 'callback']);
// ==========================================
// 1. VISTAS PÚBLICAS
// ==========================================
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// ==========================================
// 3. RUTAS PROTEGIDAS
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/cambiar-contrasena', [PasswordChangeController::class, 'show'])->name('password.change_view');
    Route::post('/cambiar-contrasena', [PasswordChangeController::class, 'update'])->name('password.force_update');

    Route::middleware(['force.password.change'])->group(function () {
        Route::get('/dashboard', function (Request $request) {
            $user = $request->user();
            $role = $user->rol ?? 'admin';

            if ($role === 'docente') {
                return redirect()->route('docente.dashboard');
            } elseif ($role === 'alumno') {
                return redirect()->route('alumno.dashboard');
            }

            return redirect()->route('admin.dashboard');
        })->name('dashboard');

        // ------------------------------------------
        // Módulo de Administración (Admin)
        // ------------------------------------------
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('/', function () {
    $cycles = Cache::remember(
        'admin_academic_periods_catalog',
        3600,
        static function (): array {
            $formatDate = static fn ($date) =>
                $date instanceof \DateTimeInterface
                    ? $date->format('Y-m-d')
                    : $date;

            return AcademicPeriod::query()
                ->orderByDesc('fecha_inicio')
                ->get([
                    'id',
                    'nombre',
                    'fecha_inicio',
                    'fecha_fin',
                    'activo',
                    'status',
                    'p1_inicio',
                    'p1_fin',
                    'p1_activo',
                    'p2_inicio',
                    'p2_fin',
                    'p2_activo',
                    'p3_inicio',
                    'p3_fin',
                    'p3_activo',
                ])
                ->map(static fn (AcademicPeriod $period): array => [
                    'id' => $period->id,
                    'nombre' => $period->nombre,
                    'fecha_inicio' => $formatDate($period->fecha_inicio),
                    'fecha_fin' => $formatDate($period->fecha_fin),
                    'activo' => (bool) $period->activo,
                    'status' => $period->status,
                    'p1_inicio' => $formatDate($period->p1_inicio),
                    'p1_fin' => $formatDate($period->p1_fin),
                    'p1_activo' => (bool) $period->p1_activo,
                    'p2_inicio' => $formatDate($period->p2_inicio),
                    'p2_fin' => $formatDate($period->p2_fin),
                    'p2_activo' => (bool) $period->p2_activo,
                    'p3_inicio' => $formatDate($period->p3_inicio),
                    'p3_fin' => $formatDate($period->p3_fin),
                    'p3_activo' => (bool) $period->p3_activo,
                ])
                ->values()
                ->all();
        }
    );

    $metricsData = Cache::remember(
        'admin_system_metrics',
        600,
        static function (): array {
            $raw = DB::selectOne("
                SELECT
                    (SELECT COUNT(*) FROM users WHERE rol = 'alumno') AS students_count,
                    (SELECT COUNT(*) FROM users WHERE rol = 'docente') AS teachers_count,
                    (SELECT COUNT(*) FROM grupos WHERE activo = true) AS groups_count,
                    (SELECT COUNT(*) FROM materias) AS courses_count,
                    (SELECT COUNT(*) FROM especialidades) AS specialties_count,
                    (SELECT COUNT(*) FROM users) AS users_count
            ");

            return [
                'studentsCount' => (int) ($raw->students_count ?? 0),
                'teachersCount' => (int) ($raw->teachers_count ?? 0),
                'groupsCount' => (int) ($raw->groups_count ?? 0),
                'coursesCount' => (int) ($raw->courses_count ?? 0),
                'specialtiesCount' => (int) ($raw->specialties_count ?? 0),
                'usersCount' => (int) ($raw->users_count ?? 0),
            ];
        }
    );

    $recentActivities = Inertia::defer(
        static fn () =>
            AdminAuditLog::query()
                ->with('user:id,nombre,apellido_paterno')
                ->latest('created_at')
                ->limit(15)
                ->get()
                ->map(static function ($log): array {
                    $actionLabel = match ($log->accion) {
                        'TOGGLE_PARCIAL' => isset($log->metadata['nuevo_estado'])
                            ? (
                                ($log->metadata['nuevo_estado'] === 'abierto'
                                    ? 'Abrió '
                                    : 'Cerró ')
                                . 'Parcial '
                                . ($log->metadata['parcial'] ?? '')
                            )
                            : 'Cambió Parcial',

                        'APERTURA_CICLO' => 'Apertura de Ciclo',
                        'ACTIVAR_CICLO' => 'Activó Ciclo',
                        'CONCLUIR_CICLO' => 'Concluyó Ciclo',
                        'ELIMINAR_REPORTE' => 'Eliminó Reporte',
                        'LIMPIAR_HISTORIAL_REPORTES' => 'Limpió Historial',

                        default => str_replace('_', ' ', $log->accion),
                    };

                    return [
                        'id' => $log->id,
                        'action' => $actionLabel,
                        'description' => $log->descripcion,
                        'user' => $log->user
                            ? $log->user->nombre_completo
                            : 'Sistema',
                        'time' => $log->created_at
                            ? $log->created_at->format('d/m/Y - h:i A')
                            : '',
                    ];
                })
                ->values()
                ->all()
    );

    return Inertia::render(
        'Admin/Dashboard/Index',
        [
            'cycles' => $cycles,
            'recentActivities' => $recentActivities,
            ...$metricsData,
        ]
    );
})->name('admin.dashboard');

            Route::post('/cycles', [AcademicPeriodController::class, 'store'])->name('admin.cycles.store');
            Route::put('/cycles/{id}', [AcademicPeriodController::class, 'update'])->name('admin.cycles.update');
            Route::post('/cycles/{id}/activate', [AcademicPeriodController::class, 'activate'])->name('admin.cycles.activate');
            Route::post('/cycles/{id}/close', [AcademicPeriodController::class, 'close'])->name('admin.cycles.close');
            Route::post('/cycles/{id}/toggle-parcial', [AcademicPeriodController::class, 'toggleParcial'])->name('admin.cycles.toggle_parcial');
            Route::delete('/audit-logs/{id}', [AcademicPeriodController::class, 'destroyLog'])->name('admin.audit_logs.destroy');

            Route::get('/usuarios', [UserController::class, 'index'])->name('admin.users.index');
            Route::post('/usuarios', [UserController::class, 'store'])->name('admin.users.store');
            Route::put('/usuarios/{id}', [UserController::class, 'update'])->name('admin.users.update');
            Route::post('/usuarios/{id}/toggle', [UserController::class, 'toggleStatus'])->name('admin.users.toggle');
            Route::post('/usuarios/{id}/reset-password', [UserController::class, 'resetPassword'])->name('admin.users.reset_password');
            Route::post('/usuarios/solicitudes-reset/{id}/aprobar', [UserController::class, 'approveReset'])->name('admin.users.reset_requests.approve');
            Route::delete('/usuarios/solicitudes/{id}', [UserController::class, 'deleteResetRequest'])->name('admin.users.delete_reset_request');

            Route::get('/alumnos', [StudentController::class, 'index'])->name('admin.alumnos.index');
            Route::get('/alumnos/{id}/kardex', [StudentController::class, 'getKardex'])->name('admin.alumnos.kardex');
            Route::get('/alumnos/{id}/documentos', [StudentController::class, 'getDocuments'])->name('admin.alumnos.documents.index');
            Route::post('/alumnos/{id}/documentos', [StudentController::class, 'uploadDocument'])->name('admin.alumnos.documents.store');
            Route::delete('/alumnos/{id}/documentos/{documentId}', [StudentController::class, 'deleteDocument'])->name('admin.alumnos.documents.destroy');
            Route::post('/alumnos', [StudentController::class, 'store'])->name('admin.alumnos.store');
            Route::put('/alumnos/{id}', [StudentController::class, 'update'])->name('admin.alumnos.update');
            Route::delete('/alumnos/{id}', [StudentController::class, 'destroy'])->name('admin.alumnos.destroy');
            Route::post('/alumnos/{id}/toggle', [StudentController::class, 'toggleStatus'])->name('admin.alumnos.toggle');


            Route::get('/docentes', [TeacherController::class, 'index'])->name('admin.docentes.index');
            Route::post('/docentes', [TeacherController::class, 'store'])->name('admin.docentes.store');
            Route::put('/docentes/{id}', [TeacherController::class, 'update'])->name('admin.docentes.update');
            Route::delete('/docentes/{id}', [TeacherController::class, 'destroy'])->name('admin.docentes.destroy');

            Route::get('/grupos', [GroupController::class, 'index'])->name('groups.index');
            Route::post('/grupos', [GroupController::class, 'store'])->name('groups.store');
            Route::put('/grupos/{id}', [GroupController::class, 'update'])->name('groups.update');
            Route::delete('/grupos/{id}', [GroupController::class, 'destroy'])->name('groups.destroy');

            Route::get('/asignaciones', [AcademicLoadController::class, 'index'])->name('admin.loads.index');
            Route::post('/asignaciones', [AcademicLoadController::class, 'store'])->name('admin.loads.store');
            Route::put('/asignaciones/{id}', [AcademicLoadController::class, 'update'])->name('admin.loads.update');
            Route::delete('/asignaciones/{id}', [AcademicLoadController::class, 'destroy'])->name('admin.loads.destroy');

            Route::get('/materias', [CourseController::class, 'index'])->name('admin.materias.index');
            Route::post('/materias', [CourseController::class, 'store'])->name('materias.store');
            Route::put('/materias/{id}', [CourseController::class, 'update'])->name('materias.update');
            Route::delete('/materias/{id}', [CourseController::class, 'destroy'])->name('materias.destroy');

            Route::get('/especialidades', [SpecialtyController::class, 'index'])->name('admin.especialidades.index');
            Route::post('/especialidades', [SpecialtyController::class, 'store'])->name('admin.especialidades.store');
            Route::put('/especialidades/{id}', [SpecialtyController::class, 'update'])->name('admin.especialidades.update');
            Route::delete('/especialidades/{id}', [SpecialtyController::class, 'destroy'])->name('admin.especialidades.destroy');

            // Gestión de Promociones y Cargas
            Route::post('/promociones/procesar', [PromotionController::class, 'promote'])->name('admin.promociones.promote');
            Route::post('/cargas/importar', [AcademicLoadController::class, 'cloneLoad'])->name('admin.loads.import');

            Route::get('/reportes', [ReportController::class, 'index'])->name('admin.reportes.index');
            Route::get('/reportes/asistencia-data/{grupo_id}/{ciclo_id}', [ReportController::class, 'getAttendanceData'])->name('admin.reportes.asistencia_data');
            Route::get('/reportes/asistencia-excel/{grupo_id}/{ciclo_id}', [ReportController::class, 'exportAttendanceCsv'])->name('admin.reportes.asistencia_excel');
            Route::get('/reportes/constancia-data/{matricula}', [ReportController::class, 'getCertificateData'])->name('admin.reportes.constancia_data');
            Route::get('/reportes/boleta-data/{matricula}/{periodId}', [ReportController::class, 'getGradeReportData'])->name('admin.reportes.boleta_data');
            Route::get('/reportes/kardex-data-full/{matricula}', [ReportController::class, 'getFullKardexData'])->name('admin.reportes.kardex_data_full');
            Route::post('/reportes/log-download', [ReportController::class, 'logDownload'])->name('admin.reportes.log_download');
            Route::post('/reportes/batch-data', [ReportController::class, 'getBatchData'])->name('admin.reportes.batch_data');
            Route::delete('/reportes/log/{id}', [ReportController::class, 'destroyDownload'])->name('admin.reportes.log_destroy');
            Route::delete('/reportes/history/clear', [ReportController::class, 'clearDownloadHistory'])->name('admin.reportes.history_clear');

            // Notificaciones
            Route::get('/notificaciones', [NotificacionController::class, 'index'])->name('admin.notificaciones.index');
            Route::post('/notificaciones/{id}/leer', [NotificacionController::class, 'markAsRead'])->name('admin.notificaciones.read');
            Route::post('/notificaciones/leer-todas', [NotificacionController::class, 'markAllAsRead'])->name('admin.notificaciones.read_all');

            // Plantillas de Correo (Brevo)
            Route::get('/plantillas-correo', [\App\Http\Controllers\Admin\PlantillaCorreoController::class, 'index'])->name('admin.plantillas_correo.index');
            Route::post('/plantillas-correo', [\App\Http\Controllers\Admin\PlantillaCorreoController::class, 'store'])->name('admin.plantillas_correo.store');
            Route::put('/plantillas-correo/{id}', [\App\Http\Controllers\Admin\PlantillaCorreoController::class, 'update'])->name('admin.plantillas_correo.update');
            Route::delete('/plantillas-correo/{id}', [\App\Http\Controllers\Admin\PlantillaCorreoController::class, 'destroy'])->name('admin.plantillas_correo.destroy');
            Route::post('/plantillas-correo/send', [\App\Http\Controllers\Admin\PlantillaCorreoController::class, 'sendEmail'])->name('admin.plantillas_correo.send');
        });

        // ------------------------------------------
        // Módulo de Docente
        // ------------------------------------------
        Route::prefix('docente')->middleware('role:docente')->group(function () {
            Route::get('/', function () {
                $user = auth()->user();
                $teacher = \App\Models\Teacher::where('usuario_id', $user->id)->first();
                $activeCycle = \App\Models\AcademicPeriod::where('activo', true)->first();

                $teacherInfo = [
                    'nombre' => $user->nombre_completo,
                    'especialidad' => $teacher?->especialidad ?? 'General',
                    'email' => $user->email,
                ];

                $assignedLoad = [];
                if ($teacher && $activeCycle) {
                    $assignedLoad = \Cache::remember("docente_dashboard_loads_{$teacher->id}_c{$activeCycle->id}", 300, function() use ($teacher, $activeCycle) {
                        $loads = \App\Models\AcademicLoad::where('docente_id', $teacher->id)
                            ->where('ciclo_id', $activeCycle->id)
                            ->with(['academicGroup', 'course'])
                            ->get();

                        $groupIds = $loads->pluck('grupo_id');
                        $studentCounts = \App\Models\Enrollment::whereIn('grupo_id', $groupIds)
                            ->where('ciclo_id', $activeCycle->id)
                            ->where('estatus', 'active')
                            ->selectRaw('grupo_id, count(*) as total')
                            ->groupBy('grupo_id')
                            ->pluck('total', 'grupo_id');

                        return $loads->map(fn($load) => [
                            'id' => $load->uuid,
                            'codigo' => $load->course->codigo ?? 'N/A',
                            'nombre_materia' => $load->course->nombre ?? 'N/A',
                            'nombre_grupo' => $load->academicGroup->nombre ?? 'N/A',
                            'cantidad_alumnos' => (int)($studentCounts[$load->grupo_id] ?? 0),
                            'turno' => 'Turno Matutino',
                            'estatus' => 'pending',
                        ])->toArray();
                    });
                }

                return Inertia::render('Docente/Dashboard', [
                    'assignedLoad' => $assignedLoad,
                    'teacherInfo' => $teacherInfo,
                    'calendarEvents' => \App\Http\Controllers\Docente\CalendarioEscolarController::getEvents(),
                    'isCycleActive' => (bool)$activeCycle
                ]);
            })->name('docente.dashboard');

            Route::get('/calendar/events', [\App\Http\Controllers\Docente\CalendarioEscolarController::class, 'index'])->name('docente.calendar.index');
            Route::post('/calendar/upload', [\App\Http\Controllers\Docente\CalendarioEscolarController::class, 'upload'])->name('docente.calendar.upload');

            Route::get('/grupos', function () {
                return Inertia::render('Docente/Grupos/Index');
            })->name('docente.grupos.index');

            Route::get('/grupos/show', [MateriaDocenteController::class, 'show'])->name('docente.grupos.show');

            Route::get('/clases/{uuid}/full-data', [MateriaDocenteController::class, 'getFullData']);
            Route::post('/clases/{uuid}/theme', [MateriaDocenteController::class, 'updateTheme'])->name('docente.clases.update_theme');

            Route::middleware('captura.abierta')->group(function() {
                Route::post('/clases/{uuid}/criterios', [MateriaDocenteController::class, 'saveCriterios']);
                Route::post('/clases/{uuid}/calificaciones', [MateriaDocenteController::class, 'saveCalificaciones']);
                Route::post('/clases/{uuid}/tareas', [MateriaDocenteController::class, 'saveTareas']);
                Route::post('/clases/{uuid}/upload-material', [MateriaDocenteController::class, 'uploadTaskMaterial']);
                Route::post('/clases/{uuid}/delete-material', [MateriaDocenteController::class, 'deleteTaskMaterial']);
                Route::post('/clases/{uuid}/return-grade', [MateriaDocenteController::class, 'returnGrade']);
                Route::post('/clases/{uuid}/conclude', [MateriaDocenteController::class, 'concludeParcial'])->name('docente.clases.conclude');
            });


            Route::get('/clases/{uuid}', [MateriaDocenteController::class, 'show'])->name('docente.clases.show');
            Route::get('/clases/{uuid}/parcial/{parcial}', [MateriaDocenteController::class, 'show'])
                ->whereNumber('parcial')
                ->name('docente.clases.parcial');
            Route::get('/clases/{uuid}/parcial/{parcial}/tareas/{task}', [MateriaDocenteController::class, 'show'])
                ->whereNumber('parcial')
                ->whereNumber('task')
                ->name('docente.clases.tarea');
        });

        // Alias de compatibilidad para subida de material de apoyo
        Route::post('/clases/{uuid}/upload-material', [MateriaDocenteController::class, 'uploadTaskMaterial'])->middleware(['auth', 'role:docente']);
        Route::post('/clases/{uuid}/delete-material', [MateriaDocenteController::class, 'deleteTaskMaterial'])->middleware(['auth', 'role:docente']);

        // ------------------------------------------
        // Módulo de Alumno
        // ------------------------------------------
        Route::prefix('alumno')->middleware('role:alumno')->group(function () {
            Route::get('/', function () {
                $studentId = auth()->id();
                $user = auth()->user();
                // Se comparte con Inertia: no abrir otra consulta remota al
                // recargar el inicio del alumno.
                $activeCycle = \Cache::remember('active_academic_period', 1800, fn() => \App\Models\AcademicPeriod::where('activo', true)->first());

                // [INTELIGENCIA v4.1] Mostrar inscripción activa más reciente (con caché a 0ms)
                $enrollment = \Cache::remember("student_enrollment_{$studentId}", 600, function() use ($studentId, $activeCycle) {
                    if ($activeCycle) {
                        $e = \App\Models\Enrollment::where('usuario_id', $studentId)
                            ->where('ciclo_id', $activeCycle->id)
                            ->where('estatus', 'active')
                            ->with(['academicGroup.tutor.user', 'academicPeriod'])
                            ->first();
                        if ($e) return $e;
                    }
                    return \App\Models\Enrollment::where('usuario_id', $studentId)
                        ->where('estatus', 'active')
                        ->with(['academicGroup.tutor.user', 'academicPeriod'])
                        ->orderBy('ciclo_id', 'desc')
                        ->first();
                });

                    $cycleName = $enrollment?->academicPeriod?->nombre ?? 'Ciclo No Activo';
                    $fullCicloLabel = str_starts_with($cycleName, 'Ciclo') ? $cycleName : "Ciclo Escolar " . $cycleName;

                    $studentInfo = [
                        'groupId' => $enrollment?->grupo_id,
                        'name' => $user->nombre_completo,
                        'firstName' => $user->nombre,
                        'lastNamePaternal' => $user->apellido_paterno,
                        'lastNameMaternal' => $user->apellido_materno,
                        'email' => $user->email,
                        'matricula' => $enrollment?->codigo_alumno ?? 'ALU-' . $studentId,
                        'groupName' => $enrollment?->academicGroup ? ($enrollment->academicGroup->codigo . ' ' . $enrollment->academicGroup->nombre) : 'Sin grupo',
                        'specialty' => $enrollment?->academicGroup?->especialidad ?? 'Técnico en Informática',
                        'registeredAt' => $enrollment?->created_at ? $enrollment->created_at->format('M Y') : 'Agosto 2025',
                        'gpa' => '—', // Calculado en el cliente para velocidad instantánea
                        'tutor' => $enrollment?->academicGroup?->tutor?->user?->nombre_completo ?? 'Sin tutor',
                        'ciclo' => $fullCicloLabel,
                    ];

                return Inertia::render('Alumno/Dashboard', [
                    'studentInfo' => $studentInfo,
                    'kardex' => Inertia::defer(fn() => \App\Services\GradeService::getStudentKardex($studentId)),
                    'taskList' => Inertia::defer(fn() => \App\Services\GradeService::getStudentTasks($studentId)),
                    'isCycleActive' => (bool)$activeCycle
                ]);
            })->name('alumno.dashboard');

            Route::get('/materias', function (\Illuminate\Http\Request $request) {
                if ($legacyLoad = ($request->query('c') ?: $request->query('id'))) {
                    $path = '/alumno/materias/' . rawurlencode($legacyLoad);
                    $legacyParcial = $request->query('parcial');
                    if (ctype_digit((string) $legacyParcial)) {
                        $path .= '/parcial/' . $legacyParcial;

                        $legacyTask = $request->query('a') ?: $request->query('task');
                        if ($legacyTask) {
                            $task = \App\Models\Tarea::whereHas('academicLoad', fn($query) => $query->where('uuid', $legacyLoad))
                                ->get()
                                ->first(fn($item) => (string) $item->id === (string) $legacyTask
                                    || strtoupper(substr(md5('t_' . $item->id), 0, 6)) === strtoupper((string) $legacyTask));
                            if ($task && (int) $task->parcial === (int) $legacyParcial) {
                                $path .= '/tareas/' . $task->id;
                            }
                        }
                    }
                    return redirect()->to($path);
                }
                $studentId = auth()->id();
                $user = auth()->user();
                $activeCycle = \App\Models\AcademicPeriod::where('activo', true)->first();

                // [INTELIGENCIA v4.1] Mostrar inscripción activa más reciente (soporte para promociones)
                $enrollment = \App\Models\Enrollment::where('usuario_id', $studentId)
                    ->where('estatus', 'active')
                    ->with(['academicGroup.tutor.user', 'academicPeriod'])
                    ->orderBy('ciclo_id', 'desc')
                    ->first();

                $studentInfo = [
                    'name' => $user->nombre_completo,
                    'firstName' => $user->nombre,
                    'lastNamePaternal' => $user->apellido_paterno,
                    'lastNameMaternal' => $user->apellido_materno,
                    'email' => $user->email,
                    'matricula' => $enrollment?->codigo_alumno ?? 'ALU-' . $studentId,
                    'groupName' => $enrollment?->academicGroup ? ($enrollment->academicGroup->codigo . ' ' . $enrollment->academicGroup->nombre) : 'Sin grupo',
                    'specialty' => $enrollment?->academicGroup?->especialidad ?? 'Técnico en Informática',
                    'registeredAt' => $enrollment?->created_at ? $enrollment->created_at->format('M Y') : 'Agosto 2025',
                    'gpa' => '—',
                    'tutor' => $enrollment?->academicGroup?->tutor?->user?->nombre_completo ?? 'Sin tutor',
                    'ciclo' => $enrollment?->academicPeriod?->nombre ? ("Ciclo Escolar " . $enrollment->academicPeriod->nombre) : 'Ciclo 2026',
                    'groupId' => $enrollment?->grupo_id,
                ];

                return Inertia::render('Alumno/Dashboard', [
                    'defaultView' => 'tareas',
                    'studentInfo' => $studentInfo,
                    'kardex' => Inertia::defer(fn() => \App\Services\GradeService::getStudentKardex($studentId)),
                    'taskList' => Inertia::defer(fn() => \App\Services\GradeService::getStudentTasks($studentId)),
                    'isCycleActive' => (bool)$activeCycle
                ]);
            })->name('alumno.materias.index');

            Route::get('/materias/{loadUuid}', [\App\Http\Controllers\Alumno\MateriaAlumnoController::class, 'show'])->name('alumno.materias.show');
            Route::get('/materias/{loadUuid}/parcial/{parcial}', [\App\Http\Controllers\Alumno\MateriaAlumnoController::class, 'show'])
                ->where('parcial', '[1-3]')
                ->name('alumno.materias.parcial');
            Route::get('/materias/{loadUuid}/parcial/{parcial}/tareas/{task}', [\App\Http\Controllers\Alumno\MateriaAlumnoController::class, 'show'])
                ->where('parcial', '[1-3]')
                ->whereNumber('task')
                ->name('alumno.materias.tarea');

            Route::post('/tareas/entregar', [EntregaTareaAlumnoController::class, 'submitTask'])->name('alumno.tareas.entregar');
            Route::post('/tareas/confirmar', [EntregaTareaAlumnoController::class, 'confirmSubmission'])->name('alumno.tareas.confirmar');
            Route::post('/tareas/quitar-archivo', [EntregaTareaAlumnoController::class, 'removeSingleFile'])->name('alumno.tareas.quitar_archivo');
            Route::post('/tareas/anular', [EntregaTareaAlumnoController::class, 'cancelSubmission'])->name('alumno.tareas.anular');

            Route::get('/historial', function () {
                $studentId = auth()->id();
                $user = auth()->user();
                $enrollment = \App\Models\Enrollment::where('usuario_id', $studentId)
                    ->where('estatus', 'active')
                    ->with(['academicGroup.tutor.user', 'academicPeriod'])
                    ->orderBy('ciclo_id', 'desc')
                    ->first();

                $studentInfo = [
                    'name' => $user->nombre_completo,
                    'matricula' => $enrollment?->codigo_alumno ?? 'ALU-' . $studentId,
                    'groupName' => $enrollment?->academicGroup ? ($enrollment->academicGroup->codigo . ' ' . $enrollment->academicGroup->nombre) : 'Sin grupo',
                    'specialty' => $enrollment?->academicGroup?->especialidad ?? 'Técnico en Informática',
                    'ciclo' => $enrollment?->academicPeriod?->nombre ? ("Ciclo Escolar " . $enrollment->academicPeriod->nombre) : 'Ciclo 2026',
                ];

                return Inertia::render('Alumno/Historial', [
                    'studentInfo' => $studentInfo,
                    'fullKardex' => \App\Services\GradeService::getFullStudentKardex($studentId),
                ]);
            })->name('alumno.historial.index');
        });

        Route::get('/perfil', [ProfileController::class, 'edit'])->name('perfil.edit');
        Route::patch('/perfil', [ProfileController::class, 'update'])->name('perfil.update');
        Route::delete('/perfil', [ProfileController::class, 'destroy'])->name('perfil.destroy');
        Route::get('/calendar/events', [\App\Http\Controllers\Docente\CalendarioEscolarController::class, 'index'])->name('calendar.index');
    });
});

require __DIR__.'/auth.php';

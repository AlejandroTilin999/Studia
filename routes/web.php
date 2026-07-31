<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\AcademicLoadController;
use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SpecialtyController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\Auth\PasswordChangeController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
                $cycles = \App\Models\AcademicPeriod::orderBy('fecha_inicio', 'desc')->get()->map(function ($p) {
                    $formatDate = fn($d) => $d instanceof \DateTimeInterface ? $d->format('Y-m-d') : $d;

                    return [
                        'id' => $p->id,
                        'nombre' => $p->nombre,
                        'fecha_inicio' => $formatDate($p->fecha_inicio),
                        'fecha_fin' => $formatDate($p->fecha_fin),
                        'activo' => (bool)$p->activo,
                        'status' => $p->status,
                        // [FIX v2.9.3] Formatear fechas de parciales para evitar "Invalid Date"
                        'p1_inicio' => $formatDate($p->p1_inicio), 'p1_fin' => $formatDate($p->p1_fin), 'p1_activo' => (bool)$p->p1_activo,
                        'p2_inicio' => $formatDate($p->p2_inicio), 'p2_fin' => $formatDate($p->p2_fin), 'p2_activo' => (bool)$p->p2_activo,
                        'p3_inicio' => $formatDate($p->p3_inicio), 'p3_fin' => $formatDate($p->p3_fin), 'p3_activo' => (bool)$p->p3_activo,
                    ];
                });

                $activeCycle = \App\Models\AcademicPeriod::where('activo', true)->first();
                $activeCycleId = $activeCycle ? $activeCycle->id : null;
                $isNones = $activeCycle ? (\Carbon\Carbon::parse($activeCycle->fecha_inicio)->month >= 8 || \Carbon\Carbon::parse($activeCycle->fecha_inicio)->month === 1) : null;

                // [INTELIGENCIA v4.0] Resumen Global del Sistema (No restrictivo al ciclo activo)
                $studentsCount = Inertia::defer(fn() => \DB::table('users')->where('rol', 'alumno')->count());
                $teachersCount = Inertia::defer(fn() => \DB::table('users')->where('rol', 'docente')->count());
                $groupsCount   = Inertia::defer(fn() => \DB::table('grupos')->where('activo', true)->count());
                $coursesCount  = Inertia::defer(fn() => \DB::table('materias')->count());

                $specialtiesCount = Inertia::defer(fn() => \DB::table('especialidades')->count());
                $usersCount    = Inertia::defer(fn() => \DB::table('users')->count());

                // Actividades Recientes (Auditoría)
                $recentActivities = \App\Models\AdminAuditLog::with('user:id,nombre,apellido_paterno')
                    ->orderBy('created_at', 'desc')
                    ->limit(20)
                    ->get()
                    ->map(function($log) {
                        // [FORMAT v2.9.4] Mapeo de acciones técnicas a etiquetas legibles
                        $actionLabel = match($log->accion) {
                            'TOGGLE_PARCIAL' => isset($log->metadata['nuevo_estado'])
                                ? (($log->metadata['nuevo_estado'] === 'abierto' ? 'Abrió ' : 'Cerró ') . 'Parcial ' . ($log->metadata['parcial'] ?? ''))
                                : 'Cambió Parcial',
                            'APERTURA_CICLO'   => 'Apertura de Ciclo',
                            'ACTIVAR_CICLO'    => 'Activó Ciclo',
                            'CONCLUIR_CICLO'   => 'Concluyó Ciclo',
                            'ELIMINAR_REPORTE' => 'Eliminó Reporte',
                            'LIMPIAR_HISTORIAL_REPORTES' => 'Limpió Historial',
                            default => str_replace('_', ' ', $log->accion)
                        };

                        return [
                            'id' => $log->id,
                            'action' => $actionLabel,
                            'description' => $log->descripcion, // [NEW] Para mayor detalle
                            'user' => $log->user ? $log->user->nombre_completo : 'Sistema',
                            'time' => $log->created_at->isoFormat('D/MM/YYYY - h:mm A'),
                        ];
                    });

                return Inertia::render('Admin/Dashboard/Index', [
                    'cycles' => $cycles,
                    'studentsCount' => $studentsCount,
                    'teachersCount' => $teachersCount,
                    'groupsCount' => $groupsCount,
                    'coursesCount' => $coursesCount,
                    'specialtiesCount' => $specialtiesCount,
                    'usersCount' => $usersCount,
                    'recentActivities' => $recentActivities,
                ]);
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
            Route::post('/promociones/procesar', [\App\Http\Controllers\PromotionController::class, 'promote'])->name('admin.promociones.promote');
            Route::post('/cargas/importar', [AcademicLoadController::class, 'cloneLoad'])->name('admin.loads.import');

            Route::get('/reportes', [ReportController::class, 'index'])->name('admin.reportes.index');
            Route::get('/reportes/asistencia-data/{grupo_id}/{ciclo_id}', [ReportController::class, 'getAttendanceData'])->name('admin.reportes.asistencia_data');
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
        });

        // ------------------------------------------
        // Módulo de Docente
        // ------------------------------------------
        Route::prefix('docente')->middleware('role:docente')->group(function () {
            Route::get('/', function () {
                $user = auth()->user();
                $teacher = \App\Models\Teacher::where('usuario_id', $user->id)->first();
                $activeCycle = \App\Models\AcademicPeriod::where('activo', true)->first();

                return Inertia::render('Docente/Dashboard', [
                    'assignedLoad' => Inertia::defer(function() use ($teacher, $activeCycle) {
                        if (!$teacher || !$activeCycle) return [];

                        return \App\Models\AcademicLoad::where('docente_id', $teacher->id)
                            ->where('ciclo_id', $activeCycle->id)
                            ->with(['academicGroup', 'course'])
                            ->get()
                            ->map(fn($load) => [
                                'id' => $load->uuid,
                                'codigo' => $load->course->codigo ?? 'N/A',
                                'nombre_materia' => $load->course->nombre ?? 'N/A',
                                'nombre_grupo' => $load->academicGroup->nombre ?? 'N/A',
                                'cantidad_alumnos' => \App\Models\Enrollment::where('grupo_id', $load->grupo_id)
                                    ->where('ciclo_id', $activeCycle->id)
                                    ->where('estatus', 'active')
                                    ->count(),
                                'turno' => 'Turno Matutino',
                                'estatus' => 'pending',
                            ]);
                    }),
                    'teacherInfo' => Inertia::defer(fn() => [
                        'nombre' => auth()->user()->nombre_completo,
                        'especialidad' => \App\Models\Teacher::where('usuario_id', auth()->id())->first()->especialidad ?? 'General',
                        'email' => auth()->user()->email,
                    ]),
                    'isCycleActive' => (bool)$activeCycle
                ]);
            })->name('docente.dashboard');

            Route::get('/grupos', function () {
                return Inertia::render('Docente/Grupos/Index');
            })->name('docente.grupos.index');

            Route::get('/grupos/show', [App\Http\Controllers\DocenteClassroomController::class, 'show'])->name('docente.grupos.show');

            Route::get('/clases/{uuid}/full-data', [App\Http\Controllers\DocenteClassroomController::class, 'getFullData']);
            Route::get('/clases/{uuid}/config', [App\Http\Controllers\DocenteClassroomController::class, 'getConfig']);
            Route::post('/clases/{uuid}/theme', [App\Http\Controllers\DocenteClassroomController::class, 'updateTheme'])->name('docente.clases.update_theme');

            Route::middleware('captura.abierta')->group(function() {
                Route::post('/clases/{uuid}/criterios', [App\Http\Controllers\DocenteClassroomController::class, 'saveCriterios']);
                Route::post('/clases/{uuid}/calificaciones', [App\Http\Controllers\DocenteClassroomController::class, 'saveCalificaciones']);
                Route::post('/clases/{uuid}/tareas', [App\Http\Controllers\DocenteClassroomController::class, 'saveTareas']);
                Route::post('/clases/{uuid}/return-grade', [App\Http\Controllers\DocenteClassroomController::class, 'returnGrade']);
                Route::post('/clases/{uuid}/conclude', [App\Http\Controllers\DocenteClassroomController::class, 'concludeParcial'])->name('docente.clases.conclude');
            });

            Route::get('/clases/{uuid}/tareas', [App\Http\Controllers\DocenteClassroomController::class, 'getTareas']);
        });

        // ------------------------------------------
        // Módulo de Alumno
        // ------------------------------------------
        Route::prefix('alumno')->middleware('role:alumno')->group(function () {
            Route::get('/', function () {
                $studentId = auth()->id();
                $user = auth()->user();
                $activeCycle = \App\Models\AcademicPeriod::where('activo', true)->first();

                // [INTELIGENCIA v4.1] Mostrar inscripción activa más reciente (soporte para promociones)
                $enrollment = \App\Models\Enrollment::where('usuario_id', $studentId)
                    ->where('estatus', 'active')
                    ->with(['academicGroup.tutor.user', 'academicPeriod'])
                    ->orderBy('ciclo_id', 'desc')
                    ->first();

                    $cycleName = $enrollment?->academicPeriod?->nombre ?? 'Ciclo No Activo';
                    $fullCicloLabel = str_starts_with($cycleName, 'Ciclo') ? $cycleName : "Ciclo Escolar " . $cycleName;

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
                        'gpa' => '—', // Calculado en el cliente para velocidad instantánea
                        'tutor' => $enrollment?->academicGroup?->tutor?->user?->nombre_completo ?? 'Sin tutor',
                        'ciclo' => $fullCicloLabel,
                    ];

                return Inertia::render('Alumno/Dashboard', [
                    'studentInfo' => $studentInfo,
                    'kardex' => Inertia::defer(fn() => \App\Services\GradeService::getStudentKardex($studentId)),
                    'taskList' => Inertia::defer(fn() => \App\Services\GradeService::getStudentTasks($studentId)),
                    'alumnoGroups' => Inertia::defer(function() use ($studentId) {
                        $k = \App\Services\GradeService::getStudentKardex($studentId);
                        return array_map(fn($item) => [
                            'id' => $item['uuid'],
                            'nombre' => $item['subject'],
                            'docente' => $item['teacher'],
                            'description' => $item['description'] ?? '',
                            'color_tema' => $item['color_tema'] ?? 'blue'
                        ], $k);
                    }),
                    'isCycleActive' => (bool)$activeCycle
                ]);
            })->name('alumno.dashboard');

            Route::get('/materias', function () {
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
                ];

                return Inertia::render('Alumno/Dashboard', [
                    'defaultView' => 'tareas',
                    'studentInfo' => $studentInfo,
                    'kardex' => Inertia::defer(fn() => \App\Services\GradeService::getStudentKardex($studentId)),
                    'taskList' => Inertia::defer(fn() => \App\Services\GradeService::getStudentTasks($studentId)),
                    'alumnoGroups' => Inertia::defer(function() use ($studentId) {
                        $k = \App\Services\GradeService::getStudentKardex($studentId);
                        return array_map(fn($item) => [
                            'id' => $item['uuid'],
                            'nombre' => $item['subject'],
                            'docente' => $item['teacher'],
                            'description' => $item['description'] ?? '',
                            'color_tema' => $item['color_tema'] ?? 'blue'
                        ], $k);
                    }),
                    'isCycleActive' => (bool)$activeCycle
                ]);
            })->name('alumno.materias.index');

            Route::post('/tareas/entregar', [App\Http\Controllers\StudentClassroomController::class, 'submitTask'])->name('alumno.tareas.entregar');
            Route::post('/tareas/anular', [App\Http\Controllers\StudentClassroomController::class, 'cancelSubmission'])->name('alumno.tareas.anular');
        });

        Route::get('/perfil', [ProfileController::class, 'edit'])->name('perfil.edit');
        Route::patch('/perfil', [ProfileController::class, 'update'])->name('perfil.update');
        Route::delete('/perfil', [ProfileController::class, 'destroy'])->name('perfil.destroy');
    });
});

require __DIR__.'/auth.php';

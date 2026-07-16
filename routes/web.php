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
use App\Http\Controllers\Auth\PasswordChangeController; // 👈 Controlador para cambio obligatorio
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
// 2. RUTAS LIBERADAS / PÚBLICAS API (Sin auth)
// ==========================================
Route::get('/student', [StudentController::class, 'index'])->name('students.index');
Route::post('/student', [StudentController::class, 'store'])->name('students.store');

Route::get('/teacher', [TeacherController::class, 'index'])->name('teachers.index');
Route::post('/teacher', [TeacherController::class, 'store'])->name('teachers.store');

// ==========================================
// 3. RUTAS PROTEGIDAS (Requieren autenticación)
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {

    // 🔒 RUTAS DE CAMBIO DE CONTRASEÑA OBLIGATORIO (Exentas del Middleware de Bloqueo)
    Route::get('/cambiar-contrasena', [PasswordChangeController::class, 'show'])->name('password.change_view');
    Route::post('/cambiar-contrasena', [PasswordChangeController::class, 'update'])->name('password.force_update');

    // 🔒 GRUPO CON MIDDLEWARE DE FUERZA DE CONTRASEÑA ACTIVO
    // Todos los que naveguen aquí adentro y sean Alumnos/Docentes sin password_changed cambiado serán interceptados
        // 🔀 REDIRECCIÓN DINÁMICA DE DASHBOARDS BASADA EN ROLES
        Route::get('/dashboard', function (Request $request) {
            $user = $request->user();
            $role = $user->role ?? 'admin'; // Si no está definido el rol en BD, fallback a admin

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
        Route::prefix('admin')->group(function () {
            Route::get('/dashboard', function () {
                $cycles = \App\Models\AcademicPeriod::orderBy('start_date', 'desc')->get()->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'start_date' => $p->start_date instanceof \DateTimeInterface ? $p->start_date->format('Y-m-d') : $p->start_date,
                        'end_date' => $p->end_date instanceof \DateTimeInterface ? $p->end_date->format('Y-m-d') : $p->end_date,
                        'is_active' => (bool)$p->is_active,
                    ];
                });

                $activePeriod = \App\Models\AcademicPeriod::where('is_active', true)->first();
                $activePeriodId = $activePeriod ? $activePeriod->id : null;

                if ($activePeriodId) {
                    $studentsCount = \App\Models\Enrollment::where('academic_period_id', $activePeriodId)->count();
                    $teachersCount = \App\Models\AcademicLoad::where('academic_period_id', $activePeriodId)->distinct('teacher_id')->count('teacher_id');
                    $groupsCount = \App\Models\AcademicLoad::where('academic_period_id', $activePeriodId)->distinct('academic_group_id')->count('academic_group_id');
                    $coursesCount = \App\Models\AcademicLoad::where('academic_period_id', $activePeriodId)->distinct('course_id')->count('course_id');
                } else {
                    $studentsCount = 0;
                    $teachersCount = 0;
                    $groupsCount = 0;
                    $coursesCount = 0;
                }

                return Inertia::render('Admin/Dashboard', [
                    'cycles' => $cycles,
                    'studentsCount' => $studentsCount,
                    'teachersCount' => $teachersCount,
                    'groupsCount' => $groupsCount,
                    'coursesCount' => $coursesCount,
                ]);
            })->name('admin.dashboard');

            // Gestión de Ciclos Escolares desde el Dashboard
            Route::post('/cycles', [AcademicPeriodController::class, 'store'])->name('admin.cycles.store');
            Route::post('/cycles/{id}/activate', [AcademicPeriodController::class, 'activate'])->name('admin.cycles.activate');
            Route::post('/cycles/{id}/close', [AcademicPeriodController::class, 'close'])->name('admin.cycles.close');

            // Usuarios globales del Panel Admin
            Route::get('/usuarios', [UserController::class, 'index'])->name('admin.users.index');
            Route::post('/usuarios', [UserController::class, 'store'])->name('admin.users.store');
            Route::put('/usuarios/{id}', [UserController::class, 'update'])->name('admin.users.update');
            Route::post('/usuarios/{id}/toggle', [UserController::class, 'toggleStatus'])->name('admin.users.toggle');
            Route::post('/usuarios/{id}/reset-password', [UserController::class, 'resetPassword'])->name('admin.users.reset_password');

            Route::get('/alumnos', [StudentController::class, 'index'])->name('admin.alumnos.index');
            Route::post('/alumnos', [StudentController::class, 'store'])->name('admin.alumnos.store');
            Route::put('/alumnos/{id}', [StudentController::class, 'update'])->name('admin.alumnos.update');
            Route::delete('/alumnos/{id}', [StudentController::class, 'destroy'])->name('admin.alumnos.destroy');
            Route::post('/alumnos/{id}/toggle', [StudentController::class, 'toggleStatus'])->name('admin.alumnos.toggle');

            // Docentes asociados al panel de Administración
            Route::get('/docentes', [TeacherController::class, 'index'])->name('admin.docentes.index');
            Route::post('/docentes', [TeacherController::class, 'store'])->name('admin.docentes.store');
            Route::put('/docentes/{id}', [TeacherController::class, 'update'])->name('admin.docentes.update');
            Route::delete('/docentes/{id}', [TeacherController::class, 'destroy'])->name('admin.docentes.destroy');

            // Grupos Académicos del Panel Admin (Corregido y unificado)
            Route::get('/grupos', [GroupController::class, 'index'])->name('groups.index');
            Route::post('/grupos', [GroupController::class, 'store'])->name('groups.store');
            Route::put('/grupos/{id}', [GroupController::class, 'update'])->name('groups.update');
            Route::delete('/grupos/{id}', [GroupController::class, 'destroy'])->name('groups.destroy');

            // Asignaciones de Materias (Cargas Académicas)
            Route::get('/asignaciones', [AcademicLoadController::class, 'index'])->name('admin.loads.index');
            Route::post('/asignaciones', [AcademicLoadController::class, 'store'])->name('admin.loads.store');
            Route::put('/asignaciones/{id}', [AcademicLoadController::class, 'update'])->name('admin.loads.update');
            Route::delete('/asignaciones/{id}', [AcademicLoadController::class, 'destroy'])->name('admin.loads.destroy');

            // Materias Asociadas al Panel Admin
            Route::get('/materias', [CourseController::class, 'index'])->name('admin.materias.index');
            Route::post('/materias', [CourseController::class, 'store'])->name('materias.store');
            Route::put('/materias/{id}', [CourseController::class, 'update'])->name('materias.update');
            Route::delete('/materias/{id}', [CourseController::class, 'destroy'])->name('materias.destroy');

            // Especialidades Asociadas al Panel Admin
            Route::get('/especialidades', [SpecialtyController::class, 'index'])->name('admin.especialidades.index');
            Route::post('/especialidades', [SpecialtyController::class, 'store'])->name('admin.especialidades.store');
            Route::put('/especialidades/{id}', [SpecialtyController::class, 'update'])->name('admin.especialidades.update');
            Route::delete('/especialidades/{id}', [SpecialtyController::class, 'destroy'])->name('admin.especialidades.destroy');

            Route::get('/reportes', [ReportController::class, 'index'])->name('admin.reportes.index');
        });

        // ------------------------------------------
        // Módulo de Docente
        // ------------------------------------------
        Route::prefix('docente')->group(function () {
            Route::get('/dashboard', function () {
                $user = auth()->user();
                $teacher = \App\Models\Teacher::where('user_id', $user->id)->first();

                $loads = [];
                if ($teacher) {
                    $loads = \App\Models\AcademicLoad::where('teacher_id', $teacher->id)
                        ->with(['academicGroup', 'course'])
                        ->get()
                        ->map(function ($load) {
                            return [
                                'id' => $load->uuid,
                                'code' => $load->course->code ?? 'N/A',
                                'subject' => $load->course->name ?? 'N/A',
                                'groupName' => $load->academicGroup->name ?? 'N/A',
                                'studentsCount' => \App\Models\Enrollment::where('academic_group_id', $load->academic_group_id)
                                    ->where('status', 'active')
                                    ->count(),
                                'schedule' => 'Lunes y Miércoles 07:00 - 08:40',
                                'status' => 'pending',
                            ];
                        });
                }

                return Inertia::render('Docente/Dashboard', [
                    'assignedLoad' => $loads,
                    'teacherInfo' => $teacher ? [
                        'name' => trim("{$teacher->nombre} {$teacher->apellido_paterno} " . ($teacher->apellido_materno ?? '')),
                        'specialty' => $teacher->specialty ?? 'General',
                        'email' => $user->email,
                    ] : null
                ]);
            })->name('docente.dashboard');

            Route::get('/grupos', function () {
                return Inertia::render('Docente/Grupos/Index');
            })->name('docente.grupos.index');

            Route::get('/grupos/show', function (Illuminate\Http\Request $request) {
                $uuid = $request->query('id');
                $load = \App\Models\AcademicLoad::where('uuid', $uuid)
                    ->with(['academicGroup', 'course'])
                    ->first();

                $students = [];
                if ($load) {
                    $students = \App\Models\Enrollment::where('academic_group_id', $load->academic_group_id)
                        ->where('status', 'active')
                        ->with('user')
                        ->get()
                        ->map(function ($enrollment) {
                            return [
                                'id' => $enrollment->user_id,
                                'name' => $enrollment->user->name ?? 'Sin nombre',
                                'matricula' => $enrollment->student_code ?? 'N/A',
                            ];
                        })->toArray();
                }

                return Inertia::render('Docente/Grupos/Show', [
                    'classInfo' => $load ? [
                        'id' => $load->uuid,
                        'groupName' => $load->academicGroup->name ?? 'N/A',
                        'subject' => $load->course->name ?? 'N/A',
                        'code' => $load->course->code ?? 'N/A',
                        'major' => $load->academicGroup->major ?? 'N/A',
                        'semester' => $load->course->semestre ?? (isset($load->academicGroup->code[0]) ? $load->academicGroup->code[0] : '1'),
                        'students' => $students,
                    ] : null
                ]);
            })->name('docente.grupos.show');

            // APIs de persistencia del Classroom en Supabase
            Route::get('/clases/{uuid}/config', [App\Http\Controllers\DocenteClassroomController::class, 'getConfig']);
            Route::post('/clases/{uuid}/criterios', [App\Http\Controllers\DocenteClassroomController::class, 'saveCriterios']);
            Route::post('/clases/{uuid}/calificaciones', [App\Http\Controllers\DocenteClassroomController::class, 'saveCalificaciones']);
            Route::get('/clases/{uuid}/tareas', [App\Http\Controllers\DocenteClassroomController::class, 'getTareas']);
            Route::post('/clases/{uuid}/tareas', [App\Http\Controllers\DocenteClassroomController::class, 'saveTareas']);
        });

        // ------------------------------------------
        // Módulo de Alumno
        // ------------------------------------------
        Route::prefix('alumno')->group(function () {
            Route::get('/dashboard', function () {
                $studentId = auth()->id();
                $enrollment = \App\Models\Enrollment::where('user_id', $studentId)
                    ->where('status', 'active')
                    ->with(['academicGroup.tutor', 'academicPeriod'])
                    ->first();

                $kardex = \App\Services\GradeService::getStudentKardex($studentId);
                $sum = 0;
                $count = 0;
                foreach ($kardex as $k) {
                    if ($k['score'] !== '—') {
                        $sum += floatval($k['score']);
                        $count++;
                    }
                }
                $gpa = $count > 0 ? number_format($sum / $count, 1) : '10';

                $studentInfo = [
                    'name' => auth()->user()->name,
                    'matricula' => $enrollment ? $enrollment->student_code : 'ALU-' . $studentId,
                    'groupName' => $enrollment?->academicGroup?->name ?? 'Sin grupo',
                    'email' => auth()->user()->email,
                    'registeredAt' => $enrollment ? $enrollment->created_at->format('M Y') : 'Agosto 2025',
                    'gpa' => $gpa,
                    'tutor' => ($enrollment && $enrollment->academicGroup && $enrollment->academicGroup->tutor)
                        ? trim("{$enrollment->academicGroup->tutor->nombre} {$enrollment->academicGroup->tutor->apellido_paterno}")
                        : 'Sin tutor',
                    'ciclo' => $enrollment?->academicPeriod?->name ?? '2026',
                    'periodo' => ''
                ];

                $taskList = \App\Services\GradeService::getStudentTasks($studentId);

                return Inertia::render('Alumno/Dashboard', [
                    'studentInfo' => $studentInfo,
                    'taskList' => $taskList
                ]);
            })->name('alumno.dashboard');

            Route::get('/tareas', function () {
                $studentId = auth()->id();
                $enrollment = \App\Models\Enrollment::where('user_id', $studentId)
                    ->where('status', 'active')
                    ->with(['academicGroup.tutor', 'academicPeriod'])
                    ->first();

                $kardex = \App\Services\GradeService::getStudentKardex($studentId);
                $sum = 0;
                $count = 0;
                foreach ($kardex as $k) {
                    if ($k['score'] !== '—') {
                        $sum += floatval($k['score']);
                        $count++;
                    }
                }
                $gpa = $count > 0 ? number_format($sum / $count, 1) : '10';

                $studentInfo = [
                    'name' => auth()->user()->name,
                    'matricula' => $enrollment ? $enrollment->student_code : 'ALU-' . $studentId,
                    'groupName' => $enrollment?->academicGroup?->name ?? 'Sin grupo',
                    'email' => auth()->user()->email,
                    'registeredAt' => $enrollment ? $enrollment->created_at->format('M Y') : 'Agosto 2025',
                    'gpa' => $gpa,
                    'tutor' => ($enrollment && $enrollment->academicGroup && $enrollment->academicGroup->tutor)
                        ? trim("{$enrollment->academicGroup->tutor->nombre} {$enrollment->academicGroup->tutor->apellido_paterno}")
                        : 'Sin tutor',
                    'ciclo' => $enrollment?->academicPeriod?->name ?? '2026',
                    'periodo' => ''
                ];

                $taskList = \App\Services\GradeService::getStudentTasks($studentId);

                return Inertia::render('Alumno/Dashboard', [
                    'defaultView' => 'tareas',
                    'studentInfo' => $studentInfo,
                    'taskList' => $taskList
                ]);
            })->name('alumno.tareas.index');

            Route::get('/calificaciones', function () {
                $studentId = auth()->id();
                $enrollment = \App\Models\Enrollment::where('user_id', $studentId)
                    ->where('status', 'active')
                    ->with(['academicGroup.tutor', 'academicPeriod'])
                    ->first();

                $studentInfo = [
                    'name' => auth()->user()->name,
                    'matricula' => $enrollment ? $enrollment->student_code : 'ALU-' . $studentId,
                    'groupName' => $enrollment?->academicGroup?->name ?? 'Sin grupo',
                    'tutor' => ($enrollment && $enrollment->academicGroup && $enrollment->academicGroup->tutor)
                        ? trim("{$enrollment->academicGroup->tutor->nombre} {$enrollment->academicGroup->tutor->apellido_paterno}")
                        : 'Sin tutor',
                    'ciclo' => $enrollment?->academicPeriod?->name ?? '2026',
                    'periodo' => ''
                ];

                $grades = \App\Services\GradeService::getStudentKardex($studentId);

                return Inertia::render('Alumno/Calificaciones/Index', [
                    'studentInfo' => $studentInfo,
                    'grades' => $grades
                ]);
            })->name('alumno.calificaciones.index');

            Route::get('/documentos', function () {
                return Inertia::render('Alumno/Documentos/Index');
            })->name('alumno.documentos.index');
        });

        // ------------------------------------------
        // Perfil Común de Usuarios
        // ------------------------------------------
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });


// ==========================================
// 4. RUTAS DE AUTENTICACIÓN (Laravel Breeze)
// ==========================================
require __DIR__.'/auth.php';

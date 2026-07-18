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
// 2. RUTAS LIBERADAS / PÚBLICAS API
// ==========================================
Route::get('/student', [StudentController::class, 'index'])->name('students.index');
Route::post('/student', [StudentController::class, 'store'])->name('students.store');

Route::get('/teacher', [TeacherController::class, 'index'])->name('teachers.index');
Route::post('/teacher', [TeacherController::class, 'store'])->name('teachers.store');

// ==========================================
// 3. RUTAS PROTEGIDAS
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/cambiar-contrasena', [PasswordChangeController::class, 'show'])->name('password.change_view');
    Route::post('/cambiar-contrasena', [PasswordChangeController::class, 'update'])->name('password.force_update');

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
        Route::prefix('admin')->group(function () {
            Route::get('/dashboard', function () {
                $cycles = \App\Models\AcademicPeriod::orderBy('fecha_inicio', 'desc')->get()->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'nombre' => $p->nombre,
                        'fecha_inicio' => $p->fecha_inicio instanceof \DateTimeInterface ? $p->fecha_inicio->format('Y-m-d') : $p->fecha_inicio,
                        'fecha_fin' => $p->fecha_fin instanceof \DateTimeInterface ? $p->fecha_fin->format('Y-m-d') : $p->fecha_fin,
                        'activo' => (bool)$p->activo,
                    ];
                });

                $activePeriod = \App\Models\AcademicPeriod::where('activo', true)->first();
                $activePeriodId = $activePeriod ? $activePeriod->id : null;

                if ($activePeriodId) {
                    $studentsCount = \App\Models\Enrollment::where('ciclo_id', $activePeriodId)->count();
                    $teachersCount = \App\Models\AcademicLoad::where('ciclo_id', $activePeriodId)->distinct('docente_id')->count('docente_id');
                    $groupsCount = \App\Models\AcademicLoad::where('ciclo_id', $activePeriodId)->distinct('grupo_id')->count('grupo_id');
                    $coursesCount = \App\Models\AcademicLoad::where('ciclo_id', $activePeriodId)->distinct('materia_id')->count('materia_id');
                } else {
                    $studentsCount = 0; $teachersCount = 0; $groupsCount = 0; $coursesCount = 0;
                }

                return Inertia::render('Admin/Dashboard', [
                    'cycles' => $cycles,
                    'studentsCount' => $studentsCount,
                    'teachersCount' => $teachersCount,
                    'groupsCount' => $groupsCount,
                    'coursesCount' => $coursesCount,
                ]);
            })->name('admin.dashboard');

            Route::post('/cycles', [AcademicPeriodController::class, 'store'])->name('admin.cycles.store');
            Route::post('/cycles/{id}/activate', [AcademicPeriodController::class, 'activate'])->name('admin.cycles.activate');
            Route::post('/cycles/{id}/close', [AcademicPeriodController::class, 'close'])->name('admin.cycles.close');

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

            Route::get('/reportes', [ReportController::class, 'index'])->name('admin.reportes.index');
        });

        // ------------------------------------------
        // Módulo de Docente
        // ------------------------------------------
        Route::prefix('docente')->group(function () {
            Route::get('/dashboard', function () {
                $user = auth()->user();
                $teacher = \App\Models\Teacher::where('usuario_id', $user->id)->first();

                $loads = [];
                if ($teacher) {
                    $loads = \App\Models\AcademicLoad::where('docente_id', $teacher->id)
                        ->with(['academicGroup', 'course'])
                        ->get()
                        ->map(function ($load) {
                            return [
                                'id' => $load->uuid,
                                'codigo' => $load->course->codigo ?? 'N/A',
                                'nombre_materia' => $load->course->nombre ?? 'N/A',
                                'nombre_grupo' => $load->academicGroup->nombre ?? 'N/A',
                                'cantidad_alumnos' => \App\Models\Enrollment::where('grupo_id', $load->grupo_id)
                                    ->where('estatus', 'active')
                                    ->count(),
                                'turno' => 'Turno Matutino',
                                'estatus' => 'pending',
                            ];
                        });
                }

                return Inertia::render('Docente/Dashboard', [
                    'assignedLoad' => $loads,
                    'teacherInfo' => $teacher ? [
                        'nombre' => ($teacher && $teacher->user) ? $teacher->user->nombre_completo : 'Docente',
                        'especialidad' => $teacher->especialidad ?? 'General',
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
                    $students = \App\Models\Enrollment::where('grupo_id', $load->grupo_id)
                        ->where('estatus', 'active')
                        ->with('user')
                        ->get()
                        ->map(function ($enrollment) {
                            return [
                                'id' => $enrollment->usuario_id,
                                'nombre' => $enrollment->user->nombre ?? 'Sin nombre',
                                'matricula' => $enrollment->codigo_alumno ?? 'N/A',
                            ];
                        })->toArray();
                }

                return Inertia::render('Docente/Grupos/Show', [
                    'classInfo' => $load ? [
                        'id' => $load->uuid,
                        'nombre_grupo' => $load->academicGroup->nombre ?? 'N/A',
                        'nombre_materia' => $load->course->nombre ?? 'N/A',
                        'codigo_materia' => $load->course->codigo ?? 'N/A',
                        'especialidad' => $load->academicGroup->especialidad ?? 'N/A',
                        'semestre' => $load->course->semestre ?? 1,
                        'alumnos' => $students,
                    ] : null
                ]);
            })->name('docente.grupos.show');

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
                $enrollment = \App\Models\Enrollment::where('usuario_id', $studentId)
                    ->where('estatus', 'active')
                    ->with(['academicGroup.tutor', 'academicPeriod'])
                    ->first();

                $kardex = \App\Services\GradeService::getStudentKardex($studentId);
                $sum = 0; $count = 0;
                foreach ($kardex as $k) {
                    if ($k['score'] !== '—') {
                        $sum += floatval($k['score']);
                        $count++;
                    }
                }
                $gpa = $count > 0 ? \App\Services\GradeService::formatGrade($sum / $count) : '—';

                $studentInfo = [
                    'name' => auth()->user()->nombre,
                    'matricula' => $enrollment ? $enrollment->codigo_alumno : 'ALU-' . $studentId,
                    'groupName' => $enrollment?->academicGroup?->nombre ?? 'Sin grupo',
                    'email' => auth()->user()->email,
                    'registeredAt' => $enrollment ? $enrollment->created_at->format('M Y') : 'Agosto 2025',
                    'gpa' => $gpa,
                    'tutor' => ($enrollment && $enrollment->academicGroup && $enrollment->academicGroup->tutor)
                        ? trim("{$enrollment->academicGroup->tutor->nombre} {$enrollment->academicGroup->tutor->apellido_paterno}")
                        : 'Sin tutor',
                    'ciclo' => $enrollment?->academicPeriod?->nombre ?? '2026',
                ];

                $taskList = \App\Services\GradeService::getStudentTasks($studentId);

                $alumnoGroups = array_map(function($item) {
                    return [
                        'id' => $item['uuid'],
                        'name' => $item['subject'],
                        'teacher' => $item['teacher'],
                        'description' => 'Materia inscrita en el ciclo actual.'
                    ];
                }, $kardex);

                return Inertia::render('Alumno/Dashboard', [
                    'studentInfo' => $studentInfo,
                    'taskList' => $taskList,
                    'kardex' => $kardex,
                    'alumnoGroups' => $alumnoGroups
                ]);
            })->name('alumno.dashboard');

            Route::get('/materias', function () {
                $studentId = auth()->id();
                $enrollment = \App\Models\Enrollment::where('usuario_id', $studentId)
                    ->where('estatus', 'active')
                    ->with(['academicGroup.tutor', 'academicPeriod'])
                    ->first();

                $kardex = \App\Services\GradeService::getStudentKardex($studentId);
                $sum = 0; $count = 0;
                foreach ($kardex as $k) {
                    if ($k['score'] !== '—') {
                        $sum += floatval($k['score']);
                        $count++;
                    }
                }
                $gpa = $count > 0 ? \App\Services\GradeService::formatGrade($sum / $count) : '—';

                $studentInfo = [
                    'name' => auth()->user()->nombre,
                    'matricula' => $enrollment ? $enrollment->codigo_alumno : 'ALU-' . $studentId,
                    'groupName' => $enrollment?->academicGroup?->nombre ?? 'Sin grupo',
                    'email' => auth()->user()->email,
                    'registeredAt' => $enrollment ? $enrollment->created_at->format('M Y') : 'Agosto 2025',
                    'gpa' => $gpa,
                    'tutor' => ($enrollment && $enrollment->academicGroup && $enrollment->academicGroup->tutor)
                        ? trim("{$enrollment->academicGroup->tutor->nombre} {$enrollment->academicGroup->tutor->apellido_paterno}")
                        : 'Sin tutor',
                    'ciclo' => $enrollment?->academicPeriod?->nombre ?? '2026',
                ];

                $taskList = \App\Services\GradeService::getStudentTasks($studentId);

                $alumnoGroups = array_map(function($item) {
                    return [
                        'id' => $item['uuid'],
                        'name' => $item['subject'],
                        'teacher' => $item['teacher'],
                        'description' => 'Materia inscrita en el ciclo actual.'
                    ];
                }, $kardex);

                return Inertia::render('Alumno/Dashboard', [
                    'defaultView' => 'tareas',
                    'studentInfo' => $studentInfo,
                    'taskList' => $taskList,
                    'kardex' => $kardex,
                    'alumnoGroups' => $alumnoGroups
                ]);
            })->name('alumno.materias.index');

            Route::get('/calificaciones', function () {
                $studentId = auth()->id();
                $enrollment = \App\Models\Enrollment::where('usuario_id', $studentId)
                    ->where('estatus', 'active')
                    ->with(['academicGroup.tutor', 'academicPeriod'])
                    ->first();

                $studentInfo = [
                    'name' => auth()->user()->nombre,
                    'matricula' => $enrollment ? $enrollment->codigo_alumno : 'ALU-' . $studentId,
                    'groupName' => $enrollment?->academicGroup?->nombre ?? 'Sin grupo',
                    'tutor' => ($enrollment && $enrollment->academicGroup && $enrollment->academicGroup->tutor)
                        ? trim("{$enrollment->academicGroup->tutor->nombre} {$enrollment->academicGroup->tutor->apellido_paterno}")
                        : 'Sin tutor',
                    'ciclo' => $enrollment?->academicPeriod?->nombre ?? '2026',
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

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

require __DIR__.'/auth.php';

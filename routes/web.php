<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\AcademicController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\GradingController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GroupController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Vistas Públicas
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 2. Ruta de pruebas (Liberada)
Route::get('/student', function () {
    return view('student');
});

// 3. RUTAS LIBERADAS (Sin middleware 'auth')
Route::post('/academic/periods', [AcademicController::class, 'storePeriod'])->name('academic.periods.store');
Route::post('/academic/courses', [AcademicController::class, 'storeCourse'])->name('academic.courses.store');
Route::post('/enrollments', [EnrollmentController::class, 'store'])->name('enrollments.store');
Route::post('/grades/assign', [GradingController::class, 'updateOrCreate'])->name('grades.assign');
Route::get('/finance/student/{userId}', [FinanceController::class, 'studentInvoices'])->name('finance.student');
Route::patch('/finance/invoice/{id}/pay', [FinanceController::class, 'pay'])->name('finance.pay');

// 4. RUTAS PROTEGIDAS (Requieren autenticación)
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Redirección dinámica basada en rol (si el rol no existe, por defecto es admin)
    Route::get('/dashboard', function (Illuminate\Http\Request $request) {
        $user = $request->user();
        $role = $user->role ?? 'admin'; // Fallback a admin si no está definido el rol en BD
        
        if ($role === 'docente') {
            return redirect()->route('docente.dashboard');
        } elseif ($role === 'alumno') {
            return redirect()->route('alumno.dashboard');
        }
        
        return redirect()->route('admin.dashboard');
    })->name('dashboard');

    // Módulo de Administración (Admin)
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('admin.dashboard');

        Route::get('/users', function () {
            return Inertia::render('Admin/Users/Index');
        })->name('admin.users.index');

        // Alumnos (Usa su controlador)
        Route::get('/alumnos', [StudentController::class, 'index'])->name('admin.alumnos.index');
        Route::post('/alumnos', [StudentController::class, 'store'])->name('admin.alumnos.store');
        Route::put('/alumnos/{id}', [StudentController::class, 'update'])->name('admin.alumnos.update');
        Route::post('/alumnos/{id}/toggle', [StudentController::class, 'toggleStatus'])->name('admin.alumnos.toggle');

        // Docentes (Usa su controlador)
        Route::get('/docentes', [TeacherController::class, 'index'])->name('admin.docentes.index');
        Route::post('/docentes', [TeacherController::class, 'store'])->name('admin.docentes.store');

        // Grupos (Usa su controlador)
        Route::get('/grupos', [GroupController::class, 'index'])->name('admin.grupos.index');
        Route::post('/grupos', [GroupController::class, 'store'])->name('groups.store');
        Route::put('/grupos/{id}', [GroupController::class, 'update'])->name('groups.update');

        // Materias (Usa su controlador)
        Route::get('/materias', [CourseController::class, 'index'])->name('admin.materias.index');
        Route::post('/materias', [CourseController::class, 'store'])->name('materias.store');
        Route::put('/materias/{id}', [CourseController::class, 'update'])->name('materias.update');
        Route::delete('/materias/{id}', [CourseController::class, 'destroy'])->name('materias.destroy');

        Route::get('/reportes', function () {
            return Inertia::render('Admin/Reportes/Index');
        })->name('admin.reportes.index');
    });

    // Módulo de Docente
    Route::prefix('docente')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Docente/Dashboard');
        })->name('docente.dashboard');

        Route::get('/grupos/show', function () {
            return Inertia::render('Docente/Grupos/Show');
        })->name('docente.grupos.show');
    });

    // Módulo de Alumno
    Route::prefix('alumno')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Alumno/Dashboard');
        })->name('alumno.dashboard');

        Route::get('/calificaciones', function () {
            return Inertia::render('Alumno/Calificaciones/Index');
        })->name('alumno.calificaciones.index');

        Route::get('/documentos', function () {
            return Inertia::render('Alumno/Documentos/Index');
        })->name('alumno.documentos.index');
    });

    // Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// 5. Rutas de Autenticación
require __DIR__.'/auth.php';
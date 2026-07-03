<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\AcademicController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\GradingController;
use App\Http\Controllers\FinanceController;
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

        Route::get('/alumnos', function () {
            return Inertia::render('Admin/Alumnos/Index');
        })->name('admin.alumnos.index');

        Route::get('/docentes', function () {
            return Inertia::render('Admin/Docentes/Index');
        })->name('admin.docentes.index');

        Route::get('/grupos', function () {
            return Inertia::render('Admin/Grupos/Index');
        })->name('admin.grupos.index');

        Route::get('/materias', function () {
            return Inertia::render('Admin/Materias/Index');
        })->name('admin.materias.index');

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
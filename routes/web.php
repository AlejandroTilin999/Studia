<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController; // Asegúrate de tener esta importación
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

// 3. RUTAS LIBERADAS (Sin middleware 'auth')
Route::get('/student', [StudentController::class, 'index'])->name('students.index');
Route::post('/student', [StudentController::class, 'store'])->name('students.store');

Route::get('/teacher', [TeacherController::class, 'index'])->name('teachers.index');
Route::post('/teacher', [TeacherController::class, 'store'])->name('teachers.store');

// 🛠️ MATERIAS CORREGIDO: Nombres de ruta unificados para coincidir con React y Ziggy
Route::get('/materias', [CourseController::class, 'index'])->name('materias.index');
Route::post('/materias', [CourseController::class, 'store'])->name('materias.store');
Route::put('/materias/{id}', [CourseController::class, 'update'])->name('materias.update');
Route::delete('/materias/{id}', [CourseController::class, 'destroy'])->name('materias.destroy');

Route::get('/group', [GroupController::class, 'index'])->name('groups.index');

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

        Route::get('/alumnos', [StudentController::class, 'index'])->name('admin.alumnos.index');
        Route::post('/alumnos', [StudentController::class, 'store'])->name('admin.alumnos.store');
        Route::put('/alumnos/{id}', [StudentController::class, 'update'])->name('admin.alumnos.update');
        Route::post('/alumnos/{id}/toggle', [StudentController::class, 'toggleStatus'])->name('admin.alumnos.toggle');

        Route::get('/users', function () {
            return Inertia::render('Admin/Users/Index');
        })->name('admin.users.index');

        // Alumnos (Usa su controlador)
        Route::get('/alumnos', [StudentController::class, 'index'])->name('admin.alumnos.index');

        // PROFESORES: Control otorgado al TeacherController en la ruta de administración
        Route::get('/docentes', [TeacherController::class, 'index'])->name('admin.docentes.index');
        Route::post('/docentes', [TeacherController::class, 'store'])->name('admin.docentes.store');

        Route::get('/grupos', function () {
            return Inertia::render('Admin/Grupos/Index');
        })->name('admin.grupos.index');

        // Redirección opcional o puedes dejar esta ruta apuntando también al index si lo usas dentro de /admin/materias
        Route::get('/materias', [CourseController::class, 'index'])->name('admin.materias.index');
        Route::get('/grupos', [GroupController::class, 'index'])->name('groups.index');
Route::post('/grupos', [GroupController::class, 'store'])->name('groups.store');
Route::put('/grupos/{id}', [GroupController::class, 'update'])->name('groups.update');

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
    // Se corrigieron los nombres de clase faltantes usando la variable directa o el controlador importado arriba
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// 5. Rutas de Autenticación
require __DIR__.'/auth.php';
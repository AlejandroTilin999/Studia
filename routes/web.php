<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
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

    Route::middleware(['force.password.change'])->group(function () {

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
                return Inertia::render('Admin/Dashboard');
            })->name('admin.dashboard');

            // Usuarios / Alumnos globales del Panel Admin
            Route::get('/users', function () {
                return Inertia::render('Admin/Users/Index');
            })->name('admin.users.index');

            Route::get('/alumnos', [StudentController::class, 'index'])->name('admin.alumnos.index');
            Route::post('/alumnos', [StudentController::class, 'store'])->name('admin.alumnos.store');
            Route::put('/alumnos/{id}', [StudentController::class, 'update'])->name('admin.alumnos.update');
            Route::post('/alumnos/{id}/toggle', [StudentController::class, 'toggleStatus'])->name('admin.alumnos.toggle');

            // Docentes asociados al panel de Administración
            Route::get('/docentes', [TeacherController::class, 'index'])->name('admin.docentes.index');
            Route::post('/docentes', [TeacherController::class, 'store'])->name('admin.docentes.store');
            Route::put('/docentes/{teacher}', [TeacherController::class, 'update'])->name('admin.docentes.update');

            // Grupos Académicos del Panel Admin (Corregido y unificado)
            Route::get('/grupos', [GroupController::class, 'index'])->name('groups.index');
            Route::post('/grupos', [GroupController::class, 'store'])->name('groups.store');
            Route::put('/grupos/{id}', [GroupController::class, 'update'])->name('groups.update');

            // Materias Asociadas al Panel Admin
            Route::get('/materias', [CourseController::class, 'index'])->name('admin.materias.index');
            Route::post('/materias', [CourseController::class, 'store'])->name('materias.store');
            Route::put('/materias/{id}', [CourseController::class, 'update'])->name('materias.update');
            Route::delete('/materias/{id}', [CourseController::class, 'destroy'])->name('materias.destroy');

            Route::get('/reportes', function () {
                return Inertia::render('Admin/Reportes/Index');
            })->name('admin.reportes.index');
        });

        // ------------------------------------------
        // Módulo de Docente
        // ------------------------------------------
        Route::prefix('docente')->group(function () {
            Route::get('/dashboard', function () {
                return Inertia::render('Docente/Dashboard');
            })->name('docente.dashboard');

            Route::get('/grupos/show', function () {
                return Inertia::render('Docente/Grupos/Show');
            })->name('docente.grupos.show');
        });

        // ------------------------------------------
        // Módulo de Alumno
        // ------------------------------------------
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

        // ------------------------------------------
        // Perfil Común de Usuarios
        // ------------------------------------------
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
        });
    });


// ==========================================
// 4. RUTAS DE AUTENTICACIÓN (Laravel Breeze)
// ==========================================
require __DIR__.'/auth.php';
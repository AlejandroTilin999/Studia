<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AcademicController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\GradingController;
use App\Http\Controllers\FinanceController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-bench', function () {
    return view('test-bench');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // Inscripciones
    Route::post('/enrollments', [EnrollmentController::class, 'store'])->name('enrollments.store');

    // Calificaciones
    Route::post('/grades/assign', [GradingController::class, 'updateOrCreate'])->name('grades.assign');

    // Control de pagos / Finanzas
    Route::get('/finance/student/{userId}', [FinanceController::class, 'studentInvoices'])->name('finance.student');
    Route::patch('/finance/invoice/{id}/pay', [FinanceController::class, 'pay'])->name('finance.pay');
    Route::post('/academic/periods', [AcademicController::class, 'storePeriod'])->name('academic.periods.store');
    Route::post('/academic/courses', [AcademicController::class, 'storeCourse'])->name('academic.courses.store');
});

require __DIR__.'/auth.php';

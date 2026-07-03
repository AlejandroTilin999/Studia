<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentApiController;
use App\Http\Controllers\Api\TeacherApiController;
use App\Http\Controllers\Api\CourseApiController;
use App\Http\Controllers\Api\GroupApiController;

Route::get('/students', [StudentApiController::class, 'index']);
Route::post('/students', [StudentApiController::class, 'store']);

Route::get('/teachers', [TeacherApiController::class, 'index']);
Route::post('/teachers', [TeacherApiController::class, 'store']);

Route::get('/courses', [CourseApiController::class, 'index']);
Route::post('/courses', [CourseApiController::class, 'store']);

Route::get('/groups', [GroupApiController::class, 'index']);
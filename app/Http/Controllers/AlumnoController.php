<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Inertia\Inertia;

class AlumnoController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => []
        ]);
    }
}
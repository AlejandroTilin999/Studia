<?php

namespace App\Http\Controllers;

use App\Models\AcademicGroup;
use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        // 1. Obtener grupos
        $groups = AcademicGroup::all()->map(function ($g) {
            return [
                'id' => $g->id,
                'name' => $g->name,
            ];
        });

        // 2. Obtener alumnos inscritos con sus datos
        $students = Enrollment::with('user')->get()->map(function ($e) {
            return [
                'matricula' => $e->student_code,
                'name' => $e->user->name ?? 'Sin nombre',
                'group_id' => $e->academic_group_id,
            ];
        });

        // 3. Obtener periodos (ciclos escolares)
        $periods = AcademicPeriod::orderBy('start_date', 'desc')->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
            ];
        });

        return Inertia::render('Admin/Reportes/Index', [
            'groups' => $groups,
            'students' => $students,
            'periods' => $periods,
        ]);
    }
}

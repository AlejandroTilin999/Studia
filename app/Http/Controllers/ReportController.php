<?php

namespace App\Http\Controllers;

use App\Models\AcademicGroup;
use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        // 1. Obtener grupos (Español)
        $groups = AcademicGroup::all()->map(function ($g) {
            return [
                'id' => $g->id,
                'nombre' => $g->nombre,
            ];
        });

        // 2. Obtener alumnos inscritos con sus datos (Español)
        $students = Enrollment::with('user')->get()->map(function ($e) {
            return [
                'matricula' => $e->codigo_alumno,
                'nombre' => $e->user?->nombre_completo ?? 'Sin nombre',
                'grupo_id' => $e->grupo_id,
            ];
        });

        // 3. Obtener periodos (ciclos escolares) (Español)
        $periods = AcademicPeriod::orderBy('fecha_inicio', 'desc')->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'nombre' => $p->nombre,
            ];
        });

        return Inertia::render('Admin/Reportes/Index', [
            'groups' => $groups,
            'students' => $students,
            'periods' => $periods,
        ]);
    }
}

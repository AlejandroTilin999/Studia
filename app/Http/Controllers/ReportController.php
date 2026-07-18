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
        return Inertia::render('Admin/Reportes/Index', [
            'groups' => Inertia::defer(function () {
                return AcademicGroup::all()->map(function ($g) {
                    return [
                        'id' => $g->id,
                        'nombre' => $g->nombre,
                    ];
                });
            }),
            'students' => Inertia::defer(function () {
                return Enrollment::with('user')->get()->map(function ($e) {
                    return [
                        'matricula' => $e->codigo_alumno,
                        'nombre' => $e->user?->nombre_completo ?? 'Sin nombre',
                        'grupo_id' => $e->grupo_id,
                    ];
                });
            }),
            'periods' => Inertia::defer(function () {
                return AcademicPeriod::orderBy('fecha_inicio', 'desc')->get()->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'nombre' => $p->nombre,
                    ];
                });
            })
        ]);
    }
}

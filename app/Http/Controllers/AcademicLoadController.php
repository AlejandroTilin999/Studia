<?php

namespace App\Http\Controllers;

use App\Models\AcademicLoad;
use App\Models\AcademicPeriod;
use App\Models\AcademicGroup;
use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicLoadController extends Controller
{
    public function index()
    {
        // 1. Obtener todas las cargas académicas (asignaciones)
        $loads = AcademicLoad::with(['academicPeriod', 'academicGroup', 'course', 'teacher.user'])->get()->map(function ($l) {
            return [
                'id' => $l->id,
                'ciclo_id' => $l->ciclo_id,
                'nombre_ciclo' => $l->academicPeriod->nombre ?? 'N/A',
                'grupo_id' => $l->grupo_id,
                'nombre_grupo' => $l->academicGroup->nombre ?? 'N/A',
                'codigo_grupo' => $l->academicGroup->codigo ?? 'N/A',
                'materia_id' => $l->materia_id,
                'nombre_materia' => $l->course->nombre ?? 'N/A',
                'codigo_materia' => $l->course->codigo ?? 'N/A',
                'docente_id' => $l->docente_id,
                'nombre_docente' => ($l->teacher && $l->teacher->user) ? $l->teacher->user->nombre_completo : 'Sin docente',
            ];
        });

        // 2. Obtener catálogos
        $periods = AcademicPeriod::all()->map(function ($p) {
            return [
                'id' => $p->id,
                'nombre' => $p->nombre,
                'activo' => (bool)$p->activo,
            ];
        });

        $groups = AcademicGroup::all()->map(function ($g) {
            return [
                'id' => $g->id,
                'nombre' => $g->nombre,
                'codigo' => $g->codigo,
                'especialidad' => $g->especialidad,
            ];
        });

        $courses = Course::with('specialties')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'codigo' => $c->codigo,
                'tipo' => $c->tipo,
                'semestre' => $c->semestre,
                'especialidades' => $c->specialties->pluck('nombre')->toArray(),
            ];
        });

        $teachers = Teacher::whereHas('user')
            ->with('user')
            ->get()
            ->filter(fn($t) => !empty(trim($t->user->nombre))) // Solo docentes con nombre real
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'nombre_completo' => $t->user->nombre_completo,
                    'especialidad' => $t->especialidad,
                ];
            })->values();

        return Inertia::render('Admin/Cargas/Index', [
            'loads' => $loads,
            'periods' => $periods,
            'groups' => $groups,
            'courses' => $courses,
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ciclo_id' => 'required|exists:ciclos_escolares,id',
            'grupo_id' => 'required|exists:grupos,id',
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'required|exists:docentes,id',
        ]);

        $exists = AcademicLoad::where('ciclo_id', $request->ciclo_id)
            ->where('grupo_id', $request->grupo_id)
            ->where('materia_id', $request->materia_id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'materia_id' => 'Esta materia ya está asignada a este grupo en el periodo seleccionado.'
            ]);
        }

        AcademicLoad::create([
            'ciclo_id' => $request->ciclo_id,
            'grupo_id' => $request->grupo_id,
            'materia_id' => $request->materia_id,
            'docente_id' => $request->docente_id,
        ]);

        return redirect()->back()->with('message', 'Asignación creada con éxito.');
    }

    public function update(Request $request, $id)
    {
        $load = AcademicLoad::findOrFail($id);

        $request->validate([
            'ciclo_id' => 'required|exists:ciclos_escolares,id',
            'grupo_id' => 'required|exists:grupos,id',
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'required|exists:docentes,id',
        ]);

        $exists = AcademicLoad::where('ciclo_id', $request->ciclo_id)
            ->where('grupo_id', $request->grupo_id)
            ->where('materia_id', $request->materia_id)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'materia_id' => 'Esta materia ya está asignada a este grupo en el periodo seleccionado.'
            ]);
        }

        $load->update([
            'ciclo_id' => $request->ciclo_id,
            'grupo_id' => $request->grupo_id,
            'materia_id' => $request->materia_id,
            'docente_id' => $request->docente_id,
        ]);

        return redirect()->back()->with('message', 'Asignación actualizada con éxito.');
    }

    public function destroy($id)
    {
        $load = AcademicLoad::findOrFail($id);
        $load->delete();

        return redirect()->back()->with('message', 'Asignación eliminada con éxito.');
    }
}

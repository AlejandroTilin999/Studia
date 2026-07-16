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
        $loads = AcademicLoad::with(['academicPeriod', 'academicGroup', 'course', 'teacher'])->get()->map(function ($l) {
            return [
                'id' => $l->id,
                'academic_period_id' => $l->academic_period_id,
                'period_name' => $l->academicPeriod->name ?? 'N/A',
                'academic_group_id' => $l->academic_group_id,
                'group_name' => $l->academicGroup->name ?? 'N/A',
                'group_code' => $l->academicGroup->code ?? 'N/A',
                'course_id' => $l->course_id,
                'course_name' => $l->course->name ?? 'N/A',
                'course_code' => $l->course->code ?? 'N/A',
                'teacher_id' => $l->teacher_id,
                'teacher_name' => $l->teacher ? trim("{$l->teacher->nombre} {$l->teacher->apellido_paterno}") : 'Sin docente',
            ];
        });

        // 2. Obtener catálogos
        $periods = AcademicPeriod::all()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'is_active' => (bool)$p->is_active,
            ];
        });

        $groups = AcademicGroup::all()->map(function ($g) {
            return [
                'id' => $g->id,
                'name' => $g->name,
                'code' => $g->code,
                'major' => $g->major,
            ];
        });

        $courses = Course::with('specialties')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'code' => $c->code,
                'tipo' => $c->tipo,
                'semestre' => $c->semestre,
                'specialty_names' => $c->specialties->pluck('name')->toArray(),
            ];
        });

        $teachers = Teacher::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'nombre_completo' => trim("{$t->nombre} {$t->apellido_paterno} " . ($t->apellido_materno ?? '')),
                'specialty' => $t->specialty, // Añadimos la especialidad del docente
            ];
        });

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
            'academic_period_id' => 'required|exists:ciclos_escolares,id',
            'academic_group_id' => 'required|exists:grupos,id',
            'course_id' => 'required|exists:materias,id',
            'teacher_id' => 'required|exists:docentes,id',
        ]);

        // Evitar duplicaciones
        $exists = AcademicLoad::where('academic_period_id', $request->academic_period_id)
            ->where('academic_group_id', $request->academic_group_id)
            ->where('course_id', $request->course_id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'course_id' => 'Esta materia ya está asignada a este grupo en el periodo seleccionado.'
            ]);
        }

        AcademicLoad::create($request->only(['academic_period_id', 'academic_group_id', 'course_id', 'teacher_id']));

        return redirect()->back()->with('message', 'Asignación creada con éxito.');
    }

    public function update(Request $request, $id)
    {
        $load = AcademicLoad::findOrFail($id);

        $request->validate([
            'academic_period_id' => 'required|exists:ciclos_escolares,id',
            'academic_group_id' => 'required|exists:grupos,id',
            'course_id' => 'required|exists:materias,id',
            'teacher_id' => 'required|exists:docentes,id',
        ]);

        // Evitar duplicaciones excluyendo el registro actual
        $exists = AcademicLoad::where('academic_period_id', $request->academic_period_id)
            ->where('academic_group_id', $request->academic_group_id)
            ->where('course_id', $request->course_id)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'course_id' => 'Esta materia ya está asignada a este grupo en el periodo seleccionado.'
            ]);
        }

        $load->update($request->only(['academic_period_id', 'academic_group_id', 'course_id', 'teacher_id']));

        return redirect()->back()->with('message', 'Asignación actualizada con éxito.');
    }

    public function destroy($id)
    {
        $load = AcademicLoad::findOrFail($id);
        $load->delete();

        return redirect()->back()->with('message', 'Asignación eliminada con éxito.');
    }
}

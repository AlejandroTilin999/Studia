<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\AcademicGroup;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        // Cargamos profesor, grupos y especialidades (ahora restaurado)
        $coursesRaw = Course::with(['teacher', 'groups', 'specialties'])->get();

        $materiasFormateadas = $coursesRaw->map(function ($course) {
            return [
                'id' => $course->id,
                'codigo' => $course->code ?? $course->codigo ?? 'N/A',
                'nombre' => $course->name ?? $course->nombre,
                'semestre' => $course->semestre ?? 1,
                'descripcion' => $course->description ?? $course->descripcion ?? 'Sin descripción disponible',
                'tipo' => $course->tipo ?? 'General',
                'teacher_id' => $course->teacher_id,
                'profesor' => $course->teacher ? $course->teacher->name : 'Sin profesor asignado',
                'grupos' => $course->groups ? $course->groups->pluck('code')->unique()->toArray() : [],
                'especialidades' => $course->specialties ? $course->specialties->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                ])->toArray() : [],
            ];
        });

        // Obtenemos profesores y grupos para los selectores
        $profesores = \App\Models\Teacher::all()->map(fn($t) => [
            'id' => $t->id,
            'nombre_completo' => $t->name,
        ]);

        $grupos = AcademicGroup::all()->map(fn($g) => [
            'id' => $g->id,
            'code' => $g->code,
            'name' => $g->name ?? $g->code,
        ]);

        $specialties = Specialty::all()->map(fn($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'code' => $s->code,
        ]);

        return Inertia::render('Admin/Materias/Index', [
            'materias' => $materiasFormateadas,
            'profesores' => $profesores,
            'grupos' => $grupos,
            'specialties' => $specialties,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:materias,code|max:20',
            'name' => 'required|string|max:255',
            'semestre' => 'required|integer|min:1|max:6',
            'description' => 'nullable|string',
            'tipo' => 'required|string|in:General,Especialidad',
            'linked_groups' => 'nullable|array',
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'exists:especialidades,id',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $course = Course::create([
                'code' => $validated['code'],
                'name' => $validated['name'],
                'semestre' => $validated['semestre'],
                'description' => $validated['description'],
                'tipo' => $validated['tipo'],
            ]);

            if ($validated['tipo'] === 'Especialidad') {
                $course->specialties()->sync($request->input('specialty_ids', []));
            }
        });

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia creada correctamente.');
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'semestre' => 'required|integer|min:1|max:6',
            'description' => 'nullable|string',
            'tipo' => 'required|string|in:General,Especialidad',
            'linked_groups' => 'nullable|array',
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'exists:especialidades,id',
        ]);

        DB::transaction(function () use ($validated, $request, $course) {
            $course->update([
                'name' => $validated['name'],
                'semestre' => $validated['semestre'],
                'description' => $validated['description'],
                'tipo' => $validated['tipo'],
            ]);

            if ($validated['tipo'] === 'Especialidad') {
                $course->specialties()->sync($request->input('specialty_ids', []));
            } else {
                $course->specialties()->detach();
            }
        });

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia actualizada correctamente.');
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        // 1. Verificar si tiene asignaciones (cargas académicas) activas o históricas
        $loadsCount = \App\Models\AcademicLoad::where('course_id', $course->id)->count();
        if ($loadsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar la materia '{$course->name}' porque ya está asignada a {$loadsCount} grupos o periodos escolares."
            ]);
        }

        $course->specialties()->detach();
        $course->delete();

        return redirect()->route('admin.materias.index');
    }
}

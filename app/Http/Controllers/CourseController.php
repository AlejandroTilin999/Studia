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
                'codigo' => $course->codigo,
                'nombre' => $course->nombre,
                'semestre' => $course->semestre ?? 1,
                'descripcion' => $course->descripcion ?? 'Sin descripción disponible',
                'tipo' => $course->tipo ?? 'General',
                'area' => $course->area ?? '',
                'docente_id' => $course->docente_id,
                'profesor' => $course->teacher ? $course->teacher->name : 'Sin profesor asignado',
                'grupos' => $course->groups ? $course->groups->pluck('codigo')->unique()->toArray() : [],
                'especialidades' => $course->specialties ? $course->specialties->map(fn($s) => [
                    'id' => $s->id,
                    'nombre' => $s->nombre,
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
            'codigo' => $g->codigo,
            'nombre' => $g->nombre,
        ]);

        $especialidades = Specialty::all()->map(fn($s) => [
            'id' => $s->id,
            'nombre' => $s->nombre,
            'codigo' => $s->codigo,
        ]);

        return Inertia::render('Admin/Materias/Index', [
            'materias' => $materiasFormateadas,
            'profesores' => $profesores,
            'grupos' => $grupos,
            'especialidades' => $especialidades,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|unique:materias,codigo|max:20',
            'nombre' => 'required|string|max:255',
            'semestre' => 'required|integer|min:1|max:6',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|string|in:General,Especialidad',
            'area' => 'nullable|string|max:100',
            'linked_groups' => 'nullable|array',
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'exists:especialidades,id',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $course = Course::create([
                'codigo' => $validated['codigo'],
                'nombre' => $validated['nombre'],
                'semestre' => $validated['semestre'],
                'descripcion' => $validated['descripcion'],
                'tipo' => $validated['tipo'],
                'area' => $validated['area'] ?? null,
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
            'nombre' => 'required|string|max:255',
            'semestre' => 'required|integer|min:1|max:6',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|string|in:General,Especialidad',
            'area' => 'nullable|string|max:100',
            'linked_groups' => 'nullable|array',
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'exists:especialidades,id',
        ]);

        DB::transaction(function () use ($validated, $request, $course) {
            $course->update([
                'nombre' => $validated['nombre'],
                'semestre' => $validated['semestre'],
                'descripcion' => $validated['descripcion'],
                'tipo' => $validated['tipo'],
                'area' => $validated['area'] ?? null,
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
        $loadsCount = \App\Models\AcademicLoad::where('materia_id', $course->id)->count();
        if ($loadsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar la materia '{$course->nombre}' porque ya está asignada a {$loadsCount} grupos o periodos escolares."
            ]);
        }

        $course->specialties()->detach();
        $course->delete();

        return redirect()->route('admin.materias.index');
    }
}

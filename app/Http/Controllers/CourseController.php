<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Course; 
use App\Models\AcademicGroup;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $coursesRaw = Course::with(['teacher', 'groups', 'specialties'])->get();

        $materiasFormateadas = $coursesRaw->map(function ($course) {
            return [
                'id' => $course->id,
                'codigo' => $course->code ?? $course->codigo ?? 'N/A',
                'nombre' => $course->name ?? $course->nombre,
                'descripcion' => $course->description ?? $course->descripcion ?? 'Sin descripción disponible',
                'tipo' => $course->tipo ?? 'General',
                'profesor' => $course->teacher ? $course->teacher->name : 'Sin profesor asignado',
                'grupos' => $course->groups ? $course->groups->pluck('code')->toArray() : [],
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
            'description' => 'nullable|string',
            'tipo' => 'required|string|in:General,Especialidad',
            'teacher_id' => 'nullable|exists:docentes,id',
            'linked_groups' => 'nullable|array', 
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'exists:especialidades,id',
        ]);

        $course = Course::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'tipo' => $validated['tipo'],
            'teacher_id' => $validated['teacher_id'] ?: null,
        ]);

        if (!empty($validated['linked_groups'])) {
            $groupIds = AcademicGroup::whereIn('code', $validated['linked_groups'])->pluck('id');
            $course->groups()->sync($groupIds);
        }

        if ($validated['tipo'] === 'Especialidad' && !empty($validated['specialty_ids'])) {
            $course->specialties()->sync($validated['specialty_ids']);
        } else {
            $course->specialties()->detach();
        }

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia creada correctamente.');
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tipo' => 'required|string|in:General,Especialidad',
            'teacher_id' => 'nullable|exists:docentes,id',
            'linked_groups' => 'nullable|array',
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'exists:especialidades,id',
        ]);

        $course->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'tipo' => $validated['tipo'],
            'teacher_id' => $validated['teacher_id'] ?: null,
        ]);

        if (isset($validated['linked_groups'])) {
            $groupIds = AcademicGroup::whereIn('code', $validated['linked_groups'])->pluck('id');
            $course->groups()->sync($groupIds);
        } else {
            $course->groups()->detach();
        }

        if ($validated['tipo'] === 'Especialidad' && !empty($validated['specialty_ids'])) {
            $course->specialties()->sync($validated['specialty_ids']);
        } else {
            $course->specialties()->detach();
        }

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia actualizada correctamente.');
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->groups()->detach();
        $course->specialties()->detach();
        $course->delete();

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia registrada eliminada con éxito.');
    }
}
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Course; 
use App\Models\AcademicGroup; // 👈 CORREGIDO: Importamos AcademicGroup en vez de Group
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $coursesRaw = Course::with(['teacher', 'groups'])->get();

        $materiasFormateadas = $coursesRaw->map(function ($course) {
            return [
                'id' => $course->id,
                'codigo' => $course->code ?? $course->codigo ?? 'N/A',
                'nombre' => $course->name ?? $course->nombre,
                'descripcion' => $course->description ?? $course->descripcion ?? 'Sin descripción disponible',
                'profesor' => $course->teacher ? $course->teacher->name : 'Sin profesor asignado',
                'grupos' => $course->groups ? $course->groups->pluck('code')->toArray() : [],
            ];
        });

        return Inertia::render('Admin/Materias/Index', [
            'materias' => $materiasFormateadas,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:courses,code|max:20',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'teacher_id' => 'nullable|exists:teachers,id',
            'linked_groups' => 'nullable|array', 
        ]);

        $course = Course::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'teacher_id' => $validated['teacher_id'] ?: null,
        ]);

        if (!empty($validated['linked_groups'])) {
            // 👈 CORREGIDO: Usamos AcademicGroup
            $groupIds = AcademicGroup::whereIn('code', $validated['linked_groups'])->pluck('id');
            $course->groups()->sync($groupIds);
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
            'teacher_id' => 'nullable|exists:teachers,id',
            'linked_groups' => 'nullable|array',
        ]);

        $course->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'teacher_id' => $validated['teacher_id'] ?: null,
        ]);

        if (isset($validated['linked_groups'])) {
            // 👈 CORREGIDO: Usamos AcademicGroup
            $groupIds = AcademicGroup::whereIn('code', $validated['linked_groups'])->pluck('id');
            $course->groups()->sync($groupIds);
        } else {
            $course->groups()->detach();
        }

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia actualizada correctamente.');
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->groups()->detach();
        $course->delete();

        return redirect()->route('admin.materias.index')
            ->with('message', 'Materia registrada eliminada con éxito.');
    }
}   
<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Listar las materias en la tabla
     */
    public function index()
    {
        $coursesFromDb = Course::with(['teacher', 'academicGroups'])->get();

        $materiasMapeadas = $coursesFromDb->map(function ($course) {
            $nombreProfesor = 'Sin profesor asignado';
            if ($course->teacher) {
                $nombre = $course->teacher->nombre ?? '';
                $paterno = $course->teacher->apellido_paterno ?? '';
                $materno = $course->teacher->apellido_materno ?? '';
                $nombreProfesor = trim("$nombre $paterno $materno");
            }

            $gruposVinculados = [];
            if ($course->academicGroups && count($course->academicGroups) > 0) {
                $gruposVinculados = $course->academicGroups->pluck('code')->toArray();
            } else {
                $gruposVinculados = ['1-A']; 
            }

            return [
                'id' => $course->id,
                'codigo' => $course->code ?? 'S/C',
                'nombre' => $course->name ?? 'Materia sin nombre',
                'descripcion' => $course->description ?? 'Sin descripción disponible.',
                'profesor' => $nombreProfesor,
                'grupos' => $gruposVinculados
            ];
        });

        return Inertia::render('Admin/Materias/Index', [
            'materias' => $materiasMapeadas
        ]);
    }

    /**
     * Guardar una nueva materia (Alta)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'        => 'required|string|unique:courses,code',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'teacher_id'  => 'nullable|integer'
        ]);

        // Crear curso
        $course = Course::create($validated);

        // Vincular grupos en la tabla intermedia de forma segura si se seleccionaron
        if ($request->has('linked_groups') && is_array($request->linked_groups)) {
            // Nota: Si mandas códigos ("1-A"), buscamos sus IDs correspondientes en academic_groups
            $groupIds = \App\Models\AcademicGroup::whereIn('code', $request->linked_groups)->pluck('id');
            $course->academicGroups()->sync($groupIds);
        }

        return redirect()->back();
    }

    /**
     * 🛠️ EDITAR / ACTUALIZAR MATERIA (El método que te faltaba)
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'code'        => 'required|string|unique:courses,code,' . $course->id,
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'teacher_id'  => 'nullable|integer'
        ]);

        // Actualizar datos primarios
        $course->update($validated);

        // Actualizar la tabla intermedia de grupos asociados
        if ($request->has('linked_groups') && is_array($request->linked_groups)) {
            $groupIds = \App\Models\AcademicGroup::whereIn('code', $request->linked_groups)->pluck('id');
            $course->academicGroups()->sync($groupIds);
        }

        return redirect()->back();
    }

    /**
     * 🛠️ ELIMINAR MATERIA
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        if (\App\Models\Grade::where('course_id', $course->id)->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'No se puede eliminar la materia porque tiene calificaciones registradas para alumnos en el sistema.'
            ]);
        }
        
        // Desvincular grupos de la tabla intermedia antes de borrar para evitar fallos de llave foránea
        $course->academicGroups()->detach();
        
        $course->delete();

        return redirect()->back();
    }
}
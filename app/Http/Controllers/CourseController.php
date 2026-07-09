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
        $activePeriod = \App\Models\AcademicPeriod::where('is_active', true)->first();
        $activePeriodId = $activePeriod ? $activePeriod->id : null;

        $coursesFromDb = Course::all();
        
        $loads = $activePeriodId 
            ? \App\Models\AcademicLoad::where('academic_period_id', $activePeriodId)->with(['teacher', 'academicGroup'])->get()
            : collect();

        $materiasMapeadas = $coursesFromDb->map(function ($course) use ($loads) {
            // Buscar todas las asignaciones para esta materia en el ciclo activo
            $courseLoads = $loads->where('course_id', $course->id);

            // Obtener profesores asignados
            $profesores = $courseLoads->map(function ($load) {
                if ($load->teacher) {
                    $nombre = $load->teacher->nombre ?? '';
                    $paterno = $load->teacher->apellido_paterno ?? '';
                    $materno = $load->teacher->apellido_materno ?? '';
                    return trim("$nombre $paterno $materno");
                }
                return null;
            })->filter()->unique();

            $nombreProfesor = $profesores->isNotEmpty() ? $profesores->implode(', ') : 'Pendiente de Asignación';

            // Obtener grupos asignados
            $gruposVinculados = $courseLoads->map(function ($load) {
                return $load->academicGroup->code ?? null;
            })->filter()->unique()->toArray();

            return [
                'id' => $course->id,
                'codigo' => $course->code ?? 'S/C',
                'nombre' => $course->name ?? 'Materia sin nombre',
                'descripcion' => $course->description ?? 'Sin descripción disponible.',
                'profesor' => $nombreProfesor,
                'grupos' => $gruposVinculados
            ];
        });

        $teachers = \App\Models\Teacher::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'nombre_completo' => trim("{$t->nombre} {$t->apellido_paterno} " . ($t->apellido_materno ?? ''))
            ];
        });

        return Inertia::render('Admin/Materias/Index', [
            'materias' => $materiasMapeadas,
            'profesores' => $teachers
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
        ]);

        // Crear curso
        $course = Course::create($validated);

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
        ]);

        // Actualizar datos primarios
        $course->update($validated);

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
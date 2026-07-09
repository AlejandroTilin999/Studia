<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $activePeriod = \App\Models\AcademicPeriod::where('is_active', true)->first();
        $activePeriodId = $activePeriod ? $activePeriod->id : null;

        $teachers = Teacher::when($search, function ($query, $search) {
                $query->where('employee_code', 'ILIKE', "%{$search}%")
                      ->orWhere('nombre', 'ILIKE', "%{$search}%")
                      ->orWhere('apellido_paterno', 'ILIKE', "%{$search}%")
                      ->orWhere('specialty', 'ILIKE', "%{$search}%");
            })
            ->get()
            ->map(function ($teacher) use ($activePeriodId) {
                // Obtener las materias asignadas a este profesor en el ciclo activo
                $courses = [];
                if ($activePeriodId) {
                    $loads = \App\Models\AcademicLoad::where('teacher_id', $teacher->id)
                        ->where('academic_period_id', $activePeriodId)
                        ->with('course')
                        ->get();
                    
                    foreach ($loads as $load) {
                        if ($load->course) {
                            $courses[] = [
                                'id' => $load->course->id,
                                'name' => $load->course->name,
                                'code' => $load->course->code,
                            ];
                        }
                    }
                }

                return [
                    'id' => $teacher->id,
                    'employee_code' => $teacher->employee_code,
                    'nombre' => $teacher->nombre,
                    'apellido_paterno' => $teacher->apellido_paterno,
                    'apellido_materno' => $teacher->apellido_materno,
                    'specialty' => $teacher->specialty,
                    'phone' => $teacher->phone,
                    'email' => $teacher->email,
                    'courses' => $courses,
                ];
            });

        return Inertia::render('Admin/Docentes/Index', [
            'teachers' => $teachers
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validamos los datos entrantes del formulario
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'specialty' => 'required|string|max:150',
        ]);

        // 2. Generamos una matrícula secuencial automática (Ej: EMP-2026-006)
        $latestTeacher = Teacher::latest('id')->first();
        $nextId = $latestTeacher ? $latestTeacher->id + 1 : 1;
        $validated['employee_code'] = 'EMP-2026-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        // 3. Creamos el registro en Neon
        Teacher::create($validated);

        // 4. Redireccionamos de vuelta refrescando la tabla automáticamente con Inertia
        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'specialty' => 'required|string|max:150',
        ]);

        // Actualizamos los datos del profesor
        $teacher->update($validated);

        return redirect()->back();
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);

        if ($teacher->tutoredGroups()->exists() || $teacher->courses()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'No se puede eliminar el docente porque tiene materias o grupos tutorados asignados a su cargo.'
            ]);
        }

        $teacher->delete();

        return redirect()->back();
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\AcademicLoad;
use App\Models\AcademicPeriod;
use App\Models\AcademicGroup;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AcademicLoadController extends Controller
{
    public function index()
    {
        // 1. Obtener todas las cargas académicas con sus relaciones
        $loads = AcademicLoad::with(['academicPeriod', 'academicGroup', 'course', 'teacher'])->get()->map(function ($load) {
            $nombreProfesor = $load->teacher 
                ? trim("{$load->teacher->nombre} {$load->teacher->apellido_paterno} " . ($load->teacher->apellido_materno ?? ''))
                : 'Sin docente asignado';

            return [
                'id' => $load->id,
                'academic_period_id' => $load->academic_period_id,
                'period_name' => $load->academicPeriod->name ?? 'S/C',
                'academic_group_id' => $load->academic_group_id,
                'group_name' => $load->academicGroup->name ?? 'S/G',
                'group_code' => $load->academicGroup->code ?? 'S/C',
                'course_id' => $load->course_id,
                'course_name' => $load->course->name ?? 'Sin nombre',
                'course_code' => $load->course->code ?? 'S/C',
                'teacher_id' => $load->teacher_id,
                'teacher_name' => $nombreProfesor,
            ];
        });

        // 2. Obtener catálogos para los formularios
        $periods = AcademicPeriod::all()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'is_active' => $p->is_active
            ];
        });

        $groups = AcademicGroup::all()->map(function ($g) {
            return [
                'id' => $g->id,
                'name' => $g->name,
                'code' => $g->code,
                'major' => $g->major ?? 'TI'
            ];
        });

        $courses = Course::all()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'code' => $c->code
            ];
        });

        $teachers = Teacher::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'nombre_completo' => trim("{$t->nombre} {$t->apellido_paterno} " . ($t->apellido_materno ?? ''))
            ];
        });

        return Inertia::render('Admin/Cargas/Index', [
            'loads' => $loads,
            'periods' => $periods,
            'groups' => $groups,
            'courses' => $courses,
            'teachers' => $teachers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'academic_period_id' => 'required|integer|exists:academic_periods,id',
            'academic_group_id'  => 'required|integer|exists:academic_groups,id',
            'course_id'          => 'required|integer|exists:courses,id',
            'teacher_id'         => 'required|integer|exists:teachers,id',
        ]);

        // Verificar duplicados
        $exists = AcademicLoad::where('academic_period_id', $validated['academic_period_id'])
            ->where('academic_group_id', $validated['academic_group_id'])
            ->where('course_id', $validated['course_id'])
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'course_id' => 'Esta materia ya está asignada a este grupo en el ciclo escolar seleccionado.'
            ]);
        }

        DB::transaction(function () use ($validated) {
            // 1. Crear la carga académica
            $load = AcademicLoad::create($validated);

            // 2. Si ya hay alumnos inscritos en este grupo y ciclo escolar,
            // les asignamos automáticamente esta materia creando su registro en grades
            $enrollments = Enrollment::where('academic_group_id', $validated['academic_group_id'])
                ->where('academic_period_id', $validated['academic_period_id'])
                ->get();

            foreach ($enrollments as $enrollment) {
                // Asegurarse de que no exista previamente
                $gradeExists = Grade::where('enrollment_id', $enrollment->id)
                    ->where('course_id', $validated['course_id'])
                    ->exists();

                if (!$gradeExists) {
                    Grade::create([
                        'enrollment_id' => $enrollment->id,
                        'course_id'     => $validated['course_id'],
                        'score'         => 0.00, // Inicializar calificación en 0.00
                        'period'        => 'Parcial 1',
                    ]);
                }
            }
        });

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $load = AcademicLoad::findOrFail($id);

        $validated = $request->validate([
            'academic_period_id' => 'required|integer|exists:academic_periods,id',
            'academic_group_id'  => 'required|integer|exists:academic_groups,id',
            'course_id'          => 'required|integer|exists:courses,id',
            'teacher_id'         => 'required|integer|exists:teachers,id',
        ]);

        // Verificar duplicados excluyendo la carga actual
        $exists = AcademicLoad::where('academic_period_id', $validated['academic_period_id'])
            ->where('academic_group_id', $validated['academic_group_id'])
            ->where('course_id', $validated['course_id'])
            ->where('id', '!=', $load->id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'course_id' => 'Esta materia ya está asignada a este grupo en el ciclo escolar seleccionado.'
            ]);
        }

        DB::transaction(function () use ($load, $validated) {
            $oldCourseId = $load->course_id;
            $oldGroupId = $load->academic_group_id;
            $oldPeriodId = $load->academic_period_id;

            // Actualizar la carga
            $load->update($validated);

            // Si cambia de materia, grupo o ciclo, recrear el registro de calificación automática para alumnos
            if ($oldCourseId != $validated['course_id'] || $oldGroupId != $validated['academic_group_id'] || $oldPeriodId != $validated['academic_period_id']) {
                $enrollments = Enrollment::where('academic_group_id', $validated['academic_group_id'])
                    ->where('academic_period_id', $validated['academic_period_id'])
                    ->get();

                foreach ($enrollments as $enrollment) {
                    $gradeExists = Grade::where('enrollment_id', $enrollment->id)
                        ->where('course_id', $validated['course_id'])
                        ->exists();

                    if (!$gradeExists) {
                        Grade::create([
                            'enrollment_id' => $enrollment->id,
                            'course_id'     => $validated['course_id'],
                            'score'         => 0.00,
                            'period'        => 'Parcial 1',
                        ]);
                    }
                }
            }
        });

        return redirect()->back();
    }

    public function destroy($id)
    {
        $load = AcademicLoad::findOrFail($id);
        
        // Opcional: Podríamos validar si hay calificaciones con puntaje > 0 ya capturadas,
        // pero por simplicidad permitimos eliminar para limpiar cargas.
        $load->delete();

        return redirect()->back();
    }
}

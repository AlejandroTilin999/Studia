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

        $teachers = Teacher::with('courses')
            ->when($search, function ($query, $search) {
                $query->where('employee_code', 'ILIKE', "%{$search}%")
                      ->orWhere('nombre', 'ILIKE', "%{$search}%")
                      ->orWhere('apellido_paterno', 'ILIKE', "%{$search}%")
                      ->orWhere('specialty', 'ILIKE', "%{$search}%");
            })->get();

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
}
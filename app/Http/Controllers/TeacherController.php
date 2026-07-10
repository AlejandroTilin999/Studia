<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index()
    {
        // Traemos los docentes con sus cursos asignados
        $teachers = Teacher::with('courses')->get();

        return Inertia::render('Admin/Docentes/Index', [
            'teachers' => $teachers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'nullable|string|max:255',
            'specialty'        => 'required|string|max:255',
            'phone'            => 'required|numeric|digits:10', // Obligatorio y exactamente 10 números
        ], [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'specialty.required'        => 'La especialidad es obligatoria.',
            'phone.required'            => 'El número de celular es obligatorio.',
            'phone.numeric'             => 'El celular solo debe contener números.',
            'phone.digits'              => 'El número de celular debe tener exactamente 10 dígitos.',
        ]);

        // Generar código de empleado único
        $employeeCode = 'EMP-' . mt_rand(1000, 9999);

        Teacher::create([
            'employee_code'    => $employeeCode,
            'nombre'           => $request->nombre,
            'apellido_paterno' => $request->apellido_paterno,
            'apellido_materno' => $request->apellido_materno,
            'specialty'        => $request->specialty,
            'phone'            => $request->phone,
        ]);

        return redirect()->route('admin.docentes.index');
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'nullable|string|max:255',
            'specialty'        => 'required|string|max:255',
            'phone'            => 'required|numeric|digits:10', // Mismas reglas estrictas
        ], [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'specialty.required'        => 'La especialidad es obligatoria.',
            'phone.required'            => 'El número de celular es obligatorio.',
            'phone.numeric'             => 'El celular solo debe contener números.',
            'phone.digits'              => 'El número de celular debe tener exactamente 10 dígitos.',
        ]);

        $teacher->update([
            'nombre'           => $request->nombre,
            'apellido_paterno' => $request->apellido_paterno,
            'apellido_materno' => $request->apellido_materno,
            'specialty'        => $request->specialty,
            'phone'            => $request->phone,
        ]);

        return redirect()->route('admin.docentes.index');
    }
}
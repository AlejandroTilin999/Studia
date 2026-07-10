<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Services\ControlSchoolService;
use Illuminate\Http\Request;

class StudentApiController extends Controller
{
    protected $service;

    public function __construct(ControlSchoolService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        // Trae los alumnos con sus relaciones y permite buscar por nombre o matrícula
        $search = $request->query('search');

        $students = Enrollment::with(['user', 'academicGroup'])
            ->when($search, function ($query, $search) {
                $query->where('student_code', 'ILIKE', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('name', 'ILIKE', "%{$search}%");
                      });
            })->get();

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'student_code' => 'required|string|unique:enrollments,student_code',
            'academic_group_id' => 'required|exists:academic_groups,id'
        ]);

        $student = $this->service->registerStudent($validated);
        return response()->json(['message' => 'Alumno registrado con éxito', 'data' => $student], 201);
    }

        public function update(Request $request, $id)
    {
        // 1. Encontrar la inscripción del alumno
        $enrollment = Enrollment::with('user')->findOrFail($id);
        $user = $enrollment->user;

        // 2. Validar ignorando los registros del propio alumno actual
        $validated = $request->validate([
            'nombre'            => 'required|string|max:255',
            'email'             => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'matricula'         => ['required', 'string', Rule::unique('enrollments', 'student_code')->ignore($enrollment->id)],
            'academic_group_id' => 'required|exists:academic_groups,id',
            'status'            => 'required|in:active,suspended',
        ]);

        // 3. Actualizar los datos del Usuario (User)
        $user->update([
            'name'  => $validated['nombre'],
            'email' => $validated['email'],
        ]);

        // 4. Actualizar los datos de la Inscripción (Enrollment)
        $enrollment->update([
            'student_code'      => $validated['matricula'],
            'academic_group_id' => $validated['academic_group_id'],
            'status'            => $validated['status'], // Ajusta el nombre de la columna si en tu BD se llama diferente
        ]);

        return response()->json([
            'message' => 'Alumno actualizado con éxito',
            'data' => $enrollment->load('user')
        ]);
    }
}
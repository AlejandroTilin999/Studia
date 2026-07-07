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
}
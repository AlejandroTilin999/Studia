<?php

namespace App\Http\Controllers;

use App\Services\Enrollment\EnrollmentService;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    protected $enrollmentService;

    // Inyectamos el servicio mediante el constructor
    public function __construct(EnrollmentService $enrollmentService)
    {
        $this->enrollmentService = $enrollmentService;
    }

    /**
     * Almacena una nueva inscripción y genera sus cargos financieros.
     */
    public function store(Request $request)
    {
        // 1. Validar los datos de entrada
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'tuition_fee' => 'required|numeric|min:0',
        ]);

        // 2. Delegar la lógica pesada al servicio
        $enrollment = $this->enrollmentService->registerStudentInCycle(
            $data['user_id'],
            $data['academic_period_id'],
            $data['tuition_fee']
        );

        // 3. Responder al cliente (ideal para arquitecturas monolíticas o APIs)
        return redirect()->back()->with('success', 'Alumno inscrito correctamente en el ciclo escolar.');
    }
}
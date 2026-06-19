<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradingController extends Controller
{
    /**
     * Registra o actualiza la calificación de un estudiante.
     */
    public function updateOrCreate(Request $request)
    {
        $data = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'course_id' => 'required|exists:courses,id',
            'score' => 'required|numeric|between:0,10.00',
            'remarks' => 'nullable|string|max:255',
        ]);

        // Guardamos o actualizamos directamente usando Eloquent con las llaves foráneas
        $grade = Grade::updateOrCreate(
            [
                'enrollment_id' => $data['enrollment_id'],
                'course_id' => $data['course_id']
            ],
            [
                'score' => $data['score'],
                'remarks' => $data['remarks']
            ]
        );

        return redirect()->back()->with('success', 'Calificación asentada con éxito.');
    }
}
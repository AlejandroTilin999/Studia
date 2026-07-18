<?php

namespace App\Http\Controllers;

use App\Models\AcademicLoad;
use App\Models\AcademicPeriod;
use App\Models\AcademicGroup;
use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicLoadController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Cargas/Index', [
            'loads' => Inertia::defer(function () {
                return AcademicLoad::with(['academicPeriod', 'academicGroup', 'course', 'teacher.user'])->get()->map(function ($l) {
                    return [
                        'id' => $l->id,
                        'ciclo_id' => $l->ciclo_id,
                        'nombre_ciclo' => $l->academicPeriod->nombre ?? 'N/A',
                        'grupo_id' => $l->grupo_id,
                        'nombre_grupo' => $l->academicGroup->nombre ?? 'N/A',
                        'codigo_grupo' => $l->academicGroup->codigo ?? 'N/A',
                        'materia_id' => $l->materia_id,
                        'nombre_materia' => $l->course->nombre ?? 'N/A',
                        'codigo_materia' => $l->course->codigo ?? 'N/A',
                        'docente_id' => $l->docente_id,
                        'nombre_docente' => ($l->teacher && $l->teacher->user) ? $l->teacher->user->nombre_completo : 'Sin docente',
                        'area_docente' => $l->teacher->area ?? '',
                        'area_materia' => $l->course->area ?? '',
                    ];
                });
            }),
            'periods' => AcademicPeriod::all()->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'activo' => (bool)$p->activo,
                ];
            }),
            'groups' => AcademicGroup::all()->map(function ($g) {
                return [
                    'id' => $g->id,
                    'nombre' => $g->nombre,
                    'codigo' => $g->codigo,
                    'especialidad' => $g->especialidad,
                ];
            }),
            'courses' => Course::with('specialties')->get()->map(function ($c) {
                return [
                    'id' => $c->id,
                    'nombre' => $c->nombre,
                    'codigo' => $c->codigo,
                    'tipo' => $c->tipo,
                    'area' => $c->area ?? '',
                    'semestre' => $c->semestre,
                    'especialidades' => $c->specialties->pluck('nombre')->toArray(),
                ];
            }),
            'teachers' => Teacher::whereHas('user', function($query) {
                    $query->whereNotNull('nombre')
                          ->where('nombre', '!=', '')
                          ->where('nombre', '!=', 'Sin nombre')
                          ->where('nombre', '!=', 'Sin nombre registrado');
                })
                ->with('user')
                ->get()
                ->map(function ($t) {
                    return [
                        'id' => $t->id,
                        'nombre_completo' => $t->user->nombre_completo,
                        'especialidad' => $t->especialidad,
                        'area' => $t->area ?? '',
                    ];
                })
                ->whenEmpty(function() {
                    return Teacher::with('user')->get()->map(function($t) {
                        return [
                            'id' => $t->id,
                            'nombre_completo' => $t->user->nombre_completo,
                            'especialidad' => $t->especialidad,
                            'area' => $t->area ?? '',
                        ];
                    });
                })
                ->values()
        ]);
    }

    public function store(Request $request)
    {
        // Soporte para asignación masiva (batch)
        if ($request->has('assignments') && is_array($request->assignments)) {
            $request->validate([
                'ciclo_id' => 'required|exists:ciclos_escolares,id',
                'grupo_id' => 'required|exists:grupos,id',
                'assignments' => 'required|array',
                'assignments.*.materia_id' => 'required|exists:materias,id',
                'assignments.*.docente_id' => 'required|exists:docentes,id',
            ]);

            DB::transaction(function () use ($request) {
                foreach ($request->assignments as $assign) {
                    AcademicLoad::updateOrCreate(
                        [
                            'ciclo_id' => $request->ciclo_id,
                            'grupo_id' => $request->grupo_id,
                            'materia_id' => $assign['materia_id'],
                        ],
                        ['docente_id' => $assign['docente_id']]
                    );
                }
            });

            return redirect()->back()->with('message', 'Asignaciones procesadas con éxito.');
        }

        // Asignación individual (legacy support)
        $request->validate([
            'ciclo_id' => 'required|exists:ciclos_escolares,id',
            'grupo_id' => 'required|exists:grupos,id',
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'required|exists:docentes,id',
        ]);

        $exists = AcademicLoad::where('ciclo_id', $request->ciclo_id)
            ->where('grupo_id', $request->grupo_id)
            ->where('materia_id', $request->materia_id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'materia_id' => 'Esta materia ya está asignada a este grupo en el periodo seleccionado.'
            ]);
        }

        AcademicLoad::create([
            'ciclo_id' => $request->ciclo_id,
            'grupo_id' => $request->grupo_id,
            'materia_id' => $request->materia_id,
            'docente_id' => $request->docente_id,
        ]);

        return redirect()->back()->with('message', 'Asignación creada con éxito.');
    }

    public function update(Request $request, $id)
    {
        $load = AcademicLoad::findOrFail($id);

        $request->validate([
            'ciclo_id' => 'required|exists:ciclos_escolares,id',
            'grupo_id' => 'required|exists:grupos,id',
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'required|exists:docentes,id',
        ]);

        $exists = AcademicLoad::where('ciclo_id', $request->ciclo_id)
            ->where('grupo_id', $request->grupo_id)
            ->where('materia_id', $request->materia_id)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'materia_id' => 'Esta materia ya está asignada a este grupo en el periodo seleccionado.'
            ]);
        }

        $load->update([
            'ciclo_id' => $request->ciclo_id,
            'grupo_id' => $request->grupo_id,
            'materia_id' => $request->materia_id,
            'docente_id' => $request->docente_id,
        ]);

        return redirect()->back()->with('message', 'Asignación actualizada con éxito.');
    }

    public function destroy($id)
    {
        $load = AcademicLoad::findOrFail($id);
        $load->delete();

        return redirect()->back()->with('message', 'Asignación eliminada con éxito.');
    }
}

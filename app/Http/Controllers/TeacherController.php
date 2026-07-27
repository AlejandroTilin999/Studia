<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        return Inertia::render('Admin/Docentes/Index', [
            'teachers' => Inertia::defer(function () use ($search) {
                $query = Teacher::whereHas('user');

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('codigo_empleado', 'like', "%{$search}%")
                          ->orWhereHas('user', function($qu) use ($search) {
                              $qu->where('nombre', 'like', "%{$search}%")
                                 ->orWhere('apellido_paterno', 'like', "%{$search}%")
                                 ->orWhere('email', 'like', "%{$search}%");
                          });
                    });
                }

                return $query->with(['academicLoads.course', 'academicLoads.academicGroup', 'user'])
                    ->paginate(50)
                    ->through(function ($t) {
                        return [
                            'id'                => $t->id,
                            'codigo_empleado'   => $t->codigo_empleado,
                            'nombre'            => $t->user->nombre ?? '',
                            'apellido_paterno'  => $t->user->apellido_paterno ?? '',
                            'apellido_materno'  => $t->user->apellido_materno ?? '',
                            'especialidad'      => $t->especialidad,
                            'area'              => $t->area ?? '',
                            'telefono'          => $t->user->telefono ?? '',
                            'usuario'           => $t->user ? ['email' => $t->user->email] : null,
                            'materias'          => $t->academicLoads->map(fn($l) => [
                                'id'             => $l->course->id ?? null,
                                'nombre'         => $l->course->nombre ?? 'N/A',
                                'codigo'         => $l->course->codigo ?? '',
                                'nombre_grupo'   => $l->academicGroup->nombre ?? 'N/A',
                            ])->values()->toArray(),
                        ];
                    })
                    ->withQueryString();
            }),
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'required|string|max:255',
            'especialidad'     => 'required|string|max:255',
            'area'             => 'nullable|string|max:100',
            'telefono'         => 'required|numeric|digits:10',
        ], [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_materno.required' => 'El apellido materno es obligatorio.',
            'especialidad.required'     => 'La especialidad es obligatoria.',
            'telefono.required'         => 'El número de celular es obligatorio.',
            'telefono.numeric'          => 'El celular solo debe contener números.',
            'telefono.digits'           => 'El número de celular debe tener exactamente 10 dígitos.',
        ]);

        // Generar matrícula docente: DOC-{INICIALES}{AÑO}, garantizando unicidad
        $firstInit    = strtoupper(substr(trim($request->nombre), 0, 1));
        $paternoInit  = strtoupper(substr(trim($request->apellido_paterno), 0, 1));
        $maternoInit  = (strtoupper(substr(trim($request->apellido_materno ?? ''), 0, 1))) ?: 'X';
        $year         = date('Y');
        $baseCode     = "DOC-{$firstInit}{$paternoInit}{$maternoInit}{$year}";
        $employeeCode = $baseCode;
        $counter      = 1;
        while (Teacher::where('codigo_empleado', $employeeCode)->exists()) {
            $employeeCode = $baseCode . $counter;
            $counter++;
        }

        // Generar correo: nombre.apellido@prepahidalgo.edu.mx
        $firstNamePart  = strtolower(explode(' ', trim($request->nombre))[0] ?? '');
        $paternoPartRaw = strtolower(explode(' ', trim($request->apellido_paterno))[0] ?? '');
        $firstNamePart  = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $firstNamePart));
        $paternoPart    = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $paternoPartRaw));
        $emailBase      = "{$firstNamePart}.{$paternoPart}";
        $generatedEmail = "{$emailBase}@prepahidalgo.edu.mx";

        while (User::where('email', $generatedEmail)->exists()) {
            $randomSuffix = strtoupper(substr(md5(uniqid()), 0, 4));
            $generatedEmail = "{$emailBase}.{$randomSuffix}@prepahidalgo.edu.mx";
        }

        DB::transaction(function () use ($request, $employeeCode, $generatedEmail) {
            // 1. Crear el usuario correspondiente
            $user = User::create([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $generatedEmail,
                'password'         => Hash::make('Prepahid2026'),
                'rol'              => 'docente',
            ]);

            // 2. Crear el docente enlazado
            Teacher::create([
                'usuario_id'       => $user->id,
                'codigo_empleado'  => $employeeCode,
                'especialidad'     => $request->especialidad,
                'area'             => $request->area ?? null,
            ]);
        });

        return redirect()->route('admin.docentes.index');
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'required|string|max:255',
            'especialidad'     => 'required|string|max:255',
            'area'             => 'nullable|string|max:100',
            'telefono'         => 'required|numeric|digits:10',
        ], [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_materno.required' => 'El apellido materno es obligatorio.',
            'especialidad.required'     => 'La especialidad es obligatoria.',
            'telefono.required'         => 'El número de celular es obligatorio.',
            'telefono.numeric'          => 'El celular solo debe contener números.',
            'telefono.digits'           => 'El número de celular debe tener exactamente 10 dígitos.',
        ]);

        DB::transaction(function () use ($request, $teacher) {
            // 1. Si está enlazado a un usuario, actualizar sus datos personales
            if ($teacher->user) {
                $teacher->user->update([
                    'nombre'           => $request->nombre,
                    'apellido_paterno' => $request->apellido_paterno,
                    'apellido_materno' => $request->apellido_materno,
                    'telefono'         => $request->telefono,
                ]);
            }

            // 2. Actualizar docente
            $teacher->update([
                'especialidad'     => $request->especialidad,
                'area'             => $request->area ?? null,
            ]);
        });

        return redirect()->route('admin.docentes.index');
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);

        // 1. Verificar si tiene materias asignadas (Cargas Académicas)
        $loadsCount = $teacher->academicLoads()->count();
        if ($loadsCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar al docente '{$teacher->user->nombre}' porque tiene {$loadsCount} materias asignadas actualmente."
            ]);
        }

        // 2. Verificar si es tutor de algún grupo
        $groupTutor = \App\Models\AcademicGroup::where('docente_tutor_id', $teacher->id)->first();
        if ($groupTutor) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar al docente '{$teacher->user->nombre}' porque es tutor titular del grupo '{$groupTutor->nombre}'."
            ]);
        }

        DB::transaction(function () use ($teacher) {
            if ($teacher->user) {
                $teacher->user->delete();
            }
            $teacher->delete();
        });

        return redirect()->route('admin.docentes.index');
    }
}

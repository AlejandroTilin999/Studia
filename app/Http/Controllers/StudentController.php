<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\AcademicGroup;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Alumnos/Index', [
            'alumnos' => Inertia::defer(function () {
                return Student::whereHas('user')
                    ->with(['user', 'enrollment.academicGroup'])
                    ->get()
                    ->map(function ($student) {
                        return [
                            'id' => $student->id,
                            'usuario_id' => $student->usuario_id,
                            'nombre' => $student->user ? $student->user->nombre_completo : 'Sin nombre',
                            'rawNombre' => $student->user->nombre ?? '',
                            'rawPaterno' => $student->user->apellido_paterno ?? '',
                            'rawMaterno' => $student->user->apellido_materno ?? '',
                            'email' => $student->user->email ?? 'Sin correo',
                            'matricula' => $student->matricula,
                            'telefono' => $student->user->telefono ?? '',
                            'fecha_nacimiento' => $student->fecha_nacimiento ?? '',
                            'grupo' => $student->enrollment && $student->enrollment->academicGroup ? [
                                'id' => $student->enrollment->academicGroup->id,
                                'nombre' => $student->enrollment->academicGroup->nombre,
                            ] : null,
                            'estatus' => $student->enrollment->estatus ?? 'active',
                            'calificaciones' => [],
                        ];
                    });
            }),
            'groups' => AcademicGroup::all()->map(function ($g) {
                return [
                    'id' => $g->id,
                    'nombre' => $g->nombre,
                    'codigo' => $g->codigo,
                    'especialidad' => $g->especialidad,
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'            => 'required|string|max:255',
            'apellido_paterno'  => 'required|string|max:255',
            'apellido_materno'  => 'nullable|string|max:255',
            'email'             => 'nullable|string|email|max:255',
            'matricula'         => 'required|string|max:50',
            'telefono'          => 'required|string|max:20',
            'fecha_nacimiento'  => 'required|date',
            'grupo_id'          => 'required|exists:grupos,id',
        ]);

        // Validar cupo del grupo (límite: 22 estudiantes por grupo)
        $activeEnrollmentsCount = Enrollment::where('grupo_id', $request->grupo_id)
            ->where('estatus', 'active')
            ->whereNull('fecha_baja')
            ->count();

        if ($activeEnrollmentsCount >= 22) {
            return redirect()->back()->withErrors([
                'grupo_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
            ]);
        }

        // --- GENERACIÓN DE CORREO ÚNICO ---
        $firstNamePart  = strtolower(explode(' ', trim($request->nombre))[0] ?? '');
        $paternoPartRaw = strtolower(explode(' ', trim($request->apellido_paterno))[0] ?? '');
        // Limpiar acentos y caracteres especiales
        $firstNamePart  = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $firstNamePart));
        $paternoPart    = preg_replace('/[^a-z0-9]/u', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $paternoPartRaw));

        $emailBase      = "{$firstNamePart}.{$paternoPart}";
        $generatedEmail = "{$emailBase}@prepahidalgo.edu.mx";

        while (User::where('email', $generatedEmail)->exists()) {
            $randomSuffix = strtoupper(substr(md5(uniqid()), 0, 4));
            $generatedEmail = "{$emailBase}.{$randomSuffix}@prepahidalgo.edu.mx";
        }

        // --- GARANTIZAR MATRÍCULA ÚNICA ---
        $matriculaBase = $request->matricula;
        $finalMatricula = $matriculaBase;
        $counter = 1;
        while (Student::where('matricula', $finalMatricula)->exists()) {
            $finalMatricula = $matriculaBase . chr(64 + $counter); // Agrega A, B, C...
            $counter++;
        }

        DB::transaction(function () use ($request, $generatedEmail, $finalMatricula) {
            // 1. Crear el usuario correspondiente
            $user = User::create([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $generatedEmail,
                'password'         => Hash::make('Prepahid2026'),
                'rol'              => 'alumno',
            ]);

            // 2. Crear el perfil de estudiante
            Student::create([
                'usuario_id'       => $user->id,
                'matricula'        => $finalMatricula,
                'fecha_nacimiento' => $request->fecha_nacimiento,
            ]);

            // 3. Registrar su inscripción en el grupo
            $activePeriod = \App\Models\AcademicPeriod::where('activo', true)->first();
            $periodId = $activePeriod ? $activePeriod->id : null;

            Enrollment::create([
                'usuario_id'    => $user->id,
                'grupo_id'      => $request->grupo_id,
                'ciclo_id'      => $periodId,
                'codigo_alumno' => $finalMatricula,
                'estatus'       => 'active',
            ]);
        });

        return redirect()->route('admin.alumnos.index');
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'nombre'            => 'required|string|max:255',
            'apellido_paterno'  => 'required|string|max:255',
            'apellido_materno'  => 'nullable|string|max:255',
            'email'             => "required|string|email|max:255|unique:users,email,{$student->usuario_id}",
            'matricula'         => "required|string|max:50|unique:alumnos,matricula,{$student->id}",
            'telefono'          => 'required|string|max:20',
            'fecha_nacimiento'  => 'required|date',
            'grupo_id'          => 'required|exists:grupos,id',
        ]);

        // Validar cupo del grupo si cambió de grupo
        $currentGroupId = $student->enrollment ? $student->enrollment->grupo_id : null;
        if ($currentGroupId != $request->grupo_id) {
            $activeEnrollmentsCount = Enrollment::where('grupo_id', $request->grupo_id)
                ->where('estatus', 'active')
                ->whereNull('fecha_baja')
                ->count();

            if ($activeEnrollmentsCount >= 22) {
                return redirect()->back()->withErrors([
                    'grupo_id' => 'El grupo seleccionado ya está lleno (máximo 22 alumnos por salón).'
                ]);
            }
        }

        DB::transaction(function () use ($request, $student) {
            // 1. Actualizar datos en la tabla general de usuarios
            $student->user->update([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'telefono'         => $request->telefono,
                'email'            => $request->email,
            ]);

            // 2. Actualizar datos específicos de la tabla estudiantes
            $student->update([
                'matricula'        => $request->matricula,
                'fecha_nacimiento' => $request->fecha_nacimiento,
            ]);

            // 3. Actualizar inscripción (traslado con historial o asignación inicial)
            $activePeriod = \App\Models\AcademicPeriod::where('activo', true)->first();
            $periodId = $activePeriod ? $activePeriod->id : null;

            if ($student->enrollment) {
                $student->enrollment->update([
                    'grupo_id'      => $request->grupo_id,
                    'codigo_alumno' => $request->matricula,
                    'estatus'       => $request->estatus ?? $student->enrollment->estatus,
                ]);
            } else {
                Enrollment::create([
                    'usuario_id'    => $student->usuario_id,
                    'grupo_id'      => $request->grupo_id,
                    'ciclo_id'      => $periodId,
                    'codigo_alumno' => $request->matricula,
                    'estatus'       => $request->estatus ?? 'active',
                ]);
            }
        });

        return redirect()->route('admin.alumnos.index');
    }

    public function toggleStatus($id)
    {
        $student = Student::findOrFail($id);
        if ($student->enrollment) {
            $newStatus = $student->enrollment->estatus === 'active' ? 'suspended' : 'active';
            $student->enrollment->update(['estatus' => $newStatus]);
        }
        return redirect()->route('admin.alumnos.index');
    }

    /**
     * Obtiene el Kardex detallado de un alumno (Carga bajo demanda para velocidad)
     */
    public function getKardex($id)
    {
        $student = Student::findOrFail($id);
        $kardex = \App\Services\GradeService::getStudentKardex($student->usuario_id);

        return response()->json([
            'kardex' => $kardex
        ]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        // Verificar si tiene historial de calificaciones
        $gradesCount = \App\Models\Grade::where('usuario_id', $student->usuario_id)->count();
        if ($gradesCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el expediente de '{$student->nombre}' porque ya cuenta con {$gradesCount} calificaciones asentadas en su historial."
            ]);
        }

        DB::transaction(function () use ($student) {
            // 1. Eliminar inscripciones
            if ($student->enrollment) {
                $student->enrollment->delete();
            }

            // 2. Eliminar usuario asociado
            if ($student->user) {
                $student->user->delete();
            }

            // 3. Eliminar alumno
            $student->delete();
        });

        return redirect()->route('admin.alumnos.index');
    }
}

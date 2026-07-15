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
    public function index()
    {
        // Traemos los docentes con sus cargas académicas (asignaciones reales) y su usuario vinculado
        $teachers = Teacher::with(['academicLoads.course', 'academicLoads.academicGroup', 'user'])->get();

        $teachers = $teachers->map(function ($t) {
            return [
                'id'               => $t->id,
                'employee_code'    => $t->employee_code,
                'nombre'           => $t->nombre,
                'apellido_paterno' => $t->apellido_paterno,
                'apellido_materno' => $t->apellido_materno,
                'specialty'        => $t->specialty,
                'phone'            => $t->phone,
                'user'             => $t->user ? ['email' => $t->user->email] : null,
                'courses'          => $t->academicLoads->map(fn($l) => [
                    'id'        => $l->course->id ?? null,
                    'name'      => $l->course->name ?? 'N/A',
                    'code'      => $l->course->code ?? '',
                    'groupName' => $l->academicGroup->name ?? 'N/A',
                ])->values()->toArray(),
            ];
        });

        return Inertia::render('Admin/Docentes/Index', [
            'teachers' => $teachers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'           => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'required|string|max:255',
            'specialty'        => 'required|string|max:255',
            'phone'            => 'required|numeric|digits:10',
        ], [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_materno.required' => 'El apellido materno es obligatorio.',
            'specialty.required'        => 'La especialidad es obligatoria.',
            'phone.required'            => 'El número de celular es obligatorio.',
            'phone.numeric'             => 'El celular solo debe contener números.',
            'phone.digits'              => 'El número de celular debe tener exactamente 10 dígitos.',
        ]);

        // Generar matrícula docente: DOC-{INICIALES}{AÑO}, garantizando unicidad
        $firstInit    = strtoupper(substr(trim($request->nombre), 0, 1));
        $paternoInit  = strtoupper(substr(trim($request->apellido_paterno), 0, 1));
        $maternoInit  = strtoupper(substr(trim($request->apellido_materno ?? ''), 0, 1)) ?: 'X';
        $year         = date('Y');
        $baseCode     = "DOC-{$firstInit}{$paternoInit}{$maternoInit}{$year}";
        $employeeCode = $baseCode;
        $counter      = 1;
        while (Teacher::where('employee_code', $employeeCode)->exists()) {
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
        $emailCounter   = 1;
        while (User::where('email', $generatedEmail)->exists()) {
            $generatedEmail = "{$emailBase}{$emailCounter}@prepahidalgo.edu.mx";
            $emailCounter++;
        }

        DB::transaction(function () use ($request, $employeeCode, $generatedEmail) {
            // 1. Crear el usuario correspondiente
            $fullName = trim("{$request->nombre} {$request->apellido_paterno} " . ($request->apellido_materno ?? ''));
            $user = User::create([
                'name'     => $fullName,
                'email'    => $generatedEmail,
                'password' => Hash::make('Prepahid2026'),
                'role'     => 'docente',
            ]);

            // 2. Crear el docente enlazado
            Teacher::create([
                'user_id'          => $user->id,
                'employee_code'    => $employeeCode,
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'specialty'        => $request->specialty,
                'phone'            => $request->phone,
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
            'specialty'        => 'required|string|max:255',
            'phone'            => 'required|numeric|digits:10', // Mismas reglas estrictas
        ], [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_materno.required' => 'El apellido materno es obligatorio.',
            'specialty.required'        => 'La especialidad es obligatoria.',
            'phone.required'            => 'El número de celular es obligatorio.',
            'phone.numeric'             => 'El celular solo debe contener números.',
            'phone.digits'              => 'El número de celular debe tener exactamente 10 dígitos.',
        ]);

        DB::transaction(function () use ($request, $teacher) {
            // 1. Si está enlazado a un usuario, actualizar su nombre
            if ($teacher->user) {
                $fullName = trim("{$request->nombre} {$request->apellido_paterno} " . ($request->apellido_materno ?? ''));
                $teacher->user->update([
                    'name' => $fullName,
                ]);
            }

            // 2. Actualizar docente
            $teacher->update([
                'nombre'           => $request->nombre,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'specialty'        => $request->specialty,
                'phone'            => $request->phone,
            ]);
        });

        return redirect()->route('admin.docentes.index');
    }
}
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\AcademicGroup;
use App\Models\AcademicPeriod;
use App\Models\Enrollment;
use App\Models\ReportDownload;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Reportes/Index', [
            'groups' => Inertia::defer(fn() => 
                AcademicGroup::select('id', 'nombre')->get()
            ),
            'students' => Inertia::defer(fn() => 
                Enrollment::select('id', 'usuario_id', 'grupo_id', 'codigo_alumno')
                    ->with('user:id,nombre,apellido_paterno,apellido_materno')
                    ->get()
                    ->map(fn($e) => [
                        'matricula' => $e->codigo_alumno,
                        'nombre' => $e->user?->nombre_completo ?? 'Sin nombre',
                        'grupo_id' => $e->grupo_id,
                    ])
            ),
            'periods' => Inertia::defer(fn() => 
                AcademicPeriod::select('id', 'nombre', 'fecha_inicio')
                    ->orderBy('fecha_inicio', 'desc')
                    ->get()
                    ->map(fn($p) => [
                        'id' => $p->id,
                        'nombre' => $p->nombre,
                    ])
            ),
            'stats' => Inertia::defer(fn() => $this->getReportStats()),
            'recentDownloads' => Inertia::defer(fn() => $this->getRecentDownloads())
        ]);
    }

    protected function getReportStats()
    {
        $counts = DB::table('reporte_descargas')
            ->select('tipo_reporte', DB::raw('count(*) as total'))
            ->groupBy('tipo_reporte')
            ->pluck('total', 'tipo_reporte');

        return [
            'total' => $counts->sum(),
            'asistencia' => $counts->get('asistencia', 0),
            'boleta' => $counts->get('boleta', 0),
            'constancia' => $counts->get('constancia', 0),
            'historial' => $counts->get('historial', 0),
            'lote' => $counts->get('lote', 0),
        ];
    }

    protected function getRecentDownloads()
    {
        return ReportDownload::with('user:id,nombre,apellido_paterno,apellido_materno')
            ->select('id', 'usuario_id', 'tipo_reporte', 'metadata', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'folio' => $d->folio,
                    'tipo' => $d->tipo_reporte,
                    'sujeto' => $d->metadata['sujeto'] ?? 'N/A',
                    'admin' => $d->user ? mb_strtoupper($d->user->nombre_completo) : 'SISTEMA',
                    'fecha' => $d->created_at->isoFormat('D MMM YYYY, h:mm a'),
                    'raw_date' => $d->created_at->format('Y-m-d'),
                    'metadata' => $d->metadata,
                ];
            });
    }

    /**
     * Registra una descarga/generación de reporte.
     */
    public function logDownload(Request $request)
    {
        $request->validate([
            'tipo_reporte' => 'required|string',
            'sujeto' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $metadata = $request->metadata ?? [];
        $metadata['sujeto'] = $request->sujeto;

        ReportDownload::create([
            'usuario_id' => auth()->id(),
            'tipo_reporte' => $request->tipo_reporte,
            'metadata' => $metadata,
        ]);

        return back();
    }

    /**
     * Elimina un registro específico del historial.
     */
    public function destroyDownload($id)
    {
        $download = ReportDownload::find($id);
        if ($download) {
            \App\Models\AdminAuditLog::create([
                'usuario_id' => auth()->id(),
                'accion' => 'ELIMINAR_REPORTE',
                'descripcion' => "Se eliminó el folio de reporte {$download->folio} del historial.",
                'metadata' => ['id' => $id, 'folio' => $download->folio]
            ]);
            $download->delete();
        }

        return redirect()->route('admin.reportes.index');
    }

    /**
     * Vacía todo el historial de descargas.
     */
    public function clearDownloadHistory()
    {
        DB::transaction(function () {
            DB::table('reporte_descargas')->truncate();
            \App\Models\AdminAuditLog::create([
                'usuario_id' => auth()->id(),
                'accion' => 'LIMPIAR_HISTORIAL_REPORTES',
                'descripcion' => "Se vació completamente el historial de descargas de reportes.",
            ]);
        });

        return redirect()->route('admin.reportes.index');
    }

    /**
     * Obtiene los datos para la lista de asistencia.
     */
    public function getAttendanceData($groupId, $periodId)
    {
        return response()->json($this->makeAttendanceData($groupId, $periodId));
    }

    protected function makeAttendanceData($groupId, $periodId)
    {
        $group = AcademicGroup::with('tutor.user:id,nombre,apellido_paterno,apellido_materno')
            ->findOrFail($groupId);

        $period = AcademicPeriod::findOrFail($periodId);

        $enrollments = Enrollment::where('grupo_id', $groupId)
            ->where('ciclo_id', $periodId)
            ->with('user:id,nombre,apellido_paterno,apellido_materno')
            ->get()
            ->map(function ($e) {
                $u = $e->user;
                $formattedName = mb_strtoupper(trim("{$u->apellido_paterno} {$u->apellido_materno} {$u->nombre}"));

                return [
                    'usuario_id' => $e->usuario_id,
                    'matricula' => $e->codigo_alumno,
                    'nombre' => $formattedName,
                    'apellido_paterno' => $u->apellido_paterno,
                    'apellido_materno' => $u->apellido_materno,
                ];
            })
            ->sortBy('nombre')
            ->values();

        return [
            'group' => [
                'nombre' => mb_strtoupper($group->nombre),
                'codigo' => $group->codigo,
                'especialidad' => mb_strtoupper($group->especialidad),
                'turno' => mb_strtoupper($group->turno ?? 'Matutino'),
                'tutor' => $group->tutor ? mb_strtoupper(trim("{$group->tutor->user->apellido_paterno} {$group->tutor->user->apellido_materno} {$group->tutor->user->nombre}")) : 'PENDIENTE'
            ],
            'period' => [
                'nombre' => mb_strtoupper($period->nombre)
            ],
            'enrollments' => $enrollments,
            'generated_at' => \Carbon\Carbon::now()->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY') . ' a las ' . now()->format('h:i a')
        ];
    }

    /**
     * Obtiene los datos para la constancia de estudios.
     */
    public function getCertificateData($matricula, $enrollment = null)
    {
        return response()->json($this->makeCertificateData($matricula, $enrollment));
    }

    protected function makeCertificateData($matricula, $enrollment = null)
    {
        if (!$enrollment) {
            $enrollment = Enrollment::where('codigo_alumno', $matricula)
                ->where('estatus', 'active')
                ->with([
                    'user:id,nombre,apellido_paterno,apellido_materno', 
                    'academicGroup', 
                    'academicPeriod'
                ])
                ->firstOrFail();
        }

        $user = $enrollment->user;
        $group = $enrollment->academicGroup;
        $period = $enrollment->academicPeriod;

        $semestre = '1';
        if (preg_match('/(\d+)/', $group->nombre, $matches)) {
            $semestre = $matches[1];
        }

        return [
            'student' => [
                'nombre' => mb_strtoupper("{$user->apellido_paterno} {$user->apellido_materno} {$user->nombre}"),
                'matricula' => $enrollment->codigo_alumno,
            ],
            'academic' => [
                'grupo' => mb_strtoupper($group->nombre),
                'especialidad' => mb_strtoupper($group->especialidad),
                'ciclo' => mb_strtoupper($period->nombre),
                'semestre' => $semestre,
                'turno' => mb_strtoupper($group->turno ?? 'MATUTINO'),
            ],
            'issued_at' => [
                'day' => date('d'),
                'month' => \Carbon\Carbon::now()->locale('es')->monthName,
                'year' => date('Y'),
                'full' => \Carbon\Carbon::now()->locale('es')->isoFormat('D [días del mes de] MMMM [de] YYYY')
            ]
        ];
    }

    /**
     * Obtiene los datos para la boleta de calificaciones.
     */
    public function getGradeReportData($matricula, $periodId, $enrollment = null)
    {
        return response()->json($this->makeGradeReportData($matricula, $periodId, $enrollment));
    }

    protected function makeGradeReportData($matricula, $periodId, $enrollment = null)
    {
        if (!$enrollment) {
            $enrollment = Enrollment::where('codigo_alumno', $matricula)
                ->where('ciclo_id', $periodId)
                ->with([
                    'user:id,nombre,apellido_paterno,apellido_materno', 
                    'academicGroup', 
                    'academicPeriod'
                ])
                ->firstOrFail();
        }

        $userId = $enrollment->usuario_id;
        $user = $enrollment->user;
        $group = $enrollment->academicGroup;
        $period = $enrollment->academicPeriod;

        $kardex = \App\Services\GradeService::getStudentKardex($userId);

        $totalScore = 0;
        $subjectCount = 0;
        foreach ($kardex as $item) {
            if ($item['score'] !== '—') {
                $totalScore += intval($item['score']);
                $subjectCount++;
            }
        }
        $gpa = ($subjectCount > 0) ? number_format($totalScore / $subjectCount, 0) : '—';

        return [
            'student' => [
                'nombre' => mb_strtoupper("{$user->apellido_paterno} {$user->apellido_materno} {$user->nombre}"),
                'matricula' => $enrollment->codigo_alumno,
            ],
            'academic' => [
                'grupo' => mb_strtoupper($group->nombre),
                'especialidad' => mb_strtoupper($group->especialidad),
                'ciclo' => mb_strtoupper($period->nombre),
            ],
            'grades' => $kardex,
            'gpa' => $gpa,
            'issued_at' => [
                'full' => \Carbon\Carbon::now()->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY') . ' a las ' . now()->format('h:i a')
            ]
        ];
    }

    /**
     * Obtiene el historial académico completo (Kardex) de un alumno.
     */
    public function getFullKardexData($matricula)
    {
        $student = Student::where('matricula', $matricula)
            ->with('user:id,nombre,apellido_paterno,apellido_materno')
            ->firstOrFail();
        $userId = $student->usuario_id;

        $enrollments = Enrollment::where('usuario_id', $userId)
            ->with([
                'academicGroup:id,nombre,especialidad',
                'academicPeriod:id,nombre',
                'academicGroup.academicLoads' => function($q) {
                    $q->select('id', 'grupo_id', 'ciclo_id', 'materia_id');
                },
                'academicGroup.academicLoads.course:id,nombre,codigo,semestre',
                'academicGroup.academicLoads.grades' => function($q) use ($userId) {
                    $q->where('usuario_id', $userId)->whereNull('criterio_id');
                }
            ])
            ->get();

        $history = [];
        $totalSum = 0;
        $totalSubjects = 0;

        foreach ($enrollments as $enrollment) {
            $periodName = $enrollment->academicPeriod->nombre ?? 'N/A';
            $loads = $enrollment->academicGroup->academicLoads ?? collect();

            foreach ($loads as $load) {
                if ($load->ciclo_id != $enrollment->ciclo_id) continue;

                $gradeRecord = $load->grades->first();
                $finalGrade = $gradeRecord ? \App\Services\GradeService::formatGrade($gradeRecord->final) : '—';

                if ($finalGrade !== '—') {
                    $totalSum += intval($finalGrade);
                    $totalSubjects++;
                }

                $history[] = [
                    'period' => mb_strtoupper($periodName),
                    'semestre' => $load->course->semestre ?? '—',
                    'codigo' => mb_strtoupper($load->course->codigo ?? 'S/C'),
                    'materia' => mb_strtoupper($load->course->nombre ?? 'S/N'),
                    'calificacion' => $finalGrade
                ];
            }
        }

        $globalGpa = ($totalSubjects > 0) ? number_format($totalSum / $totalSubjects, 0) : '—';

        return response()->json([
            'student' => [
                'nombre' => mb_strtoupper($student->user->nombre_completo),
                'matricula' => $student->matricula,
                'especialidad' => $enrollments->isNotEmpty() ? mb_strtoupper($enrollments->last()->academicGroup->especialidad ?? 'GENERAL') : 'GENERAL',
            ],
            'history' => $history,
            'globalGpa' => $globalGpa,
            'issued_at' => [
                'full' => \Carbon\Carbon::now()->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY')
            ]
        ]);
    }

    /**
     * Obtiene los datos masivos de un grupo para descargas por lote.
     */
    public function getBatchData(Request $request)
    {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        $request->validate([
            'tipo_reporte' => 'required|string|in:boleta,constancia,asistencia',
            'grupo_id' => 'required|string',
            'ciclo_id' => 'required|exists:ciclos_escolares,id',
        ]);

        $tipo = $request->tipo_reporte;
        $groupId = $request->grupo_id;
        $periodId = $request->ciclo_id;

        $groupsToProcess = ($groupId === 'all')
            ? AcademicGroup::select('id', 'nombre', 'codigo', 'especialidad', 'turno', 'tutor_id')->where('activo', true)->get()
            : AcademicGroup::select('id', 'nombre', 'codigo', 'especialidad', 'turno', 'tutor_id')->where('id', $groupId)->get();

        $batchData = [];

        foreach ($groupsToProcess as $group) {
            if ($tipo === 'asistencia') {
                try {
                    $batchData[] = $this->makeAttendanceData($group->id, $periodId);
                } catch (\Exception $e) { continue; }
            } else {
                $enrollments = Enrollment::where('grupo_id', $group->id)
                    ->where('ciclo_id', $periodId)
                    ->where('estatus', 'active')
                    ->with([
                        'user:id,nombre,apellido_paterno,apellido_materno',
                        'academicGroup:id,nombre,especialidad,turno',
                        'academicPeriod:id,nombre'
                    ])
                    ->get();

                foreach ($enrollments as $enrollment) {
                    try {
                        if ($tipo === 'boleta') {
                            $batchData[] = $this->makeGradeReportData($enrollment->codigo_alumno, $periodId, $enrollment);
                        } else {
                            $batchData[] = $this->makeCertificateData($enrollment->codigo_alumno, $enrollment);
                        }
                    } catch (\Exception $e) { continue; }
                }
            }
        }

        return response()->json([
            'tipo' => $tipo,
            'items' => $batchData,
            'count' => count($batchData)
        ]);
    }
}


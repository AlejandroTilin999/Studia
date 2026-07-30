import React from 'react';
import { Folder, Loader2, Cloud, CheckCircle2 } from 'lucide-react';
import AppTable from '@/Components/table/AppTable';
import { StudentGrade, Criterion, MINIMUM_PASSING_GRADE } from '../services/constants';
import GradeSelector from './GradeSelector';
import { cn } from '@/lib/utils';

interface GradesTabProps {
    studentGrades: StudentGrade[];
    setStudentGrades: (g: StudentGrade[]) => void;
    activeCriteria: Criterion[];
    getStudentTasksAverage: (studentId: number) => string;
    setScore: (studentId: number, criterionId: number, val: string) => void;
    handleAsentarCalificaciones: () => void;
    handleConcludeParcial: () => void;
    isReadOnly?: boolean;
    isSaving?: boolean;
}

export default function GradesTab({
    studentGrades,
    setStudentGrades,
    activeCriteria,
    getStudentTasksAverage,
    setScore,
    handleAsentarCalificaciones,
    handleConcludeParcial,
    isReadOnly = false,
    isSaving = false
}: GradesTabProps) {

    // Actualización instantánea para el promedio en la UI
    function handleInstantGrade(studentId: number, criterionId: number, val: string) {
        const updated = studentGrades.map(s =>
            s.id === studentId ? { ...s, calificaciones: { ...s.calificaciones, [criterionId]: val } } : s
        );
        setStudentGrades(updated);
    }

    // [OPTIMIZACIÓN] Memoizar columnas para que el scroll y sync no remunten los inputs
    const columns = React.useMemo(() => [
        {
            header: 'Matrícula',
            accessor: (r: StudentGrade) => r.matricula,
            className: 'text-sm text-slate-500',
        },
        {
            header: 'Alumno',
            accessor: (r: StudentGrade) => r.nombre,
            className: 'text-sm text-slate-500',
        },
        ...activeCriteria.map(c => {
            const isSynced = c.sincronizar_tareas;
            return {
                header: (
                    <div className="flex flex-col items-center gap-0.5 min-w-[140px] max-w-[200px] text-center">
                        <span className="text-xs font-semibold text-slate-700 truncate w-full" title={c.nombre}>{c.nombre}</span>
                        <span className="text-[10px] font-bold text-slate-400">{c.porcentaje}%</span>
                    </div>
                ),
                align: 'center' as const,
                headerClassName: 'w-36',
                accessor: (r: StudentGrade) => {
                    const val = isSynced ? getStudentTasksAverage(r.id) : (r.calificaciones[c.id] ?? '');
                    return (
                        <div
                            className={cn(
                                "flex justify-center items-center gap-0 h-8",
                                isSynced && "cursor-help"
                            )}
                            title={isSynced ? "Sincronizado con Plataforma" : undefined}
                        >
                            <GradeSelector
                                initialValue={val}
                                max={10}
                                disabled={isReadOnly || isSynced}
                                onInstantChange={isSynced ? undefined : (newVal) => handleInstantGrade(r.id, c.id, newVal)}
                                onChange={isSynced ? () => {} : (newVal) => setScore(r.id, c.id, newVal)}
                            />
                            <span className="text-sm text-slate-400 font-normal">/10</span>
                        </div>
                    );
                },
            };
        }),
        {
            header: (
                <div className="flex items-center justify-center gap-2">
                    Promedio
                    {isSaving && <Loader2 size={12} className="animate-spin text-[#1e88e5]" />}
                    {!isSaving && <Cloud size={12} className="text-slate-300" />}
                </div>
            ),
            align: 'center' as const,
            headerClassName: 'w-28',
            accessor: (r: StudentGrade) => {
                // [SEGURIDAD v6.2] Validar existencia de calificaciones del alumno
                const filled = activeCriteria.every(c => {
                    const val = c.sincronizar_tareas ? getStudentTasksAverage(r.id) : (r.calificaciones?.[c.id] ?? '');
                    return val !== '' && val !== '—';
                });

                if (!filled) return <span className="text-xs text-slate-300 font-semibold">—</span>;

                const avg = activeCriteria.reduce((sum, c) => {
                    const val = c.sincronizar_tareas ? getStudentTasksAverage(r.id) : (r.calificaciones?.[c.id] || '0');
                    const score = (val === '—') ? 0 : parseFloat(val);
                    return sum + (score * c.porcentaje / 100);
                }, 0);

                // [REDONDEO OFICIAL] .6 sube, .5 baja
                const finalAvg = Math.floor(avg + 0.4);

                return (
                    <span className={`text-sm font-black ${finalAvg >= MINIMUM_PASSING_GRADE ? 'text-slate-700' : 'text-rose-500'}`}>
                        {finalAvg}
                    </span>
                );
            },
        },
    ], [activeCriteria, isReadOnly, isSaving, getStudentTasksAverage]);

    return (
        <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <AppTable
                    data={studentGrades}
                    keyExtractor={r => r.id}
                    columns={columns}
                />
            </div>

            {/* Acciones */}
            {!isReadOnly && (
                <div className="flex justify-end mt-5 gap-3">
                    <button
                        onClick={handleAsentarCalificaciones}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-none active:scale-[0.98]"
                    >
                        <Folder size={14} />
                        Guardar borradores
                    </button>

                    <button
                        onClick={handleConcludeParcial}
                        className="flex items-center gap-2 bg-[#1e88e5] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-extrabold text-sm transition-all shadow-sm active:scale-[0.98]"
                    >
                        <CheckCircle2 size={16} />
                        Concluir Parcial oficial
                    </button>
                </div>
            )}
        </div>
    );
}

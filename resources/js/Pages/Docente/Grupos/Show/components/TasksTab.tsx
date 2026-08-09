import React from 'react';
import AppTable from '@/Components/table/AppTable';
import { Task, StudentGrade } from '../services/constants';
import GradeSelector from './GradeSelector';
import ParcialHeader from '@/Components/common/ParcialHeader';

import { Loader2, Cloud, CalendarDays } from 'lucide-react';

const formatHumanDate = (dateStr?: string) => {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 1 && diffDays < 7) {
        return date.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^\w/, (c) => c.toUpperCase());
    }

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

interface TasksTabProps {
    tasks: Task[];
    setTasks: (t: Task[]) => void;
    studentGrades: StudentGrade[];
    getStudentTasksAverage: (studentId: number) => string;
    saveTasks: (newTasks: Task[]) => void;
    isReadOnly?: boolean;
    isSaving?: boolean;
    themeKey?: string;
}

export default function TasksTab({
    tasks,
    setTasks,
    studentGrades,
    getStudentTasksAverage,
    saveTasks,
    isReadOnly = false,
    isSaving = false,
    themeKey = 'blue'
}: TasksTabProps) {

    // [ESTRATÉGICO] Actualización de UI puramente local para promedios instantáneos
    function handleInstantTaskGrade(taskId: number, studentId: number, scoreVal: string) {
        const updated = tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    calificaciones: {
                        ...t.calificaciones,
                        [studentId]: scoreVal
                    }
                };
            }
            return t;
        });
        setTasks(updated); // Actualiza la UI de inmediato
    }

    function handleTaskGradeChange(taskId: number, studentId: number, scoreVal: string) {
        const updated = tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    calificaciones: {
                        ...t.calificaciones,
                        [studentId]: scoreVal
                    }
                };
            }
            return t;
        });
        saveTasks(updated); // Dispara el guardado en DB
    }

    // [OPTIMIZACIÓN] Memoizar columnas para evitar re-renderizados de los inputs al hacer scroll o sync
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
        ...tasks.map(t => ({
            header: (
                <div className="flex flex-col items-center gap-0.5 min-w-[140px] max-w-[200px] text-center">
                    <span className="text-xs font-normal text-slate-800 truncate w-full" title={t.nombre}>{t.nombre}</span>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium uppercase tracking-tight">
                        <span className="flex items-center gap-0.5"><CalendarDays size={10} /> {formatHumanDate(t.fecha_entrega)}</span>
                        <span>•</span>
                        <span>{t.puntos || 10} pts</span>
                    </div>
                </div>
            ),
            align: 'center' as const,
            accessor: (r: StudentGrade) => (
                <div className="flex justify-center items-center gap-0">
                    <GradeSelector
                        initialValue={t.calificaciones[r.id] ?? ''}
                        max={t.puntos || 10}
                        disabled={isReadOnly}
                        onInstantChange={(val) => handleInstantTaskGrade(t.id, r.id, val)}
                        onChange={(val) => handleTaskGradeChange(t.id, r.id, val)}
                    />
                    <span className="text-sm text-slate-400 font-normal">/{t.puntos || 10}</span>
                </div>
            )
        })),
        {
            header: (
                <div className="flex items-center justify-center gap-2 text-slate-600">
                    Promedio
                    {isSaving && <Loader2 size={12} className="animate-spin text-[#1e88e5]" />}
                    {!isSaving && <Cloud size={12} className="text-slate-300" />}
                </div>
            ),
            align: 'center' as const,
            headerClassName: 'w-32',
            accessor: (r: StudentGrade) => {
                const avg = getStudentTasksAverage(r.id);
                return (
                    <span className="text-sm font-black text-slate-700">
                        {avg}
                    </span>
                );
            }
        }
    ], [tasks, isReadOnly, isSaving, getStudentTasksAverage]); // Solo cambia si cambian las tareas o el estado global

    return (
        <div className="space-y-6">
            <ParcialHeader
                title="Calificación de Tareas y Actividades"
                count={tasks.length}
                themeKey={themeKey}
            />

            {/* Tabla de notas de tareas */}
            {tasks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 font-semibold text-sm">
                    No hay actividades registradas en la plataforma para este parcial. ¡Crea una en la pestaña "Crear y Ver Actividades"!
                </div>
            ) : (
                <AppTable
                    data={studentGrades}
                    keyExtractor={r => r.id}
                    columns={columns}
                />
            )}
        </div>
    );
}

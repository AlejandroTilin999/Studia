import React from 'react';
import AppTable from '@/Components/table/AppTable';
import { Task, StudentGrade } from '../services/constants';
import GradeSelector from './GradeSelector';
import ParcialHeader from '@/Components/common/ParcialHeader';

import { Loader2, Cloud, CalendarDays } from 'lucide-react';

const formatHumanDate = (dateStr?: string, timeStr?: string, deadlineStr?: string) => {
    if (deadlineStr && deadlineStr !== 'Sin fecha') return deadlineStr;
    if (!dateStr) return 'Sin fecha';

    let combinedStr = dateStr.trim();
    if (timeStr && timeStr.trim() !== '' && !combinedStr.includes(' ') && !combinedStr.includes('T')) {
        combinedStr = `${combinedStr} ${timeStr.trim()}`;
    }

    const normalizedStr = combinedStr.includes(' ') 
        ? combinedStr.replace(' ', 'T') 
        : (!combinedStr.includes('T') ? combinedStr + 'T00:00:00' : combinedStr);
    
    const date = new Date(normalizedStr);

    if (isNaN(date.getTime())) return dateStr;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const hasTime = combinedStr.includes(' ') || combinedStr.includes('T') || (timeStr && timeStr.trim() !== '');

    return hasTime ? `${day}/${month}/${year} ${formattedTime}` : `${day}/${month}/${year}`;
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
                        <span className="flex items-center gap-0.5"><CalendarDays size={10} /> {formatHumanDate(t.fecha_entrega, t.hora_entrega, (t as any).deadline)}</span>
                        <span>•</span>
                        <span>{t.puntos || 10} pts</span>
                    </div>
                </div>
            ),
            align: 'center' as const,
            accessor: (r: StudentGrade) => {
                const studentFile = t.archivos?.[r.id];
                const hasDelivery = Boolean(studentFile && (studentFile.url || studentFile.raw_url || studentFile.estatus === 'submitted' || studentFile.estatus === 'entregado' || studentFile.estatus === 'graded'));
                const studentGradeVal = t.calificaciones?.[r.id];
                const hasGrade = studentGradeVal !== "" && studentGradeVal !== undefined && studentGradeVal !== null;
                const canGrade = hasDelivery || hasGrade;

                return (
                    <div className="flex justify-center items-center gap-0" title={!canGrade ? "No se puede calificar porque el alumno no ha entregado la tarea" : undefined}>
                        <GradeSelector
                            initialValue={t.calificaciones[r.id] ?? ''}
                            max={t.puntos || 10}
                            disabled={isReadOnly || !canGrade}
                            onInstantChange={(val) => handleInstantTaskGrade(t.id, r.id, val)}
                            onChange={(val) => handleTaskGradeChange(t.id, r.id, val)}
                        />
                        <span className="text-sm text-slate-400 font-normal">/{t.puntos || 10}</span>
                    </div>
                );
            }
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

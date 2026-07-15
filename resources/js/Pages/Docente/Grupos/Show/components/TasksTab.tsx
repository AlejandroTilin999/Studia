import React from 'react';
import AppTable from '@/Components/table/AppTable';
import { Task, StudentGrade } from '../services/constants';

interface TasksTabProps {
    tasks: Task[];
    studentGrades: StudentGrade[];
    getStudentTasksAverage: (studentId: number) => string;
    saveTasks: (newTasks: Task[]) => void;
}

export default function TasksTab({
    tasks,
    studentGrades,
    getStudentTasksAverage,
    saveTasks
}: TasksTabProps) {

    function handleTaskGradeChange(taskId: number, studentId: number, scoreVal: string) {
        const updated = tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    grades: {
                        ...t.grades,
                        [studentId]: scoreVal
                    }
                };
            }
            return t;
        });
        saveTasks(updated);
    }

    return (
        <div className="space-y-6">
            {/* Tabla de notas de tareas */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {tasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-semibold text-sm">
                        No hay actividades registradas en la plataforma para este parcial. ¡Crea una en la pestaña "Crear y Ver Actividades"!
                    </div>
                ) : (
                    <AppTable
                        data={studentGrades}
                        keyExtractor={r => r.id}
                        columns={[
                            {
                                header: 'Matrícula',
                                accessor: r => r.matricula,
                                className: 'text-sm text-slate-500',
                            },
                            {
                                header: 'Alumno',
                                accessor: r => r.name,
                                className: 'text-sm text-slate-500',
                            },
                            ...tasks.map(t => ({
                                header: (
                                    <div className="flex flex-col items-center gap-0.5 min-w-[140px] max-w-[200px] text-center">
                                        <span className="text-xs font-semibold text-slate-700 truncate w-full" title={t.name}>{t.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400">Máx: {t.points || 10} pts</span>
                                    </div>
                                ),
                                align: 'center' as const,
                                accessor: (r: StudentGrade) => (
                                    <div className="flex justify-center">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max={t.points || 10}
                                            value={t.grades[r.id] ?? ''}
                                            onChange={e => handleTaskGradeChange(t.id, r.id, e.target.value)}
                                            placeholder="—"
                                            className="w-16 text-center text-sm py-1.5 px-1 bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-slate-700 transition-all outline-none"
                                        />
                                    </div>
                                )
                            })),
                            {
                                header: 'Promedio Tareas',
                                align: 'center' as const,
                                headerClassName: 'w-28 text-slate-600',
                                accessor: (r: StudentGrade) => {
                                    const avg = getStudentTasksAverage(r.id);
                                    return (
                                        <span className="text-sm font-black text-slate-700">
                                            {avg}
                                        </span>
                                    );
                                }
                            }
                        ]}
                    />
                )}
            </div>
        </div>
    );
}

import * as React from 'react';
import StudentTaskCard from './Componentes/StudentTaskCard';

interface Task {
    id: number;
    subjectName?: string;
    title: string;
    status: string;
    desc: string;
    points?: string;
    deadline?: string;
}

interface SubjectClassworkProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
    themeKey?: string;
}

export default function SubjectClasswork({ tasks, onSelectTask, themeKey = 'blue' }: SubjectClassworkProps) {
    return (
        <div className="space-y-6 text-left pt-2 w-full">
            {/* Header info */}
            <div>
                <h4 className="text-lg font-bold text-slate-800 tracking-tight">Trabajos escolares</h4>
                <p className="text-xs text-slate-400 font-normal mt-0.5">Listado completo de actividades del ciclo escolar</p>
            </div>

            {/* List of Tasks */}
            <div className="w-full">
                {tasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-xl">
                        No hay tareas registradas en esta asignatura.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200/80 w-full">
                        {tasks.map((task) => (
                            <StudentTaskCard
                                key={task.id}
                                task={task}
                                onSelectTask={onSelectTask}
                                themeKey={themeKey}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

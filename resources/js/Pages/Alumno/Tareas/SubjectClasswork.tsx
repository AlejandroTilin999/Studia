import * as React from 'react';
import StudentTaskCard from './Componentes/StudentTaskCard';
import ParcialHeader from '@/Components/common/ParcialHeader';

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
            {/* Header info con estilo dinámico homogado */}
            <ParcialHeader
                title="Trabajos escolares"
                count={tasks.length}
                themeKey={themeKey}
            />

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

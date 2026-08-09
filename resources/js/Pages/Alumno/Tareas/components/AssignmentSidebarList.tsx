import React from 'react';

interface Task {
    id: number;
    title: string;
    status: string;
    desc: string;
    points?: string;
    deadline?: string;
}

interface AssignmentSidebarListProps {
    otherTasks: Task[];
    currentTaskId: number;
    onSwitchTask: (task: Task) => void;
}

export default function AssignmentSidebarList({
    otherTasks,
    currentTaskId,
    onSwitchTask
}: AssignmentSidebarListProps) {
    if (!otherTasks || otherTasks.length === 0) return null;

    return (
        <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Otras actividades asignadas
            </h4>
            <div className="space-y-2">
                {otherTasks.map((t) => {
                    const isSelected = t.id === currentTaskId;
                    return (
                        <button
                            key={t.id}
                            onClick={() => onSwitchTask(t)}
                            className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 ${
                                isSelected
                                    ? 'bg-blue-50/60 border-blue-200 font-bold text-blue-900'
                                    : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700 font-medium'
                            }`}
                        >
                            <span className="truncate flex-1">{t.title}</span>
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                                    t.status === 'Entregado'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {t.status}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

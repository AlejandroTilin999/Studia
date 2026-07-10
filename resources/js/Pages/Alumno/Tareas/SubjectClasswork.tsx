import * as React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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
}

export default function SubjectClasswork({ tasks, onSelectTask }: SubjectClassworkProps) {
    return (
        <div className="space-y-6 text-left pt-2">
            {/* Header info */}
            <div>
                <h4 className="text-sm font-bold text-slate-700">Trabajos escolares</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Listado completo de actividades del ciclo escolar</p>
            </div>

            {/* List of Tasks cards */}
            <div className="grid grid-cols-1 gap-4">
                {tasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-[24px]">
                        No hay tareas registradas en esta asignatura.
                    </div>
                ) : (
                    tasks.map((task) => {
                        const isDelivered = task.status === 'Entregado';
                        return (
                            <div 
                                key={task.id}
                                onClick={() => onSelectTask(task)}
                                className="group bg-white border border-slate-200 rounded-[24px] p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer transition-all hover:border-slate-350 hover:shadow-sm"
                            >
                                {/* Left Info block */}
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`p-3 rounded-xl shrink-0 transition-colors ${
                                        isDelivered 
                                            ? 'bg-emerald-50 text-emerald-600' 
                                            : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        <FileText size={20} className="stroke-[2]" />
                                    </div>
                                    
                                    <div className="min-w-0 space-y-1">
                                        <span className="font-extrabold text-sm text-slate-800 block truncate group-hover:text-[#0266E0] transition-colors leading-snug">
                                            {task.title}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                Límite: {task.deadline}
                                            </span>
                                            <span>•</span>
                                            <span>{task.points || '100 puntos'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Action/Status Block */}
                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                                        isDelivered
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                        {isDelivered ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

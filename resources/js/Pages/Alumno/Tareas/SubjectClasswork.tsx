import * as React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

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
                    <div className="p-12 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-xl">
                        No hay tareas registradas en esta asignatura.
                    </div>
                ) : (
                    tasks.map((task) => {
                        const isDelivered = task.status === 'Entregado' || task.status === 'Calificado';
                        return (
                            <div
                                key={task.id}
                                onClick={() => onSelectTask(task)}
                                className="group bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer transition-all hover:border-blue-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                            >
                                {/* Left Info block */}
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="min-w-0 space-y-1 text-left px-2">
                                        <span className="font-bold text-sm text-slate-800 block truncate group-hover:text-[#0266E0] transition-colors leading-tight">
                                            {task.title}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} className="text-slate-300" />
                                                Límite: {task.deadline}
                                            </span>
                                            <span className="text-slate-200">•</span>
                                            <span>{task.points || '100 puntos'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Action/Status Block */}
                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold border ${
                                        task.status === 'Calificado'
                                            ? 'bg-blue-50 text-[#0266E0] border-blue-100'
                                            : isDelivered
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                                    }`}>
                                        {task.status === 'Calificado' ? <CheckCircle size={10} /> : isDelivered ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                        {task.status}
                                    </span>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#0266E0] group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

import React from 'react';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import type { StudentTask } from '@/types/alumno';

export interface StudentTaskItemProps {
    task: StudentTask;
    onSelectTask: (task: StudentTask) => void;
    themeKey?: string;
}

export default function StudentTaskCard({ task, onSelectTask, themeKey = 'blue' }: StudentTaskItemProps) {
    const isDelivered = task.status === 'Entregado' || task.status === 'Calificado';
    const isOverdue = task.status === 'Vencida' || task.isOverdue === true;
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div 
            onClick={() => onSelectTask(task)}
            className="py-4 sm:py-5 border-b border-slate-200/80 last:border-b-0 space-y-3 cursor-pointer group hover:bg-slate-50/60 transition-all rounded-xl p-3 sm:p-4 text-left"
        >
            {/* Header Directo Responsivo (Icono + Título + Badge de Estatus) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div
                        style={{ backgroundColor: activeTheme.strokeColor }}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shrink-0 mt-0.5 font-bold transition-transform group-hover:scale-105 shadow-2xs"
                    >
                        <ClipboardList size={18} />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                        <h4 
                            className={`text-sm sm:text-base font-extrabold text-slate-900 tracking-tight transition-colors group-hover:${activeTheme.text}`}
                        >
                            <span className="group-hover:underline">{task.title}</span>
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 font-medium">
                            <span>{task.deadline ? `Fecha límite: ${task.deadline}` : 'Sin fecha límite'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-extrabold text-slate-700">{task.points || '10 puntos'}</span>
                        </div>
                    </div>
                </div>

                {/* Badge de Estatus a la Derecha (Alineado limpiamente) */}
                <div className="shrink-0 self-start sm:self-auto pl-12 sm:pl-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border transition-all shadow-2xs ${
                        task.status === 'Calificado'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isOverdue
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                        {task.status || 'Pendiente'}
                    </span>
                </div>
            </div>

            {/* Descripción Inline (Padding ajustado para móviles) */}
            {task.desc && task.desc !== 'Sin descripción' && (
                <div className="pl-0 sm:pl-14 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                    {task.desc}
                </div>
            )}

            {/* Botón Ver Tarea */}
            <div className="pl-0 sm:pl-14 pt-1 flex justify-start">
                <span 
                    style={{ color: activeTheme.strokeColor }}
                    className="inline-flex items-center gap-1 text-xs font-black hover:underline"
                >
                    <span>Ver Tarea</span>
                    <ChevronRight size={14} className="stroke-[2.5]" />
                </span>
            </div>
        </div>
    );
}

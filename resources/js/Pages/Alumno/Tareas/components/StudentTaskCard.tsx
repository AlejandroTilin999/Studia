import React from 'react';
import { FileText, Download, ChevronRight } from 'lucide-react';
import { COLOR_THEMES } from '@/constants/ColorThemes';

export interface StudentTaskItemProps {
    task: {
        id: number;
        title: string;
        desc?: string;
        deadline?: string;
        points?: string;
        status?: string;
        attachments?: { name: string; url?: string }[];
    };
    onSelectTask: (task: any) => void;
    themeKey?: string;
}

export default function StudentTaskCard({ task, onSelectTask, themeKey = 'blue' }: StudentTaskItemProps) {
    const isDelivered = task.status === 'Entregado' || task.status === 'Calificado';
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div 
            onClick={() => onSelectTask(task)}
            className="py-5 border-b border-slate-200/90 last:border-b-0 space-y-3 cursor-pointer group hover:bg-slate-50/50 transition-all rounded-xl px-3 text-left"
        >
            {/* Header Directo Minimalista (Estilo Google Classroom) */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div
                        style={{ backgroundColor: `${activeTheme.strokeColor}18`, color: activeTheme.strokeColor }}
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold transition-transform group-hover:scale-105"
                    >
                        <FileText size={20} />
                    </div>

                    <div className="space-y-1 min-w-0">
                        <h4 
                            style={{ color: undefined }}
                            className={`text-base font-bold text-slate-800 tracking-tight transition-colors group-hover:${activeTheme.text}`}
                        >
                            <span className="group-hover:underline">{task.title}</span>
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-normal">
                            <span>{task.deadline ? `Fecha límite: ${task.deadline}` : 'Sin fecha límite'}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{task.points || '10 pts'}</span>
                        </div>
                    </div>
                </div>

                {/* Badge de Estatus a la Derecha */}
                <div className="shrink-0 pt-0.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        task.status === 'Calificado'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                        {task.status || 'Pendiente'}
                    </span>
                </div>
            </div>

            {/* Descripción Inline */}
            {task.desc && task.desc !== 'Sin descripción' && (
                <div className="pl-14 text-xs md:text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                    {task.desc}
                </div>
            )}

            {/* Adjuntos */}
            {task.attachments && task.attachments.length > 0 && (
                <div className="pl-14 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl">
                            <div className="flex items-center gap-2 truncate">
                                <FileText size={15} style={{ color: activeTheme.strokeColor }} />
                                <span className="text-xs text-slate-700 font-medium truncate">{file.name}</span>
                            </div>
                            <Download size={14} className="text-slate-400" />
                        </div>
                    ))}
                </div>
            )}

            {/* Botón Ver Tarea */}
            <div className="pl-14 pt-1 flex justify-start">
                <span 
                    style={{ color: activeTheme.strokeColor }}
                    className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
                >
                    <span>Ver Tarea</span>
                    <ChevronRight size={14} />
                </span>
            </div>
        </div>
    );
}

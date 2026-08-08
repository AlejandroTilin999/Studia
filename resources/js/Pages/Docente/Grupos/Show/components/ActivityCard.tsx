import React from 'react';
import { FileText, Pencil, Trash2, Download, ChevronRight } from 'lucide-react';
import { Task } from '../services/constants';
import { cn } from '@/lib/utils';
import { COLOR_THEMES } from '@/constants/ColorThemes';

const formatHumanDate = (dateStr?: string) => {
    if (!dateStr) return 'Sin fecha';
    
    // Si la cadena contiene espacio (ej: '2026-08-09 13:00:00'), formatear con hora incluida
    const hasTime = dateStr.includes(' ');
    const normalizedStr = hasTime ? dateStr.replace(' ', 'T') : dateStr + 'T00:00:00';
    const date = new Date(normalizedStr);

    if (isNaN(date.getTime())) return dateStr;

    const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

    return hasTime ? `${formattedDate}, ${formattedTime}` : formattedDate;
};

export interface ActivityCardProps {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onSelectTask: (id: number) => void;
    isReadOnly?: boolean;
    themeKey?: string;
}

export default function ActivityCard({
    task,
    index,
    onEdit,
    onDelete,
    onSelectTask,
    isReadOnly = false,
    themeKey = 'blue'
}: ActivityCardProps) {
    const isExpired = task.fecha_entrega && new Date(task.fecha_entrega + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0));
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div className="py-5 border-b border-slate-200/90 last:border-b-0 space-y-4">
            {/* Header Limpio (Estilo Google Classroom Directo) */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div
                        style={{ backgroundColor: `${activeTheme.strokeColor}18`, color: activeTheme.strokeColor }}
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold"
                    >
                        <FileText size={20} />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-800 tracking-tight">
                                {task.nombre}
                            </h4>
                            {isExpired && (
                                <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                                    Vencida
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-normal">
                            <span>{task.fecha_entrega ? `Fecha límite: ${formatHumanDate(task.fecha_entrega)}` : 'Sin fecha límite'}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{task.puntos || 10} pts</span>
                        </div>
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => onEdit(task)}
                            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-all"
                            title="Editar"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-slate-100 transition-all"
                            title="Eliminar"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Contenido / Descripción */}
            {task.descripcion && (
                <div className="pl-14 text-xs md:text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                    {task.descripcion}
                </div>
            )}

            {/* Adjuntos */}
            {task.attachments && task.attachments.length > 0 && (
                <div className="pl-14 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl">
                            <div className="flex items-center gap-2 truncate">
                                <FileText size={15} className={activeTheme.text} />
                                <span className="text-xs text-slate-700 font-medium truncate">{file.name}</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-700 p-1 transition-all">
                                <Download size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Botón Ver Entregas */}
            <div className="pl-14 pt-1 flex justify-start">
                <button
                    type="button"
                    onClick={() => onSelectTask(task.id)}
                    className={cn("flex items-center gap-1.5 text-xs font-bold transition-colors hover:underline", activeTheme.text)}
                >
                    <span>Ver Entregas y Calificar</span>
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

import React from 'react';
import { FileText, Pencil, Trash2, ExternalLink, ChevronRight } from 'lucide-react';
import { Task } from '../services/constants';
import { cn } from '@/lib/utils';
import PdfIcon from '@/Components/ui/PdfIcon';
import { COLOR_THEMES } from '@/constants/ColorThemes';

const formatHumanDate = (dateStr?: string) => {
    if (!dateStr) return 'Sin fecha';

    const hasTime = dateStr.includes(' ') || dateStr.includes('T');
    const normalizedStr = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : (!dateStr.includes('T') ? dateStr + 'T00:00:00' : dateStr);
    const date = new Date(normalizedStr);

    if (isNaN(date.getTime())) return dateStr;

    // Formato largo (ej: 09 de Agosto, 12:00 AM)
    const day = date.toLocaleDateString('es-ES', { day: '2-digit' });
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return hasTime ? `${day} de ${capitalizedMonth}, ${formattedTime}` : `${day} de ${capitalizedMonth}`;
};

export interface ActivityCardProps {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onSelectTask: (id: number) => void;
    isReadOnly?: boolean;
    themeKey?: string;
    totalStudents?: number;
}

export default function ActivityCard({
    task,
    index,
    onEdit,
    onDelete,
    onSelectTask,
    isReadOnly = false,
    themeKey = 'blue',
    totalStudents = 0
}: ActivityCardProps) {
    const isExpired = task.fecha_entrega && new Date(task.fecha_entrega + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0));
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    // Calcular estadísticas de entregas, pendientes y calificadas
    const archivosEntries = Object.entries(task.archivos || {});
    const calificacionesEntries = Object.entries(task.calificaciones || {});

    // Una tarea se considera entregada si el estatus es 'submitted', 'graded' o 'entregado' (y no 'pending')
    const entregadasCount = archivosEntries.filter(([_, val]) => {
        if (!val) return false;
        const estatus = (val.estatus || '').toLowerCase();
        if (estatus === 'pending') return false;
        return estatus === 'submitted' || estatus === 'graded' || estatus === 'entregado' || estatus === 'entregada';
    }).length;

    const calificadasCount = calificacionesEntries.filter(([_, val]) => {
        if (val === "" || val === undefined || val === null) return false;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
    }).length;
    
    // Si totalStudents está disponible, usarlo como total del grupo; de lo contrario usar asignadas a la tarea o 1
    const totalGrupo = totalStudents > 0 ? totalStudents : (calificacionesEntries.length > 0 ? calificacionesEntries.length : 1);
    const pendientesCount = Math.max(0, totalGrupo - entregadasCount);

    return (
        <div className="py-5 border-b border-slate-200/90 last:border-b-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Izquierda: Info de la tarea */}
            <div className="space-y-3.5 flex-1 min-w-0">
                {/* Header Título e Icono */}
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
                            <span className="font-semibold text-slate-700">{task.puntos || 10} puntos</span>
                        </div>
                    </div>
                </div>

                {/* Contenido / Descripción */}
                {task.descripcion && (
                    <div className="pl-14 text-xs md:text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                        {task.descripcion}
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

            {/* Derecha: Estadísticas centradas verticalmente + botones de edición */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 shrink-0 sm:self-center pl-14 sm:pl-0 pt-3 sm:pt-0">
                {/* Estadísticas (Entregadas / Pendientes / Calificadas) */}
                <div className="flex items-center justify-between sm:justify-start gap-6 sm:gap-7 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-4xl font-light text-slate-700 leading-none">
                            {entregadasCount}
                        </span>
                        <span className="text-xs font-normal text-slate-400 mt-1.5">
                            Entregadas
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-4xl font-light text-slate-700 leading-none">
                            {pendientesCount}
                        </span>
                        <span className="text-xs font-normal text-slate-400 mt-1.5">
                            Pendientes
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-4xl font-light text-slate-700 leading-none">
                            {calificadasCount}
                        </span>
                        <span className="text-xs font-normal text-slate-400 mt-1.5">
                            Calificadas
                        </span>
                    </div>
                </div>

                {/* Botones de edición/eliminación (Solo íconos en gris, colocados abajo en móvil) */}
                {!isReadOnly && (
                    <div className="flex items-center justify-end sm:justify-start gap-1 pt-1.5 sm:pt-0 border-t border-slate-100 sm:border-t-0">
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
        </div>
    );
}

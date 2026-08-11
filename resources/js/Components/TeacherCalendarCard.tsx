import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export interface CalendarEvent {
    id: number | string;
    title: string;
    category?: string;
    start: string; // Formato YYYY-MM-DD
    end?: string | null;
    description?: string;
}

interface TeacherCalendarCardProps {
    events?: CalendarEvent[];
}

export default function TeacherCalendarCard({ events = [] }: TeacherCalendarCardProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Obtener información del mes actual
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Días en el mes y día en que empieza la semana
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo

    // Navegación de meses
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Función para obtener la categoría/evento de un día específico
    const getEventForDay = (day: number) => {
        const dayString = day < 10 ? `0${day}` : `${day}`;
        const monthString = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
        const targetDate = `${year}-${monthString}-${dayString}`;

        return events.find((evt) => evt.start === targetDate);
    };

    // Estilos de color en la rejilla del calendario según la categoría
    const getDayStyles = (event?: CalendarEvent, isToday: boolean = false) => {
        if (!event) {
            return isToday
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200'
                : 'text-slate-700 hover:bg-slate-100 font-medium';
        }

        const catUpper = (event.category || '').toUpperCase();

        if (catUpper.includes('EXAMEN') || catUpper.includes('EVALUACIÓN')) {
            return 'bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-200 ring-2 ring-emerald-200';
        }
        if (catUpper.includes('TAREA') || catUpper.includes('ENTREGA')) {
            return 'bg-amber-500 text-white font-bold shadow-sm shadow-amber-200 ring-2 ring-amber-200';
        }
        if (catUpper.includes('URGENTE') || catUpper.includes('INHÁBIL') || catUpper.includes('INHABIL') || catUpper.includes('SUSPENSIÓN')) {
            return 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-200 ring-2 ring-rose-200';
        }

        // Categoría por defecto (Capacitación / Inicio / General)
        return 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-200 ring-2 ring-indigo-200';
    };

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm select-none">
            {/* Encabezado con Mes, Año y Navegación */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-blue-600" />
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight capitalize">
                        {monthNames[month]} <span className="text-slate-400 font-normal">{year}</span>
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Mes anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Mes siguiente"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map((day) => (
                    <span key={day} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {day}
                    </span>
                ))}
            </div>

            {/* Rejilla de días */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Días en blanco antes del primer día del mes */}
                {Array.from({ length: firstDayIndex }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-8 w-8" />
                ))}

                {/* Días del mes con resaltado de color */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const event = getEventForDay(day);
                    const isToday = isCurrentMonth && today.getDate() === day;

                    return (
                        <div
                            key={day}
                            title={event ? `${event.title} (${event.category || 'Evento'})` : undefined}
                            className={`h-8 w-8 mx-auto flex items-center justify-center rounded-lg transition-all text-[12px] cursor-pointer relative ${getDayStyles(
                                event,
                                isToday
                            )}`}
                        >
                            {day}
                            {/* Punto indicador secundario si coincide con hoy y tiene evento */}
                            {event && isToday && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Leyenda de colores */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 inline-block" />
                    <span>Evaluación</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md bg-rose-500 inline-block" />
                    <span>Inhábil / Suspensión</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md bg-amber-500 inline-block" />
                    <span>Entregas / Tareas</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md bg-indigo-600 inline-block" />
                    <span>Capacitación / General</span>
                </div>
            </div>
        </div>
    );
}
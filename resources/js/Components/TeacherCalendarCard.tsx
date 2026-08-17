import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    // Lógica para calcular días del mes con inicio en Lunes
    const { days, monthName, year, monthIndex } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Lunes = 0, Domingo = 6
        let startingDay = firstDayOfMonth.getDay() - 1;
        if (startingDay === -1) startingDay = 6;

        const daysArray = [];

        for (let i = 0; i < startingDay; i++) {
            daysArray.push(null);
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            daysArray.push(i);
        }

        return {
            days: daysArray,
            monthName: monthNames[month],
            year,
            monthIndex: month
        };
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Función para obtener eventos de un día específico
    const getEventForDay = (day: number) => {
        const dayString = day < 10 ? `0${day}` : `${day}`;
        const monthString = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
        const targetDate = `${year}-${monthString}-${dayString}`;

        return events.find((evt) => evt.start === targetDate);
    };

    // Estilos de color en la rejilla del calendario (Círculos completos planos según la categoría)
    const getDayStyles = (event?: CalendarEvent, isToday: boolean = false) => {
        if (isToday) {
            return 'bg-[#0266E0] text-white font-medium rounded-full';
        }

        if (!event) {
            return 'bg-transparent text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900 rounded-full';
        }

        const catUpper = (event.category || '').toUpperCase();

        if (catUpper.includes('EXAMEN') || catUpper.includes('EVALUACIÓN')) {
            return 'bg-emerald-500 text-white font-medium rounded-full';
        }
        if (catUpper.includes('TAREA') || catUpper.includes('ENTREGA')) {
            return 'bg-amber-500 text-white font-medium rounded-full';
        }
        if (catUpper.includes('URGENTE') || catUpper.includes('INHÁBIL') || catUpper.includes('INHABIL') || catUpper.includes('SUSPENSIÓN')) {
            return 'bg-rose-500 text-white font-medium rounded-full';
        }

        // Categoría por defecto (Capacitación / Inicio / General)
        return 'bg-indigo-600 text-white font-medium rounded-full';
    };

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-none select-none text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center gap-2.5">
                    <CalendarIcon size={18} className="text-slate-800" strokeWidth={2} />
                    <span className="font-normal text-slate-800 text-sm tracking-tight">
                        {monthName} {year}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-800 border-none bg-transparent"
                        title="Mes anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-800 border-none bg-transparent"
                        title="Mes siguiente"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="px-1">
                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {daysOfWeek.map((d) => (
                        <span key={d} className="text-[10px] font-normal text-slate-400 tracking-tight uppercase">
                            {d}
                        </span>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-2.5 gap-x-1 text-center">
                    {days.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} className="h-8 w-8" />;

                        const isToday = isCurrentMonth && today.getDate() === day;
                        const event = getEventForDay(day);

                        return (
                            <div key={idx} className="h-8 w-8 flex items-center justify-center mx-auto">
                                <div
                                    title={event ? `${event.title} (${event.category || 'Evento'})` : undefined}
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all border-none cursor-pointer
                                        ${getDayStyles(event, isToday)}
                                    `}
                                >
                                    <span>{day}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
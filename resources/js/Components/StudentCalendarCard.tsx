import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

interface StudentCalendarCardProps {
    // En el futuro podrías pasar eventos reales aquí
    events?: Record<string, 'examen' | 'tarea' | 'urgente'>;
}

export default function StudentCalendarCard({ events = {} }: StudentCalendarCardProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    // Lógica para calcular los días del mes actual
    const { days, monthName, year } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Primer día del mes
        const firstDayOfMonth = new Date(year, month, 1);
        // Último día del mes
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Ajustar el inicio de la semana (Lunes = 0, Domingo = 6)
        let startingDay = firstDayOfMonth.getDay() - 1;
        if (startingDay === -1) startingDay = 6; // Domingo

        const daysArray = [];

        // Espacios vacíos para el inicio del mes
        for (let i = 0; i < startingDay; i++) {
            daysArray.push(null);
        }

        // Días del mes
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            daysArray.push(i);
        }

        return {
            days: daysArray,
            monthName: months[month],
            year
        };
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
        setSelectedDay(null); // Limpiar selección al cambiar mes
    };

    return (
        <div className="bg-white select-none transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-800" strokeWidth={2} />
                    <span className="font-normal text-slate-800 text-sm tracking-tight min-w-[100px]">
                        {monthName} {year}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-800"
                        title="Mes anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-800"
                        title="Mes siguiente"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Days Content */}
            <div className="px-1">
                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {daysOfWeek.map((d) => (
                        <span key={d} className="text-[10px] font-normal text-slate-400 tracking-tight uppercase">{d}</span>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-2.5 gap-x-1 text-center">
                    {days.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} className="h-8 w-8" />;

                        const isToday = day === new Date().getDate() &&
                                        currentDate.getMonth() === new Date().getMonth() &&
                                        currentDate.getFullYear() === new Date().getFullYear();

                        const isSelected = day === selectedDay;

                        // Simulación de puntos de eventos para demostración
                        const hasExamen = (day === 12 || day === 25);
                        const hasTarea = (day === 5 || day === 18);

                        return (
                            <div key={idx} className="h-8 w-8 flex items-center justify-center relative mx-auto">
                                <button
                                    onClick={() => setSelectedDay(day)}
                                    className={`
                                        w-8 h-8 rounded-xl flex flex-col items-center justify-center text-xs transition-all border-none
                                        ${isSelected
                                            ? 'bg-[#1e88e5] text-white font-normal'
                                            : isToday
                                                ? 'bg-blue-50 text-[#1e88e5] font-normal'
                                                : 'bg-transparent text-slate-500 font-normal hover:bg-slate-50 hover:text-slate-800'
                                        }
                                    `}
                                >
                                    <span>{day}</span>

                                    {/* Indicadores de eventos (Solo si no está seleccionado para no tapar) */}
                                    {!isSelected && (
                                        <div className="absolute bottom-1 flex gap-0.5">
                                            {hasExamen && <div className="w-1 h-1 rounded-full bg-rose-500" />}
                                            {hasTarea && <div className="w-1 h-1 rounded-full bg-amber-500" />}
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

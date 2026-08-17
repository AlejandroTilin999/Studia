import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerEsProps {
    value: string; // YYYY-MM-DD
    onChange: (val: string) => void;
    placeholder?: string;
    required?: boolean;
    hasError?: boolean;
}

const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export default function DatePickerEs({ value, onChange, placeholder = 'dd/mm/aaaa', required = false, hasError = false }: DatePickerEsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [alignRight, setAlignRight] = useState(false);

    // Parse selected date
    const parsedDate = value ? new Date(value + 'T00:00:00') : null;
    const initialView = parsedDate || new Date();

    const [viewYear, setViewYear] = useState(initialView.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialView.getMonth());

    const containerRef = useRef<HTMLDivElement>(null);

    // Calcula si debe desplegarse hacia arriba o hacia la derecha para no salirse de la pantalla
    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Si hay menos de 330px de espacio libre abajo y hay suficiente espacio arriba, abre hacia arriba
            if (spaceBelow < 330 && spaceAbove > 280) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }

            // Si el calendario se saldría del borde derecho de la ventana
            if (rect.left + 288 > window.innerWidth - 16) {
                setAlignRight(true);
            } else {
                setAlignRight(false);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    useEffect(() => {
        if (value) {
            const d = new Date(value + 'T00:00:00');
            if (!isNaN(d.getTime())) {
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
            }
        }
    }, [value]);

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(v => v - 1);
        } else {
            setViewMonth(v => v - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(v => v + 1);
        } else {
            setViewMonth(v => v + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        const m = String(viewMonth + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const dateStr = `${viewYear}-${m}-${d}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    const handleSelectToday = (e: React.MouseEvent) => {
        e.preventDefault();
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        onChange('');
        setIsOpen(false);
    };

    // Calculate grid days
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const formattedValue = parsedDate
        ? `${String(parsedDate.getDate()).padStart(2, '0')}/${String(parsedDate.getMonth() + 1).padStart(2, '0')}/${parsedDate.getFullYear()}`
        : '';

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer transition-all ${
                    hasError
                        ? 'bg-rose-50/40 border-rose-400 ring-1 ring-rose-400'
                        : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 focus-within:ring-1 focus-within:ring-[#1e88e5]'
                }`}
            >
                <span className={formattedValue ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    {formattedValue || placeholder}
                </span>
                <CalendarIcon size={16} className="text-slate-400 shrink-0" />
            </div>

            {isOpen && (
                <div
                    className={`absolute bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-4 z-50 w-72 animate-in fade-in zoom-in-95 duration-150 select-none ${
                        openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
                    } ${
                        alignRight ? 'right-0' : 'left-0'
                    }`}
                >
                    {/* Month / Year Header */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            {MONTHS_ES[viewMonth]} {viewYear}
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Days of week */}
                    <div className="grid grid-cols-7 text-center gap-1 mb-2">
                        {DAYS_ES.map((day, idx) => (
                            <span key={idx} className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                {day}
                            </span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 text-center gap-1">
                        {/* Prev Month Days */}
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
                            const prevDay = daysInPrevMonth - firstDayOfMonth + idx + 1;
                            return (
                                <span key={`prev-${idx}`} className="text-xs text-slate-300 py-1.5 font-normal">
                                    {prevDay}
                                </span>
                            );
                        })}

                        {/* Current Month Days */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const day = idx + 1;
                            const isSelected = parsedDate &&
                                parsedDate.getFullYear() === viewYear &&
                                parsedDate.getMonth() === viewMonth &&
                                parsedDate.getDate() === day;

                            const isToday = new Date().getFullYear() === viewYear &&
                                new Date().getMonth() === viewMonth &&
                                new Date().getDate() === day;

                            return (
                                <button
                                    key={`curr-${day}`}
                                    type="button"
                                    onClick={() => handleSelectDay(day)}
                                    className={`text-xs py-1.5 rounded-xl font-medium transition-all ${
                                        isSelected
                                            ? 'bg-[#1e88e5] text-white font-bold shadow-sm'
                                            : isToday
                                                ? 'border border-[#1e88e5] text-[#1e88e5] font-bold hover:bg-blue-50'
                                                : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-slate-400 hover:text-slate-600 font-bold transition-colors"
                        >
                            Borrar
                        </button>
                        <button
                            type="button"
                            onClick={handleSelectToday}
                            className="text-[#1e88e5] hover:text-blue-700 font-bold transition-colors"
                        >
                            Hoy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

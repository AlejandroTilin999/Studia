import { useEffect, useState } from 'react';
import { Mail, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { SCHOOL_CONTACT } from '@/constants/SchoolContact';
import ContactButton from './ContactButton';
import TeacherCalendarCard, { CalendarEvent } from './TeacherCalendarCard';

interface TeacherRightSidebarProps {
    initialEvents?: CalendarEvent[];
    tasks?: any[];
}

export default function TeacherRightSidebar({ initialEvents = [] }: TeacherRightSidebarProps) {
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [loading, setLoading] = useState<boolean>(events.length === 0);

    useEffect(() => {
        if (initialEvents.length > 0) {
            setEvents(initialEvents);
            setLoading(false);
        } else {
            fetch('/calendar/events')
                .then((res) => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                })
                .then((data: CalendarEvent[]) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setEvents(data);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [initialEvents]);

    // Asignar colores de badge según la categoría del Excel
    const getBadgeStyles = (category: string = '') => {
        const catUpper = category.toUpperCase();
        if (catUpper.includes('EXAMEN') || catUpper.includes('EVALUACIÓN')) {
            return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        }
        if (catUpper.includes('TAREA') || catUpper.includes('ENTREGA')) {
            return 'bg-amber-50 text-amber-600 border-amber-100';
        }
        if (catUpper.includes('URGENTE') || catUpper.includes('INHÁBIL') || catUpper.includes('INHABIL')) {
            return 'bg-rose-50 text-rose-600 border-rose-100';
        }
        return 'bg-blue-50 text-blue-600 border-blue-100'; // Aviso / General
    };

    return (
        <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-slate-100 p-6 lg:px-8 flex flex-col justify-between shrink-0 lg:h-full overflow-hidden text-left">
            
            {/* Scrollable middle area for Calendar and Activities */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-1 pb-4">
                {/* Header de Sección */}
                <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.2em] mb-4">
                    Avisos y calendario
                </h4>

                {/* Tarjeta interactiva del Calendario */}
                <div className="relative group pt-2">
                    <TeacherCalendarCard events={events} />
                </div>

                {/* Lista de Avisos / Próximas Fechas */}
                <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-700 text-xs tracking-wide">
                            Próximas Actividades
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                            {events.length} registradas
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-8 text-slate-400 gap-2 text-xs">
                            <Loader2 className="animate-spin" size={16} />
                            <span>Cargando eventos...</span>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-xs text-center">
                            No hay actividades agendadas.
                        </div>
                    ) : (
                        events.slice(0, 5).map((task) => (
                            <div
                                key={task.id}
                                className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-300 select-none group"
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${getBadgeStyles(task.category)}`}>
                                        {task.category || 'AVISO'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {task.start}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-800 text-[13px] leading-tight tracking-tight line-clamp-2">
                                        {task.title}
                                    </span>
                                    <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                                {task.description && (
                                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Botones de contacto rápido fijados al fondo */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white z-10 mt-auto">
                <ContactButton
                    href={SCHOOL_CONTACT.mailtoLink}
                    label="Correo Escolar"
                    icon={Mail}
                />
                <ContactButton
                    href={SCHOOL_CONTACT.whatsappLink}
                    label="WhatsApp"
                    icon={MessageCircle}
                    external
                />
            </div>

        </div>
    );
}

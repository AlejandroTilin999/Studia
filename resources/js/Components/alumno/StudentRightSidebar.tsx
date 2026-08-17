import { useEffect, useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import ContactButton from '../common/ContactButton';
import TeacherCalendarCard, { CalendarEvent } from '../TeacherCalendarCard';
import StudiaSkeleton from '@/Components/ui/StudiaSkeleton';

import { SCHOOL_CONTACT } from '@/constants/SchoolContact';

interface StudentRightSidebarProps {
    initialEvents?: CalendarEvent[];
}

const EMPTY_EVENTS: CalendarEvent[] = [];
const CALENDAR_CACHE_KEY = 'studia.student-calendar-events';

let memoryCalendarEvents: CalendarEvent[] | null = null;

const getCachedCalendarEvents = (): CalendarEvent[] | null => {
    if (memoryCalendarEvents !== null) return memoryCalendarEvents;
    if (typeof window === 'undefined') return null;

    try {
        const cached = window.sessionStorage.getItem(CALENDAR_CACHE_KEY);
        if (!cached) return null;

        const events = JSON.parse(cached);
        if (!Array.isArray(events)) return null;

        memoryCalendarEvents = events;
        return events;
    } catch {
        return null;
    }
};

const cacheCalendarEvents = (events: CalendarEvent[]) => {
    memoryCalendarEvents = events;
    if (typeof window === 'undefined') return;

    try {
        window.sessionStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify(events));
    } catch {
        // El calendario sigue disponible en memoria aunque el navegador no permita almacenamiento.
    }
};

export default function StudentRightSidebar({ initialEvents = EMPTY_EVENTS }: StudentRightSidebarProps) {
    const cachedEvents = getCachedCalendarEvents();
    const [events, setEvents] = useState<CalendarEvent[]>(() => initialEvents.length > 0 ? initialEvents : cachedEvents ?? EMPTY_EVENTS);
    const [isLoading, setIsLoading] = useState(() => initialEvents.length === 0 && cachedEvents === null);

    useEffect(() => {
        if (initialEvents.length > 0) {
            setEvents(initialEvents);
            cacheCalendarEvents(initialEvents);
            setIsLoading(false);
        } else if (getCachedCalendarEvents() !== null) {
            setEvents(getCachedCalendarEvents()!);
            setIsLoading(false);
        } else {
            setIsLoading(true);
            fetch('/calendar/events')
                .then((res) => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                })
                .then((data: CalendarEvent[]) => {
                    if (Array.isArray(data)) {
                        setEvents(data);
                        cacheCalendarEvents(data);
                    }
                })
                .catch(() => {})
                .finally(() => setIsLoading(false));
        }
    }, [initialEvents]);

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
        return 'bg-blue-50 text-blue-600 border-blue-100';
    };

    return (
        <div className="w-full h-full bg-white p-6 lg:p-8 flex flex-col justify-between overflow-hidden text-left">

            {/* Scrollable middle area for Calendar and Reminders */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-1 pb-4">
                {/* Section Header */}
                <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.2em] mb-4 text-left">
                    Avisos y calendario escolar
                </h4>

                {/* Calendar Card Component (Interactive Excel Calendar) */}
                {isLoading ? (
                    <div className="space-y-4 pb-5 border-b border-slate-50">
                        <StudiaSkeleton className="h-7 w-40 rounded-lg" />
                        <div className="grid grid-cols-7 gap-1.5">
                            {Array.from({ length: 28 }).map((_, index) => <StudiaSkeleton key={index} className="h-7 rounded-lg" />)}
                        </div>
                    </div>
                ) : (
                    <div className="pb-2 border-b border-slate-50">
                        <TeacherCalendarCard events={events} />
                    </div>
                )}

                {/* Reminders List from Excel */}
                <div className="space-y-3 mt-4 text-left">
                    {isLoading ? Array.from({ length: 3 }).map((_, idx) => (
                        <StudiaSkeleton key={idx} className="h-20 border border-slate-100" />
                    )) : events.slice(0, 4).map((ev, idx) => (
                        <div
                            key={ev.id || idx}
                            className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-slate-100 bg-white hover:border-blue-100 transition-all duration-300 select-none group"
                        >
                            <div className="flex justify-between items-center">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border ${getBadgeStyles(ev.category)}`}>
                                    {ev.category || 'Aviso'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold block">
                                    {ev.start}
                                </span>
                            </div>
                            <span className="font-bold text-slate-800 text-[13px] leading-tight tracking-tight block mt-1">
                                {ev.title}
                            </span>
                            {ev.description && (
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed truncate">
                                    {ev.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pinned Bottom Quick Contact Buttons */}
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

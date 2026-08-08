import {
    Mail,
    Download
} from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import ContactButton from '../common/ContactButton';
import StudentCalendarCard from './StudentCalendarCard';

interface EventItem {
    title: string;
    date: string;
    colorClass: string;
}

interface StudentRightSidebarProps {
    events?: EventItem[];
    calendarDays?: number[];
}

export default function StudentRightSidebar({
    events = [
        { title: 'Examen física', date: '13 de Junio, 10 AM', colorClass: 'bg-[#00c853]' },
        { title: 'Entrega Ensayo', date: '12 de Junio, 11 AM', colorClass: 'bg-orange-500' },
        { title: 'Examen física hoy', date: '12 de Junio, 8 AM', colorClass: 'bg-rose-600' }
    ],
    calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
}: StudentRightSidebarProps) {
    return (
        <div className="w-full h-full bg-white p-6 lg:p-8 flex flex-col justify-between overflow-y-auto scrollbar-hide">

            <div className="space-y-8">
                {/* Section Header */}
                <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.2em] mb-4 text-left">Avisos y agenda</h4>

                {/* Calendar Card Component (Flat design now) */}
                <div className="pb-4 border-b border-slate-50">
                    <StudentCalendarCard calendarDays={calendarDays} />
                </div>

                {/* Reminders List */}
                <div className="space-y-3 mt-6 text-left">
                    {events.map((ev, idx) => {
                        let badgeText = "Aviso";
                        let badgeBg = "bg-slate-50 text-slate-500 border-slate-100";

                        if (ev.colorClass.includes('emerald') || ev.colorClass.includes('#00c853') || ev.colorClass.includes('green') || ev.colorClass.includes('bg-[#00c853]')) {
                            badgeText = "Examen";
                            badgeBg = "bg-emerald-50 text-emerald-600 border-emerald-100";
                        } else if (ev.colorClass.includes('orange') || ev.colorClass.includes('amber') || ev.colorClass.includes('orange-500')) {
                            badgeText = "Tarea";
                            badgeBg = "bg-amber-50 text-amber-600 border-amber-100";
                        } else if (ev.colorClass.includes('rose') || ev.colorClass.includes('red') || ev.colorClass.includes('rose-600')) {
                            badgeText = "Urgente";
                            badgeBg = "bg-rose-50 text-rose-600 border-rose-100";
                        }

                        return (
                            <div
                                key={idx}
                                className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 transition-all duration-300 select-none group"
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${badgeBg}`}>
                                        {badgeText}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold block">
                                        {ev.date}
                                    </span>
                                </div>
                                <span className="font-bold text-slate-800 text-[13.5px] leading-tight tracking-tight block">
                                    {ev.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Quick Contact Buttons (Expediente removed as requested) */}
            <div className="grid grid-cols-2 gap-3 pt-8 border-t border-slate-50 mt-10 mb-2">
                <ContactButton
                    href="mailto:contacto@prepahidalgo.edu.mx"
                    label="Correo Escolar"
                    icon={Mail}
                />
                <ContactButton
                    href="https://wa.me/7710000000"
                    label="WhatsApp"
                    icon={FaWhatsapp}
                    external
                />
            </div>

        </div>
    );
}

import { 
    Mail, 
    Download 
} from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import ContactButton from './ContactButton';
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
        <div className="w-full lg:w-[340px] bg-white border-t lg:border-t-0 lg:border-l border-slate-150 p-6 lg:pt-8 lg:pb-12 lg:px-5 flex flex-col justify-between shrink-0 lg:sticky lg:-top-8 lg:h-[calc(100vh-32px)]">
            
            <div className="space-y-4">
                {/* Section Header */}
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-1.5 text-left">Avisos y calendario</h4>
                
                {/* Calendar Card Component */}
                <StudentCalendarCard calendarDays={calendarDays} />

                {/* Reminders List */}
                <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 mt-1 text-left scrollbar-thin">
                    {events.map((ev, idx) => {
                        let badgeText = "Aviso";
                        let badgeBg = "bg-slate-100 text-slate-600";
                        
                        if (ev.colorClass.includes('emerald') || ev.colorClass.includes('#00c853') || ev.colorClass.includes('green') || ev.colorClass.includes('bg-[#00c853]')) {
                            badgeText = "Examen";
                            badgeBg = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                        } else if (ev.colorClass.includes('orange') || ev.colorClass.includes('amber') || ev.colorClass.includes('orange-500')) {
                            badgeText = "Tarea";
                            badgeBg = "bg-amber-50 text-amber-700 border border-amber-100";
                        } else if (ev.colorClass.includes('rose') || ev.colorClass.includes('red') || ev.colorClass.includes('rose-600')) {
                            badgeText = "Urgente";
                            badgeBg = "bg-rose-50 text-rose-700 border border-rose-100";
                        }

                        return (
                            <div 
                                key={idx} 
                                className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-all duration-300 shadow-sm select-none"
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeBg}`}>
                                        {badgeText}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-extrabold block">
                                        {ev.date}
                                    </span>
                                </div>
                                <span className="font-extrabold text-slate-700 text-xs leading-tight block">
                                    {ev.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Quick Contact Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 mt-4">
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
                <ContactButton 
                    href="/alumno/documentos" 
                    label="Expediente" 
                    icon={Download} 
                    isLink 
                />
            </div>

        </div>
    );
}

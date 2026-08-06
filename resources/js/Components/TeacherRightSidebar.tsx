import {
    Mail,
    ArrowRight
} from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import ContactButton from './ContactButton';
import StudentCalendarCard from './StudentCalendarCard';

interface TaskItem {
    id: number;
    title: string;
    date: string;
    type?: 'EXAMEN' | 'TAREA' | 'URGENTE';
}

interface TeacherRightSidebarProps {
    tasks?: TaskItem[];
    calendarDays?: number[];
}

export default function TeacherRightSidebar({
    tasks = [
        { id: 1, title: 'Examen física', date: '13 de Junio, 10 AM', type: 'EXAMEN' },
        { id: 2, title: 'Entrega Ensayo', date: '12 de Junio, 11 AM', type: 'TAREA' },
        { id: 3, title: 'Examen física hoy', date: '12 de Junio, 8 AM', type: 'URGENTE' }
    ],
    calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
}: TeacherRightSidebarProps) {
    const getBadgeStyles = (type: string) => {
        switch (type) {
            case 'EXAMEN': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'TAREA': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'URGENTE': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-slate-100 p-6 lg:px-8 flex flex-col justify-between shrink-0 lg:h-full overflow-y-auto scrollbar-hide">

            <div className="space-y-8 text-left">
                {/* Section Header */}
                <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.2em] mb-4">Avisos y calendario</h4>

                {/* Calendar Card Component */}
                <div className="relative group pt-2">
                    <StudentCalendarCard calendarDays={calendarDays} />
                </div>

                {/* Reminders List (Fechas Límite) */}
                <div className="space-y-3 mt-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 transition-all duration-300 select-none group"
                        >
                            <div className="flex justify-between items-center">
                                <span className={`text-[9px] font-normal uppercase tracking-widest px-2.5 py-1 rounded-lg border ${getBadgeStyles(task.type || 'TAREA')}`}>
                                    {task.type || 'TAREA'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                    {task.date}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-normal text-slate-800 text-[13.5px] leading-tight tracking-tight">
                                    {task.title}
                                </span>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-8 border-t border-slate-50 mt-10 mb-2">
                <ContactButton
                    href="mailto:[admin.prepahid@gmail.com]"
                    label="Correo Escolar"
                    icon={Mail}
                />
                <ContactButton
                    href="https://wa.me/4433541441"
                    label="WhatsApp"
                    icon={FaWhatsapp}
                    external
                />
            </div>

        </div>
    );
}

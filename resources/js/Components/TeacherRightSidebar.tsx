import { 
    Mail, 
    Download, 
    Calendar,
    ClipboardList
} from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import ContactButton from './ContactButton';
import StudentCalendarCard from './StudentCalendarCard';

interface TaskItem {
    id: number;
    title: string;
    date: string;
    urgent: boolean;
}

interface TeacherRightSidebarProps {
    tasks?: TaskItem[];
    calendarDays?: number[];
}

export default function TeacherRightSidebar({ 
    tasks = [
        { id: 1, title: 'Límite de captura del Primer Parcial', date: 'En 3 días', urgent: true },
        { id: 2, title: 'Reunión de Academia de Ciencias', date: 'Viernes 26 de Junio', urgent: false },
        { id: 3, title: 'Subir planeación semestral de Física II', date: 'Próxima semana', urgent: false }
    ],
    calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
}: TeacherRightSidebarProps) {
    return (
        <div className="w-full lg:w-[340px] bg-white border-t lg:border-t-0 lg:border-l border-slate-150 p-6 lg:pt-8 lg:pb-12 lg:px-5 flex flex-col justify-between shrink-0 lg:sticky lg:-top-8 lg:h-[calc(100vh-32px)]">
            
            <div className="space-y-4">
                {/* Section Header */}
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-1.5 text-left">Avisos y agenda</h4>
                
                {/* Calendar Card Component */}
                <StudentCalendarCard calendarDays={calendarDays} />

                {/* Reminders List (Fechas Límite) */}
                <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 mt-1 text-left scrollbar-thin">
                    {tasks.map((task) => (
                        <div 
                            key={task.id} 
                            className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-all duration-300 shadow-sm select-none"
                        >
                            <div className="flex justify-between items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    task.urgent 
                                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                }`}>
                                    {task.urgent ? 'Urgente' : 'Pendiente'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-extrabold block">
                                    {task.date}
                                </span>
                            </div>
                            <span className="font-extrabold text-slate-700 text-xs leading-tight block">
                                {task.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Quick Contact Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 mt-4">
                <ContactButton 
                    href="mailto:soporte@prepahidalgo.edu.mx" 
                    label="Soporte" 
                    icon={Mail} 
                />
                <ContactButton 
                    href="https://wa.me/7710000000" 
                    label="WhatsApp" 
                    icon={FaWhatsapp} 
                    external 
                />
                <ContactButton 
                    href="/docente/grupos" 
                    label="Carga Horaria" 
                    icon={Download} 
                    isLink 
                />
            </div>

        </div>
    );
}

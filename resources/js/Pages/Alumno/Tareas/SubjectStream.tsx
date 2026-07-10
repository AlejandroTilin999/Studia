import * as React from 'react';
import { Bell, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';

interface Task {
    id: number;
    subjectName?: string;
    title: string;
    status: string;
    desc: string;
    points?: string;
    deadline?: string;
}

interface SubjectStreamProps {
    subjectName: string;
    teacherName: string;
    tasks: Task[];
    onSelectTask: (task: Task) => void;
}

export default function SubjectStream({ subjectName, teacherName, tasks, onSelectTask }: SubjectStreamProps) {
    const pendingTasks = tasks.filter(t => t.status !== 'Entregado');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left animate-in fade-in duration-200 pt-2">
            
            {/* Stream Reminders Left Widget (1 Column) - Style matching subjects card */}
            <div className="lg:col-span-1">
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-none">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                            <Bell size={14} className="stroke-[2.5]" />
                        </div>
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Tareas Pendientes</span>
                    </div>

                    <div className="space-y-4">
                        {pendingTasks.length === 0 ? (
                            <div className="text-center py-4">
                                <span className="text-[11px] text-slate-400 font-bold block">¡Sin tareas pendientes!</span>
                            </div>
                        ) : (
                            pendingTasks.slice(0, 3).map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => onSelectTask(task)} 
                                    className="cursor-pointer group block text-left space-y-1"
                                >
                                    <span className="text-xs text-slate-700 group-hover:text-[#0266E0] font-extrabold block truncate transition-colors leading-tight">
                                        {task.title}
                                    </span>
                                    <span className="text-[9px] text-slate-450 font-bold block uppercase tracking-wide flex items-center gap-1">
                                        <AlertCircle size={10} className="text-amber-500" />
                                        Límite: {task.deadline}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Stream Feed Right (3 Columns) - Announcement styled as clean subject cards */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* Clean Announcement Post (Matching subject cards styling) */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-none">
                    
                    {/* Header info */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-extrabold text-[#0266E0] border border-slate-200/50">
                                {teacherName.charAt(0)}
                            </div>
                            <div>
                                <span className="text-xs font-black text-[#0f172a] block">{teacherName}</span>
                                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Docente de la Materia</span>
                            </div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                            Publicado ayer
                        </span>
                    </div>

                    {/* Announcement text */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#0266E0] font-black uppercase tracking-wider">
                            <Sparkles size={12} />
                            <span>Mensaje de Bienvenida</span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-650 font-medium leading-relaxed">
                            Hola a todos, bienvenidos al portal escolar de la asignatura. En este espacio encontrarán todas las actividades asignadas, guías de práctica y rúbricas correspondientes al periodo escolar. 
                            <br/><br/>
                            Los invito a revisar periódicamente la pestaña de <strong>Tareas Asignadas</strong> para mantenerse al día con sus entregas y evitar penalizaciones. Cualquier duda sobre los proyectos pueden enviármela por los canales oficiales. ¡Mucho éxito en este ciclo!
                        </p>
                    </div>
                    
                    {/* Fake comment thread link for richness */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-wide">
                        <MessageCircle size={12} />
                        <span>Comentarios de la clase (0 comentarios)</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

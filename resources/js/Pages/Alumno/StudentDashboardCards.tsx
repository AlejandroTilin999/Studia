import DonutChartWidget from '@/Components/DonutChartWidget';
import { Calendar, Users } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    status: string;
    desc: string;
    subjectName?: string;
}

interface StudentInfo {
    name: string;
    matricula: string;
    groupName: string;
    email: string;
    registeredAt: string;
    gpa: string;
    tutor: string;
    ciclo: string;
    periodo: string;
}

interface StudentDashboardCardsProps {
    studentInfo: StudentInfo;
    taskList: Task[];
    onOpenTaskModal: (task: Task) => void;
    onViewAllTasks?: () => void;
}

export default function StudentDashboardCards({
    studentInfo,
    taskList,
    onOpenTaskModal,
    onViewAllTasks,
}: StudentDashboardCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Promedio General (Circular/Dona) */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col justify-between shadow-none min-h-[160px]">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block text-left">Promedio general</h4>
                <div className="flex-1 flex items-center justify-center">
                    <DonutChartWidget 
                        title=""
                        centerLabel=""
                        centerValue={studentInfo.gpa}
                        hideLegend={true}
                        variant="plain"
                        segments={[
                            { name: "Aprobado", count: parseFloat(studentInfo.gpa), color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                            { name: "Restante", count: 10 - parseFloat(studentInfo.gpa), color: "#e2e8f0", bulletClass: "bg-slate-200" }
                        ]}
                    />
                </div>
            </div>

            {/* Card 2: Tutor y Ciclo escolar */}
            <div className="space-y-4 flex flex-col h-full">
                {/* Tutor Info */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 rounded-xl p-5 shadow-none flex-1">
                    <div className="p-2.5 bg-slate-200/50 text-slate-500 rounded-full shrink-0">
                        <Users size={18} />
                    </div>
                    <div className="min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tutor:</span>
                        <span className="text-xs text-slate-700 font-extrabold block mt-0.5">{studentInfo.tutor}</span>
                    </div>
                </div>
                
                {/* Ciclo Escolar Info */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 rounded-xl p-5 shadow-none flex-1">
                    <div className="p-2.5 bg-slate-200/50 text-slate-500 rounded-full shrink-0">
                        <Calendar size={18} />
                    </div>
                    <div className="min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Ciclo escolar:</span>
                        <span className="text-xs text-slate-700 font-extrabold block mt-0.5">{studentInfo.ciclo}</span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{studentInfo.periodo}</span>
                    </div>
                </div>
            </div>

            {/* Card 3: Resumen de Tareas */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 shadow-none flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-left">Resumen de tareas</h4>
                    {onViewAllTasks && (
                        <button 
                            type="button"
                            onClick={onViewAllTasks}
                            className="text-[10px] text-[#1e88e5] font-extrabold hover:underline"
                        >
                            Ver todas →
                        </button>
                    )}
                </div>
                <div className="flex-1 space-y-2.5">
                    {taskList.map((task, idx) => (
                        <div 
                            key={task.id} 
                            onClick={() => onOpenTaskModal(task)}
                            className={`text-xs text-left cursor-pointer transition-colors group ${
                                idx !== taskList.length - 1 ? 'border-b border-slate-200/50 pb-2 mb-2' : ''
                            }`}
                        >
                            <div>
                                <span className="font-semibold text-slate-700 group-hover:text-[#1e88e5] transition-colors">
                                    {task.title}
                                </span>
                                <span className={`font-semibold ml-1.5 ${
                                    task.status === 'Pendiente' 
                                        ? 'text-amber-505' 
                                        : task.status === 'Entregado' 
                                            ? 'text-emerald-500' 
                                            : 'text-slate-400'
                                }`}>
                                    ({task.status})
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

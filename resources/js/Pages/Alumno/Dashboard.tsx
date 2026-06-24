import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, 
    Calendar,
    Folder,
    Check,
    Upload,
    X,
    Paperclip
} from 'lucide-react';
import StudentRightSidebar from '@/Components/StudentRightSidebar';
import DonutChartWidget from '@/Components/DonutChartWidget';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';

export default function AlumnoDashboard() {
    const { auth } = usePage().props as any;

    // 1. Datos simulados del alumno
    const studentInfo = {
        name: auth?.user?.name || 'José Eduardo Gómez',
        matricula: 'PH2026-001',
        groupName: '1°A',
        email: 'jose.gomez@alumno.prepahidalgo.edu.mx',
        registeredAt: 'Agosto 2025',
        gpa: '10',
        tutor: 'Ing. Uriel Cambron',
        ciclo: '2025-2026',
        periodo: '(Enero-Abril 2026)'
    };

    // Tareas pendientes (con estado local)
    const [taskList, setTaskList] = useState([
        { id: 1, title: 'Entregar Ensayo', status: 'Pendiente', desc: 'Por favor, redacta un ensayo de 3 páginas sobre las causas principales y detonantes de la Segunda Guerra Mundial. Debe incluir referencias bibliográficas en formato APA e introducción formal.' },
        { id: 2, title: 'Proyecto de Física', status: 'En progreso', desc: 'Desarrollar un prototipo a escala de una rampa hidráulica aplicando los principios fundamentales de la Ley de Pascal. Entregar reporte PDF del diseño.' },
        { id: 3, title: 'Proyecto de Física', status: 'En progreso', desc: 'Preparar informe técnico detallando los cálculos de presión, área de pisones y fuerza de empuje medidos en las pruebas de carga.' },
        { id: 4, title: 'Proyecto de Física', status: 'En progreso', desc: 'Presentar y exponer el funcionamiento de la rampa en clase frente al grupo. Duración de exposición: 10 minutos máximo.' }
    ]);

    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const openTaskModal = (task: any) => {
        setSelectedTask(task);
        setAttachedFile(null);
        setIsTaskModalOpen(true);
    };

    const handleDeliverTask = () => {
        if (!selectedTask) return;
        setTaskList(taskList.map(t => t.id === selectedTask.id ? { ...t, status: 'Entregado' } : t));
        triggerToast(`¡Tarea "${selectedTask.title}" entregada correctamente!`);
        setIsTaskModalOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAttachedFile(e.target.files[0]);
        }
    };

    // Materias destacadas
    const featuredSubjects = [
        { name: 'Matemáticas', progress: 80, teacher: 'Ing. Uriel Cambron' },
        { name: 'Inglés', progress: 90, teacher: 'Mtra. Nuvia Pérez' }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Mi Perfil Escolar" />

            {/* Layout de Dos Columnas */}
            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden font-body -m-6 md:-m-8">
                
                {/* Columna Izquierda: Panel Principal */}
                <div className="flex-1 p-6 md:p-8 space-y-6 min-w-0 lg:overflow-y-auto lg:h-full">
                    
                    {/* Banner de Bienvenida */}
                    <DashboardWelcomeBanner 
                        greeting={`Hola ${studentInfo.name}`}
                        subtitle="Portal del Alumno"
                        wrapperClassName="pb-2"
                    />

                    {/* Contenedor Unificado (Cuadro Principal) */}
                    <div className="bg-white rounded-none md:rounded-2xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 space-y-8">
                        
                        {/* Fila de Tarjetas Superiores */}
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

                            {/* Card 2: Tutor y Ciclo escolar (apilados) */}
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
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block text-left">Resumen de tareas</h4>
                                <div className="flex-1 space-y-2.5">
                                    {taskList.map((task, idx) => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => openTaskModal(task)}
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
                                                        ? 'text-amber-500' 
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

                        {/* Materias Destacadas */}
                        <div className="space-y-4 text-left">
                            <h4 className="text-sm font-bold text-slate-700">Materias destacadas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {featuredSubjects.map((sub, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-150 rounded-xl">
                                        {/* Icon Box */}
                                        <div className="p-2.5 bg-slate-200/50 text-slate-500 rounded-xl shrink-0">
                                            <Folder size={18} />
                                        </div>
                                        
                                        {/* Details */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-slate-700 truncate">{sub.name}</span>
                                                <span className="text-slate-400 shrink-0">{sub.progress}%</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div 
                                                    className="bg-[#1e88e5] h-1.5 rounded-full transition-all duration-500" 
                                                    style={{ width: `${sub.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold block mt-1.5 truncate">{sub.teacher}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Próximas Clases */}
                        <div className="space-y-4 text-left">
                            <h4 className="text-sm font-bold text-slate-700">Próximas clases</h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="bg-[#e8f2ff] text-[#1e88e5] px-4 py-3 rounded-xl text-xs font-bold select-none border border-blue-100/50 flex-1 text-center">
                                    Periodo 3: Física - Aula B3
                                </div>
                                <div className="bg-slate-50 text-slate-600 px-4 py-3 rounded-xl text-xs font-bold select-none border border-slate-200/50 flex-1 text-center">
                                    Periodo 4: Receso
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <StudentRightSidebar />

            </div>

            {/* Modal: Task Details & Upload */}
            {isTaskModalOpen && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
                        {/* Header */}
                        <div className="px-6 py-5 bg-[#1e88e5] text-white flex justify-between items-center select-none">
                            <h3 className="font-black text-white text-base font-body tracking-tight">Detalles de la Tarea</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 font-body text-left">
                            <div>
                                <h4 className="text-base font-extrabold text-slate-800 leading-tight">
                                    {selectedTask.title}
                                </h4>
                                <div className="flex gap-6 mt-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Fecha límite</span>
                                        <span className="font-extrabold text-slate-600 block mt-0.5">25 de Abril, 11:59 PM</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Estado de entrega</span>
                                        <span className={`font-extrabold block mt-0.5 ${
                                            selectedTask.status === 'Pendiente' 
                                                ? 'text-amber-500' 
                                                : selectedTask.status === 'Entregado' 
                                                    ? 'text-emerald-500' 
                                                    : 'text-blue-500'
                                        }`}>
                                            {selectedTask.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions Box */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-600 space-y-1">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Instrucciones</span>
                                <p className="leading-relaxed font-medium">{selectedTask.desc}</p>
                            </div>

                            {/* Simulated File Upload Area */}
                            <div className="space-y-2 text-left">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Subir Archivo de Entrega</span>
                                
                                {selectedTask.status === 'Entregado' ? (
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 text-center text-emerald-650 flex flex-col items-center justify-center gap-2">
                                        <Check size={28} className="bg-emerald-100 p-1.5 rounded-full" />
                                        <span className="text-xs font-bold">¡Esta tarea ya ha sido entregada con éxito!</span>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="border-2 border-dashed border-slate-200 hover:border-[#1e88e5] hover:bg-blue-50/5 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                onChange={handleFileChange}
                                            />
                                            {attachedFile ? (
                                                <>
                                                    <Paperclip size={24} className="text-[#1e88e5]" />
                                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[280px]">{attachedFile.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">({(attachedFile.size / 1024).toFixed(1)} KB) - Haz clic para cambiar</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={24} className="text-slate-400 group-hover:text-[#1e88e5] transition-colors" />
                                                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Arrastra tu archivo aquí o haz clic para buscar</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Soporta PDF, Word o Excel (máx. 10MB)</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 font-body">
                            <button 
                                type="button" 
                                onClick={() => setIsTaskModalOpen(false)} 
                                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                            {selectedTask.status !== 'Entregado' && (
                                <button 
                                    type="button" 
                                    onClick={handleDeliverTask}
                                    disabled={!attachedFile}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all ${
                                        attachedFile 
                                            ? 'bg-[#1e88e5] hover:bg-blue-700 text-white cursor-pointer' 
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    Entregar tarea
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Alerta */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-emerald-500 p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span className="font-semibold">{toastMessage}</span>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

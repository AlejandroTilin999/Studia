import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Check } from 'lucide-react';
import StudentRightSidebar from '@/Components/StudentRightSidebar';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import StudentDashboardCards from './StudentDashboardCards';
import StudentFeaturedSubjects from './StudentFeaturedSubjects';
import StudentTaskModal from './StudentTaskModal';

interface Task {
    id: number;
    title: string;
    status: string;
    desc: string;
}

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
    const [taskList, setTaskList] = useState<Task[]>([
        { id: 1, title: 'Entregar Ensayo', status: 'Pendiente', desc: 'Por favor, redacta un ensayo de 3 páginas sobre las causas principales y detonantes de la Segunda Guerra Mundial. Debe incluir referencias bibliográficas en formato APA e introducción formal.' },
        { id: 2, title: 'Proyecto de Física', status: 'En progreso', desc: 'Desarrollar un prototipo a escala de una rampa hidráulica aplicando los principios fundamentales de la Ley de Pascal. Entregar reporte PDF del diseño.' },
        { id: 3, title: 'Proyecto de Física', status: 'En progreso', desc: 'Preparar informe técnico detallando los cálculos de presión, área de pisones y fuerza de empuje medidos en las pruebas de carga.' },
        { id: 4, title: 'Proyecto de Física', status: 'En progreso', desc: 'Presentar y exponer el funcionamiento de la rampa en clase frente al grupo. Duración de exposición: 10 minutos máximo.' }
    ]);

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const openTaskModal = (task: Task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const handleDeliverTask = (taskId: number) => {
        setTaskList(taskList.map(t => t.id === taskId ? { ...t, status: 'Entregado' } : t));
        const task = taskList.find(t => t.id === taskId);
        if (task) {
            triggerToast(`¡Tarea "${task.title}" entregada correctamente!`);
        }
        setIsTaskModalOpen(false);
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
                        <StudentDashboardCards 
                            studentInfo={studentInfo}
                            taskList={taskList}
                            onOpenTaskModal={openTaskModal}
                        />

                        {/* Materias Destacadas & Próximas Clases */}
                        <StudentFeaturedSubjects 
                            featuredSubjects={featuredSubjects}
                        />
                    </div>
                </div>
                <StudentRightSidebar />
            </div>

            {/* Modal: Task Details & Upload */}
            <StudentTaskModal 
                isOpen={isTaskModalOpen}
                task={selectedTask}
                onClose={() => setIsTaskModalOpen(false)}
                onDeliver={handleDeliverTask}
            />

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

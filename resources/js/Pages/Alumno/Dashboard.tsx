import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Calendar, Check } from 'lucide-react';
import StudentRightSidebar from '@/Components/StudentRightSidebar';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import StudentDashboardCards from './StudentDashboardCards';

// Componentes modulares (Organizados en carpetas correspondientes)
import SubjectCard from './Tareas/SubjectCard';
import SubjectHeader from './Tareas/Componentes/SubjectHeader';
import SubjectClasswork from './Tareas/SubjectClasswork';
import SubjectStream from './Tareas/SubjectStream';
import SubjectAssignment from './Tareas/SubjectAssignment';

interface Task {
    id: number;
    subjectName?: string;
    title: string;
    status: string;
    desc: string;
    points?: string;
    deadline?: string;
}

interface Subject {
    name: string;
    iconName: string;
    teacher: string;
    description: string;
}

interface AlumnoDashboardProps {
    defaultView?: 'perfil' | 'tareas';
}

export default function AlumnoDashboard({ defaultView = 'perfil' }: AlumnoDashboardProps) {
    const { auth } = usePage().props as any;
    
    // Estados principales
    const [currentView, setCurrentView] = useState<'perfil' | 'tareas'>(defaultView);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [activeSubjectTab, setActiveSubjectTab] = useState<'novedades' | 'trabajo'>('novedades');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    // Sincronizar al navegar en la barra lateral
    useEffect(() => {
        setCurrentView(defaultView);
        setSelectedSubject(null);
        setSelectedTask(null);
    }, [defaultView]);

    // 1. Datos simulados del alumno
    const studentInfo = {
        name: auth?.user?.name || 'José Eduardo Gómez López',
        matricula: auth?.user?.alumnoGroups?.[0] ? `ALU-${auth.user.id}` : 'PH2026-001',
        groupName: auth?.user?.alumnoGroups?.[0]?.groupName || '1°A',
        email: auth?.user?.email || 'jose.gomez@alumno.prepahidalgo.edu.mx',
        registeredAt: 'Agosto 2025',
        gpa: '10',
        tutor: 'Ing. Uriel Cambron',
        ciclo: '2025-2026',
        periodo: '(Enero-Abril 2026)'
    };

    // Catálogo de materias leídas dinámicamente
    const subjects = (auth?.user?.alumnoGroups || []).map((group: any) => ({
        id: group.id,
        name: group.name,
        iconName: 'compass',
        teacher: group.teacher,
        description: group.description
    }));

    // Listado general de tareas
    const [taskList, setTaskList] = useState<Task[]>([
        { id: 1, subjectName: 'Desarrollo para dispositivos inteligentes', title: 'Diseño UX/UI de App Móvil', status: 'Pendiente', desc: 'Diseña la arquitectura de información, wireframes y mockup interactivo en Figma de una app móvil para control escolar. Debe incluir al menos vistas de login, perfil y tareas.', points: '100 puntos', deadline: '25 de Julio, 11:59 PM' },
        { id: 2, subjectName: 'Desarrollo para dispositivos inteligentes', title: 'Primera App en React Native', status: 'En progreso', desc: 'Configurar entorno de desarrollo local con Expo Go. Construir una interfaz móvil básica que renderice datos de perfil e integre al menos tres componentes básicos (<Text>, <View>, <Image>).', points: '100 puntos', deadline: '30 de Julio, 11:59 PM' },
        { id: 3, subjectName: 'Física I', title: 'Proyecto: Rampa Hidráulica', status: 'En progreso', desc: 'Desarrollar un prototipo a escala de una rampa hidráulica aplicando los principios fundamentales de la Ley de Pascal. Entregar reporte PDF del diseño físico construido.', points: '100 puntos', deadline: '24 de Julio, 11:59 PM' },
        { id: 4, subjectName: 'Física I', title: 'Cálculos de Presión - Física', status: 'Pendiente', desc: 'Preparar informe técnico detallando los cálculos de presión, área de pisones y fuerza de empuje medidos en las pruebas de carga.', points: '50 puntos', deadline: '28 de Julio, 11:59 PM' },
        { id: 5, subjectName: 'Matemáticas I', title: 'Problemario de Álgebra Lineal', status: 'Pendiente', desc: 'Resolver los 15 ejercicios de matrices y sistemas de ecuaciones lineales adjuntos en el portal escolar.', points: '100 puntos', deadline: '26 de Julio, 11:59 PM' },
        { id: 6, subjectName: 'Matemáticas I', title: 'Práctica de Trigonometría', status: 'Entregado', desc: 'Completar el reporte de medición de alturas usando goniómetro casero y razones trigonométricas.', points: '50 puntos', deadline: 'Entregado hace 2 días' }
    ]);

    // Estado persistente local de comentarios privados y archivos adjuntos
    const [taskComments, setTaskComments] = useState<Record<number, string[]>>({
        1: [
            'Dra. Ana Karen, ¿puedo utilizar Figma para diseñar los Mockups?',
            'Sí Eduardo, de hecho es la herramienta recomendada. No olvides adjuntar el link del proyecto en tu reporte.'
        ]
    });
    const [attachedFiles, setAttachedFiles] = useState<Record<number, File | null>>({});
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Acciones de entrega de tareas
    const handleDeliverTask = (taskId: number) => {
        setTaskList(taskList.map(t => t.id === taskId ? { ...t, status: 'Entregado' } : t));
        triggerToast(`¡Tarea entregada correctamente!`);
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask({ ...selectedTask, status: 'Entregado' });
        }
    };

    const handleCancelDeliverTask = (taskId: number) => {
        setTaskList(taskList.map(t => t.id === taskId ? { ...t, status: 'Pendiente' } : t));
        triggerToast(`Entrega anulada.`);
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask({ ...selectedTask, status: 'Pendiente' });
        }
    };

    const handleAddComment = (taskId: number, text: string) => {
        const currentComments = taskComments[taskId] || [];
        setTaskComments({
            ...taskComments,
            [taskId]: [...currentComments, text]
        });
    };

    // Materias destacadas e información general del dashboard
    const featuredSubjects = [
        { name: 'Matemáticas I', progress: 85, teacher: 'Ing. Uriel Cambron' },
        { name: 'Desarrollo para dispositivos inteligentes', progress: 95, teacher: 'Dra. Ana Karen Camacho' }
    ];

    const currentSubjectTasks = taskList.filter(t => selectedSubject && t.subjectName === selectedSubject.name);
    const otherTasksOfSubject = selectedTask 
        ? currentSubjectTasks.filter(t => t.id !== selectedTask.id) 
        : [];

    return (
        <AuthenticatedLayout noPadding>
            <Head title={currentView === 'tareas' ? "Mis Tareas" : "Mi Perfil Escolar"} />

            <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden font-body w-full">
                
                {/* Columna Izquierda: Panel Principal */}
                <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto lg:h-full">
                    {currentView === 'perfil' ? (
                        // 🏡 VISTA 1: MI PERFIL / RESUMEN
                        <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
                            <DashboardWelcomeBanner 
                                greeting={`Hola ${studentInfo.name}`}
                                subtitle="Portal del Alumno"
                                wrapperClassName="pb-2"
                            />

                            <div className="space-y-6">
                                <StudentDashboardCards 
                                    studentInfo={studentInfo}
                                    taskList={taskList}
                                    onOpenTaskModal={(task) => {
                                        const sub = subjects.find((s: any) => s.name === task.subjectName);
                                        if (sub) {
                                            setCurrentView('tareas');
                                            setSelectedSubject(sub);
                                            setSelectedTask(task);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        // 📚 VISTA 2: MIS TAREAS / MODULO CLASSROOM
                        <div className="flex flex-col animate-in fade-in duration-200 h-full bg-white">
                            {/* Cabecera / Selector de Materia (Visible siempre en tareas) */}
                            <SubjectHeader 
                                subject={selectedSubject}
                                task={selectedTask}
                                activeTab={activeSubjectTab}
                                setActiveTab={setActiveSubjectTab}
                                onBack={() => {
                                    if (selectedTask) {
                                        setSelectedTask(null);
                                    } else if (selectedSubject) {
                                        setSelectedSubject(null);
                                    } else {
                                        setCurrentView('perfil');
                                    }
                                }}
                                onBackToSubject={() => {
                                    setSelectedTask(null);
                                    setActiveSubjectTab('trabajo');
                                }}
                            />

                            {/* Contenedor Principal de Actividades */}
                            <div className="p-6 md:p-8">
                                <div className="min-h-[400px]">
                                    
                                    {/* Caso A: Muestra las materias en tarjetas si no se ha seleccionado ninguna */}
                                    {!selectedSubject && (
                                        <SubjectCard 
                                            subjects={subjects}
                                            onSelectSubject={(sub) => {
                                                setSelectedSubject(sub);
                                                setActiveSubjectTab('novedades');
                                            }}
                                        />
                                    )}

                                    {/* Caso B: Muestra la materia seleccionada */}
                                    {selectedSubject && !selectedTask && (
                                        <>
                                            {activeSubjectTab === 'novedades' ? (
                                                <SubjectStream 
                                                    subjectName={selectedSubject.name}
                                                    teacherName={selectedSubject.teacher}
                                                    tasks={currentSubjectTasks}
                                                    onSelectTask={setSelectedTask}
                                                />
                                            ) : (
                                                <SubjectClasswork 
                                                    tasks={currentSubjectTasks}
                                                    onSelectTask={setSelectedTask}
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* Caso C: Muestra la entrega detallada estilo "Ver Tarea" */}
                                    {selectedSubject && selectedTask && (
                                        <SubjectAssignment 
                                            task={selectedTask}
                                            otherTasks={otherTasksOfSubject}
                                            onBack={() => setSelectedTask(null)}
                                            onSwitchTask={setSelectedTask}
                                            attachedFile={attachedFiles[selectedTask.id] || null}
                                            onFileChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setAttachedFiles({ ...attachedFiles, [selectedTask.id]: e.target.files[0] });
                                                }
                                            }}
                                            onRemoveFile={() => setAttachedFiles({ ...attachedFiles, [selectedTask.id]: null })}
                                            onDeliver={() => handleDeliverTask(selectedTask.id)}
                                            onCancelDeliver={() => handleCancelDeliverTask(selectedTask.id)}
                                            comments={taskComments[selectedTask.id] || []}
                                            onAddComment={(text) => handleAddComment(selectedTask.id, text)}
                                            teacherName={selectedSubject.teacher}
                                        />
                                    )}

                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Barra lateral de avisos y calendario (solo en Inicio y colapsable) */}
                {currentView === 'perfil' && (
                    <div className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-white ${
                        isSidebarExpanded ? 'w-full lg:w-80 border-l border-slate-100' : 'w-0'
                    }`}>
                        <div className="w-full lg:w-80 h-full">
                            <StudentRightSidebar />
                        </div>
                    </div>
                )}
            </div>

            {/* Botón flotante para alternar Barra Lateral (Solo en Inicio) */}
            {currentView === 'perfil' && (
                <button
                    type="button"
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="fixed bottom-6 right-6 lg:bottom-auto lg:top-[76px] lg:right-6 z-40 p-3 bg-white border border-slate-200 rounded-full shadow-lg text-slate-655 hover:text-slate-800 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center"
                    title={isSidebarExpanded ? "Ocultar calendario" : "Mostrar calendario"}
                >
                    <Calendar size={18} className={isSidebarExpanded ? "text-[#1e88e5]" : "text-slate-500"} />
                </button>
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

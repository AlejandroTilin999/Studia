import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, Check, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import StudentRightSidebar from '@/Components/StudentRightSidebar';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import StudentDashboardCards from './StudentDashboardCards';
import { SwalHelper } from '@/utils/SwalHelper';
import { formatGrade } from '@/utils/gradeHelper';

// Componentes modulares (Organizados en carpetas correspondientes)
import SubjectCard from './Tareas/SubjectCard';
import SubjectHeader from './Tareas/Componentes/SubjectHeader';
import SubjectClasswork from './Tareas/SubjectClasswork';
import SubjectStream from './Tareas/SubjectStream';
import SubjectAssignment from './Tareas/SubjectAssignment';

interface Task {
    id: number;
    subjectName?: string;
    parcial?: number;
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
    studentInfo?: {
        name: string;
        firstName?: string;
        lastNamePaternal?: string;
        lastNameMaternal?: string;
        matricula: string;
        groupName: string;
        email: string;
        registeredAt: string;
        gpa: string;
        tutor: string;
        ciclo: string;
        periodo: string;
    };
    taskList?: Task[];
    kardex?: any[];
    alumnoGroups?: any[];
}

export default function AlumnoDashboard({
    defaultView = 'perfil',
    studentInfo: propStudentInfo,
    taskList: propTaskList,
    kardex = [],
    alumnoGroups: propAlumnoGroups = []
}: AlumnoDashboardProps) {
    const { auth } = usePage().props as any;
    const { url: currentUrl } = usePage();

    // Estados principales
    const [currentView, setCurrentView] = useState<'perfil' | 'tareas'>(defaultView);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedParcial, setSelectedParcial] = useState<number | null>(null);
    const [activeSubjectTab, setActiveSubjectTab] = useState<'novedades' | 'trabajo'>('novedades');

    // 1. Catálogo de materias leídas dinámicamente desde las props
    const subjects = useMemo(() => propAlumnoGroups.map((group: any) => ({
        id: group.id,
        name: group.nombre,
        iconName: 'compass',
        teacher: group.docente,
        description: group.descripcion
    })), [propAlumnoGroups]);

    // Sincronizar al navegar en la barra lateral o por URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const subjectId = urlParams.get('id');
        const viewParam = urlParams.get('view');
        const parcialParam = urlParams.get('parcial');

        if (subjectId && subjects.length > 0) {
            const sub = subjects.find((s: any) => s.id.toString() === subjectId.toString());
            if (sub) {
                setCurrentView('tareas');
                setSelectedSubject(sub);

                if (parcialParam) {
                    setSelectedParcial(parseInt(parcialParam));
                } else {
                    setSelectedParcial(null);
                }

                if (viewParam !== 'tareas') setSelectedTask(null);
                return;
            }
        }

        // Redirección automática si estamos en /materias sin ID
        if (currentUrl.includes('/materias') && !subjectId) {
            setCurrentView('perfil');
            setSelectedSubject(null);
            return;
        }

        if (viewParam === 'tareas') {
            setCurrentView('tareas');
            setSelectedSubject(null);
            setSelectedTask(null);
            return;
        }

        if (defaultView === 'perfil') {
            setCurrentView('perfil');
            setSelectedSubject(null);
            setSelectedTask(null);
            setSelectedParcial(null);
        } else {
            setCurrentView(defaultView);
        }
    }, [currentUrl, subjects, defaultView]);

    // 2. Datos del alumno con lógica de GPA dinámica
    const baseStudentInfo = propStudentInfo || {
        name: auth?.user?.nombre_completo || 'Alumno',
        firstName: auth?.user?.nombre || '',
        lastNamePaternal: auth?.user?.apellido_paterno || '',
        lastNameMaternal: auth?.user?.apellido_materno || '',
        matricula: auth?.user?.alumnoGroups?.[0] ? `ALU-${auth.user.id}` : 'S/M',
        groupName: auth?.user?.alumnoGroups?.[0]?.nombre_grupo || 'Sin grupo',
        email: auth?.user?.email || '',
        registeredAt: 'Agosto 2025',
        gpa: subjects.length > 0 ? '0.0' : '—',
        tutor: 'Pendiente',
        ciclo: '2026-A',
        periodo: '(Enero-Julio 2026)',
        specialty: 'Técnico en Informática'
    };

    const studentInfo = {
        ...baseStudentInfo,
        subjectsCount: subjects.length
    };

    // Determinar el parcial activo
    const activeParcialNum = useMemo(() => {
        if (!kardex || kardex.length === 0) return 1;
        const first = kardex[0];
        if (!first.details) return 1;
        if (first.details[1]?.average === '—') return 1;
        if (first.details[2]?.average === '—') return 2;
        if (first.details[3]?.average === '—') return 3;
        return 1;
    }, [kardex]);

    // Listado general de tareas
    const [taskList, setTaskList] = useState<Task[]>(propTaskList || []);

    // Tareas filtradas para el dashboard principal (solo parcial activo)
    const activeParcialTasks = useMemo(() => {
        return taskList.filter(t => !t.parcial || t.parcial === activeParcialNum);
    }, [taskList, activeParcialNum]);

    // Actualizar tareas si cambian las props
    useEffect(() => {
        if (propTaskList) {
            setTaskList(propTaskList);
        }
    }, [propTaskList]);

    // Estado persistente local de comentarios privados y archivos adjuntos
    const [taskComments, setTaskComments] = useState<Record<number, string[]>>({});
    const [attachedFiles, setAttachedFiles] = useState<Record<number, File | null>>({});

    // Acciones de entrega de tareas
    const handleDeliverTask = (taskId: number) => {
        setTaskList(taskList.map(t => t.id === taskId ? { ...t, status: 'Entregado' } : t));
        SwalHelper.success('¡Tarea Entregada!', 'Tu trabajo ha sido enviado correctamente.');
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask({ ...selectedTask, status: 'Entregado' });
        }
    };

    const handleCancelDeliverTask = (taskId: number) => {
        setTaskList(taskList.map(t => t.id === taskId ? { ...t, status: 'Pendiente' } : t));
        SwalHelper.toast('Entrega anulada', 'info');
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
                        <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
                            <DashboardWelcomeBanner
                                greeting={`Hola ${studentInfo.name}`}
                                subtitle="Portal del Alumno"
                                wrapperClassName="pb-2"
                            />

                            <div className="space-y-6">
                                <StudentDashboardCards
                                    studentInfo={studentInfo}
                                    taskList={activeParcialTasks}
                                    kardex={kardex}
                                    onOpenTaskModal={(task) => {
                                        const sub = subjects.find((s: any) => s.name === task.subjectName);
                                        if (sub) {
                                            setCurrentView('tareas');
                                            setSelectedSubject(sub);
                                            setSelectedTask(task);
                                            if (task.parcial) setSelectedParcial(task.parcial);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col animate-in fade-in duration-200 h-full bg-white">
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

                            <div className="p-6 md:p-8">
                                <div className="min-h-[400px]">

                                    {!selectedSubject && (
                                        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e88e5] mb-4"></div>
                                            <p className="font-medium text-sm">Cargando portal de materia...</p>
                                        </div>
                                    )}

                                    {selectedSubject && !selectedTask && (
                                        <>
                                            {activeSubjectTab === 'novedades' && (
                                                <div className="space-y-8 text-left pt-2 animate-in fade-in duration-300">

                                                    {/* Vista A: Lista de Parciales */}
                                                    {!selectedParcial ? (
                                                        <>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-slate-700">Mi Historial de Calificaciones</h4>
                                                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Resumen de promedios por periodo de evaluación</p>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                                {[1, 2, 3].map((num) => {
                                                                    const subjectKardex = kardex.find(k => k.subject === selectedSubject.name);
                                                                    const pData = subjectKardex?.details?.[num];
                                                                    const done = pData?.configured;
                                                                    const avg = pData?.average ?? '—';
                                                                    const criteria = pData?.criteria || [];

                                                                    return (
                                                                        <div
                                                                            key={num}
                                                                            onClick={() => setSelectedParcial(num)}
                                                                            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-full hover:border-blue-100 hover:bg-slate-50/30 transition-all group shadow-none cursor-pointer relative"
                                                                        >
                                                                            <div className="mb-4">
                                                                                <div className="text-4xl font-normal text-slate-900 opacity-20 group-hover:opacity-100 group-hover:text-[#1e88e5] transition-all">0{num}</div>
                                                                                <h3 className="text-base font-medium text-slate-800">Parcial {num}</h3>
                                                                            </div>

                                                                            <div className="flex-grow space-y-4">
                                                                                {done ? (
                                                                                    <>
                                                                                        <div className="space-y-3">
                                                                                            <div className="flex justify-between items-end">
                                                                                                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Promedio Parcial</span>
                                                                                                <span className="text-2xl font-normal text-slate-800">{avg}</span>
                                                                                            </div>
                                                                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                                                <div
                                                                                                    className="h-full bg-[#1e88e5] rounded-full transition-all duration-1000"
                                                                                                    style={{ width: avg !== '—' ? `${parseFloat(avg) * 10}%` : '0%' }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Desglose de Criterios */}
                                                                                {criteria.length > 0 && (
                                                                                    <div className="pt-4 border-t border-slate-50 space-y-2.5">
                                                                                        <span className="text-[9px] font-normal text-slate-400 uppercase tracking-widest block mb-1">Desglose de evaluación</span>
                                                                                        {criteria.map((c: any, cIdx: number) => {
                                                                                            const roundedScore = formatGrade(c.score);
                                                                                            const isPassing = roundedScore !== '—' && Number(roundedScore) >= 6;

                                                                                            return (
                                                                                                <div key={cIdx} className="flex items-center justify-between text-xs">
                                                                                                    <div className="flex flex-col">
                                                                                                        <span className="font-medium text-slate-700">{c.name}</span>
                                                                                                        <span className="text-[10px] text-slate-400 font-normal">{c.percentage}% del total</span>
                                                                                                    </div>
                                                                                                    <span className={`font-bold ${isPassing ? 'text-slate-800' : 'text-[#1e88e5]'}`}>
                                                                                                        {roundedScore}
                                                                                                    </span>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                )}

                                                                                        <div className="pt-4 border-t border-slate-50">
                                                                                            <span className="text-[10px] font-bold text-[#1e88e5] flex items-center gap-1">
                                                                                                Ver tareas asignadas
                                                                                                <ChevronRight size={12} />
                                                                                            </span>
                                                                                        </div>
                                                                                    </>
                                                                                ) : (
                                                                                    <p className="text-xs text-slate-400 font-medium italic">Evaluación no disponible.</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        /* Vista B: Tareas del Parcial Seleccionado */
                                                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                                            <div className="flex items-center justify-between">
                                                                <button
                                                                    onClick={() => setSelectedParcial(null)}
                                                                    className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors text-xs font-bold uppercase tracking-widest"
                                                                >
                                                                    <ChevronLeft size={16} />
                                                                    Volver a parciales
                                                                </button>
                                                                <div className="px-4 py-1 bg-[#1e88e5]/10 text-[#1e88e5] rounded-full text-xs font-black uppercase tracking-widest border border-[#1e88e5]/20">
                                                                    Tareas Parcial 0{selectedParcial}
                                                                </div>
                                                            </div>

                                                            <SubjectClasswork
                                                                tasks={currentSubjectTasks.filter(t => t.parcial === selectedParcial)}
                                                                onSelectTask={setSelectedTask}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

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

                {currentView === 'perfil' && (
                    <div className="hidden lg:block w-[380px] shrink-0 bg-white border-l border-slate-100 h-full overflow-hidden">
                        <StudentRightSidebar />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

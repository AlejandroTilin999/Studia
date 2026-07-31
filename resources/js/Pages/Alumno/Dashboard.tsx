import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, Check, BookOpen, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, Clock, LockKeyhole } from 'lucide-react';
import StudentRightSidebar from '@/Components/StudentRightSidebar';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import StudentDashboardCards from './StudentDashboardCards';
import { SwalHelper } from '@/utils/SwalHelper';
import { formatGrade } from '@/utils/gradeHelper';
import { Deferred } from '@inertiajs/react';
import DotsLoader from '@/Components/ui/DotsLoader';

// Componentes modulares
import SubjectCard from './Tareas/SubjectCard';
import SubjectHeader from './Tareas/Componentes/SubjectHeader';
import SubjectClasswork from './Tareas/SubjectClasswork';
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

export default function AlumnoDashboard({
    defaultView = 'perfil',
    studentInfo: propStudentInfo,
    taskList: propTaskList,
    kardex = [],
    alumnoGroups: propAlumnoGroups = [],
    isCycleActive = true
}: any) {
    const { auth } = usePage().props as any;
    const { url: currentUrl } = usePage();

    // Estados principales
    const [currentView, setCurrentView] = useState<'perfil' | 'tareas'>(defaultView);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedParcial, setSelectedParcial] = useState<number | null>(null);
    const [activeSubjectTab, setActiveSubjectTab] = useState<'novedades' | 'trabajo'>('novedades');

    // [LÓGICA v7.0] Sincronización en tiempo real con cambios en el Admin (ThunderSync V7)
    useEffect(() => {
        const bc = new BroadcastChannel('school-cycle-channel');

        const performHardRefresh = () => {
            console.log('%c[ThunderSync] ⚡ Cambio detectado. Iniciando ráfaga de sincronización...', 'color: #0266E0; font-weight: bold;');

            // Ráfaga de 3 intentos para asegurar consistencia con el servidor (Bypass Cache)
            const delays = [0, 800, 2000];
            delays.forEach(delay => {
                setTimeout(() => {
                    router.reload({
                        only: ['kardex', 'taskList', 'alumnoGroups', 'isCycleActive'],
                        onSuccess: () => console.log('[ThunderSync] ✅ Datos actualizados.')
                    });
                }, delay);
            });
        };

        bc.onmessage = (event) => {
            if (event.data?.type === 'cycle-update') {
                performHardRefresh();
            }
        };

        return () => bc.close();
    }, []);

    // 1. Catálogo de materias
    const subjects = useMemo(() => {
        const groups = propAlumnoGroups || [];
        return groups.map((group: any) => ({
            id: group.id,
            name: group.nombre,
            iconName: 'compass',
            teacher: group.docente,
            description: group.description,
            color_tema: group.color_tema || 'blue'
        }));
    }, [propAlumnoGroups]);

    // Sincronizar URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const subjectId = urlParams.get('id');
        const viewParam = urlParams.get('view');
        const parcialParam = urlParams.get('parcial');

        if (subjectId && subjects.length > 0) {
            const sub = subjects.find((s: any) => s.id?.toString() === subjectId.toString());
            if (sub) {
                setCurrentView('tareas');
                setSelectedSubject(sub);
                if (parcialParam) setSelectedParcial(parseInt(parcialParam));
                if (viewParam !== 'tareas') setSelectedTask(null);
                return;
            }
        }

        if (currentUrl.includes('/materias') && !subjectId) {
            setCurrentView('perfil');
            setSelectedSubject(null);
            return;
        }

        if (viewParam === 'tareas') {
            setCurrentView('tareas');
            return;
        }

        setCurrentView(defaultView);
    }, [currentUrl, subjects, defaultView]);

    // 2. Datos del alumno
    const studentInfo = useMemo(() => {
        const base = propStudentInfo || {
            name: auth?.user?.nombre_completo || 'Alumno',
            firstName: auth?.user?.nombre || '',
            email: auth?.user?.email || '',
            matricula: 'S/M',
            groupName: 'Sin grupo',
            ciclo: '2026',
            gpa: '—'
        };

        const info = {
            ...base,
            subjectsCount: subjects?.length || 0,
            gpa: '—'
        };

        if (Array.isArray(kardex) && kardex.length > 0) {
            let sum = 0;
            let count = 0;
            kardex.forEach(k => {
                if (k && k.score !== '—' && k.score !== null) {
                    sum += parseFloat(k.score);
                    count++;
                }
            });
            if (count > 0) {
                info.gpa = formatGrade(sum / count).toString();
            }
        }

        return info;
    }, [propStudentInfo, subjects, kardex, auth]);

    // Determinar el parcial activo
    const activeParcialNum = useMemo(() => {
        if (!Array.isArray(kardex) || kardex.length === 0) return 1;
        const first = kardex[0];
        if (!first || !first.details) return 1;
        if (first.details[1]?.average === '—') return 1;
        if (first.details[2]?.average === '—') return 2;
        if (first.details[3]?.average === '—') return 3;
        return 1;
    }, [kardex]);

    // Listado de tareas
    const [taskList, setTaskList] = useState<Task[]>(propTaskList || []);
    useEffect(() => { if (propTaskList) setTaskList(propTaskList); }, [propTaskList]);

    const activeParcialTasks = useMemo(() => {
        return (taskList || []).filter(t => !t.parcial || t.parcial === activeParcialNum);
    }, [taskList, activeParcialNum]);

    const currentSubjectTasks = useMemo(() => {
        if (!selectedSubject) return [];
        const sName = (selectedSubject.name || '').trim().toLowerCase();
        return (taskList || []).filter(t => {
            const tName = (t.subjectName || '').trim().toLowerCase();
            return tName === sName || (t.carga_id && (t.carga_id === selectedSubject.id || t.carga_id === selectedSubject.uuid));
        });
    }, [taskList, selectedSubject]);

    const activeCriteria = useMemo(() => {
        if (!selectedSubject || !Array.isArray(kardex)) return [];
        const subjectKardex = kardex.find(k => k.id === selectedSubject.id || k.uuid === selectedSubject.id);
        if (!subjectKardex || !subjectKardex.details) return [];
        const pNum = selectedParcial || activeParcialNum;
        return subjectKardex.details[pNum]?.criteria || [];
    }, [selectedSubject, kardex, selectedParcial, activeParcialNum]);

    const otherTasksOfSubject = useMemo(() => {
        return selectedTask ? currentSubjectTasks.filter(t => t.id !== selectedTask.id) : [];
    }, [currentSubjectTasks, selectedTask]);

    // Comentarios
    const [taskComments] = useState<Record<number, string[]>>({});

    const currentYear = useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const yearParam = urlParams.get('year');
        return yearParam ? parseInt(yearParam) : new Date().getFullYear();
    }, []);

    const activeParity = useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return (urlParams.get('parity') as 'odd' | 'even') || 'odd';
    }, []);

    return (
        <AuthenticatedLayout noPadding>
            <Head title={currentView === 'tareas' ? "Mis Tareas" : "Mi Perfil Escolar"} />

            <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden w-full">
                <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto lg:h-full">

                    {currentView === 'perfil' ? (
                        <div className="p-6 md:p-8 space-y-6">
                            <DashboardWelcomeBanner greeting={`Hola ${studentInfo.name}`} subtitle="Portal del Alumno" />
                            <StudentDashboardCards studentInfo={studentInfo} taskList={activeParcialTasks} kardex={kardex} onOpenTaskModal={() => {}} />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white">
                            <SubjectHeader
                                subject={selectedSubject}
                                task={selectedTask}
                                activeTab={activeSubjectTab}
                                setActiveTab={setActiveSubjectTab}
                                onBack={() => setSelectedSubject(null)}
                                activeCriteria={activeCriteria}
                            />

                            <div className="p-6 md:p-8">
                                {!selectedSubject ? (
                                    <div className="flex flex-col items-center justify-center h-[400px]">
                                        <DotsLoader label="Cargando portal" />
                                    </div>
                                ) : (
                                    <>
                                        {!selectedTask ? (
                                            <div className="space-y-8">
                                                {!selectedParcial ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 auto-rows-fr">
                                                        {[1, 2, 3].map((num) => {
                                                            const subjectKardex = Array.isArray(kardex) ? kardex.find(k => k.subject === selectedSubject.name) : null;
                                                            const pData = subjectKardex?.details?.[num];
                                                            const done = pData?.configured;
                                                            const avg = pData?.average ?? '—';
                                                            const criteria = pData?.criteria || [];

                                                            const isGraded = avg !== '—';

                                                            // [LÓGICA v6.5] Bloqueo sincronizado
                                                            const serverLocked = pData?.lock_info?.allowed === false;

                                                            // Bloqueo por secuencia: Parcial 2 se desbloquea al estar configurado el Parcial 1, etc.
                                                            const sequenceLocked = num === 2
                                                                ? (Array.isArray(kardex) && !kardex.find(k => k.subject === selectedSubject.name)?.details?.[1]?.configured)
                                                                : num === 3
                                                                    ? (Array.isArray(kardex) && (!kardex.find(k => k.subject === selectedSubject.name)?.details?.[1]?.configured || !kardex.find(k => k.subject === selectedSubject.name)?.details?.[2]?.configured))
                                                                    : false;

                                                            // [MEJORA v6.8] Permitir acceso en modo lectura incluso si está bloqueado por el servidor
                                                            const isLocked = sequenceLocked;
                                                            const isAccessRestricted = serverLocked && done;

                                                            const lockReason = serverLocked ? pData?.lock_info?.reason : 'Se desbloqueará al concluir el parcial anterior.';

                                                            return (
                                                                <div
                                                                    key={num}
                                                                    onClick={() => !isLocked && setSelectedParcial(num)}
                                                                    className={`flex flex-col h-full bg-white border rounded-2xl p-6 transition-all ${
                                                                        isLocked
                                                                            ? 'opacity-40 border-slate-100 cursor-not-allowed shadow-none grayscale'
                                                                            : 'border-slate-100 hover:shadow-lg hover:border-blue-200 cursor-pointer shadow-sm'
                                                                    }`}
                                                                >
                                                                    {/* Cabecera de Estado */}
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        {isLocked ? (
                                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase" title={lockReason}>
                                                                                <LockKeyhole size={12} /> Bloqueado
                                                                            </span>
                                                                        ) : isAccessRestricted ? (
                                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase" title={lockReason}>
                                                                                <LockKeyhole size={12} /> Cerrado (Lectura)
                                                                            </span>
                                                                        ) : (
                                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${
                                                                                isGraded
                                                                                    ? 'bg-emerald-50 text-emerald-600'
                                                                                    : done
                                                                                        ? 'bg-blue-50 text-blue-500'
                                                                                        : 'bg-slate-50 text-slate-400'
                                                                            }`}>
                                                                                {isGraded ? (
                                                                                    <><CheckCircle2 size={12} /> Calificado</>
                                                                                ) : done ? (
                                                                                    <><Clock size={12} /> En curso</>
                                                                                ) : (
                                                                                    <><AlertCircle size={12} /> No disponible</>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Identificador de Parcial */}
                                                                    <div className="mb-4">
                                                                        <div className={`text-5xl font-black transition-colors ${isLocked ? 'text-slate-200' : 'text-slate-900 group-hover:text-[#0266E0]'}`}>0{num}</div>
                                                                        <h3 className="text-lg font-normal text-slate-800 tracking-tight">Parcial {num}</h3>
                                                                    </div>

                                                                    {/* Desglose de Criterios */}
                                                                    <div className="flex-grow space-y-2 mb-6">
                                                                        {done ? (
                                                                            <div className="space-y-2.5">
                                                                                {criteria.map((c: any, idx: number) => (
                                                                                    <div key={idx} className="flex justify-between items-center text-xs">
                                                                                        <span className="text-slate-500 truncate max-w-[140px] font-normal">{c.name}</span>
                                                                                        <div className="flex items-center gap-3">
                                                                                            <span className="text-slate-500 font-medium">{c.percentage}%</span>
                                                                                            <span className={`font-black ${isGraded ? 'text-slate-900' : 'text-slate-300'}`}>
                                                                                                {c.score ?? '—'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-slate-400 leading-relaxed font-normal">
                                                                                {isLocked ? lockReason : 'Aún no se han definido los criterios de evaluación.'}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Promedio Final (Minimalista) */}
                                                                    <div className="mt-auto pt-4 border-t border-slate-50">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Promedio Parcial</span>
                                                                            <span className={`text-2xl font-black ${isGraded ? 'text-slate-900' : 'text-slate-200'}`}>{avg}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        <button onClick={() => setSelectedParcial(null)} className="text-xs font-bold text-slate-400">← Volver</button>
                                                        <SubjectClasswork tasks={currentSubjectTasks.filter(t => !t.parcial || Number(t.parcial) === Number(selectedParcial))} onSelectTask={setSelectedTask} />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <SubjectAssignment
                                                task={selectedTask}
                                                otherTasks={otherTasksOfSubject}
                                                onBack={() => setSelectedTask(null)}
                                                onSwitchTask={setSelectedTask}
                                                comments={taskComments[selectedTask.id] || []}
                                                onAddComment={() => {}}
                                                teacherName={selectedSubject.teacher}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {currentView === 'perfil' && (
                    <div className="hidden lg:block w-[380px] shrink-0 bg-white border-l border-slate-100">
                        <StudentRightSidebar />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

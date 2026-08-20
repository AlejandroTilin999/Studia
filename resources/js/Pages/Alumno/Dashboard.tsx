import { getAuthenticatedNoPaddingLayout } from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import StudentRightSidebar from '@/Components/alumno/StudentRightSidebar';
import DashboardWelcomeBanner from '@/Components/layout/DashboardWelcomeBanner';
import StudentDashboardCards from './StudentDashboardCards';
import { formatGrade } from '@/utils/gradeHelper';
import DotsLoader from '@/Components/ui/DotsLoader';
import StudiaSkeleton from '@/Components/ui/StudiaSkeleton';
import BackButton from '@/Components/common/BackButton';
import ParcialHeader from '@/Components/common/ParcialHeader';
import { useRealtime } from '@/hooks/useRealtime';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import { buildAlumnoClassUrl, getAlumnoClassRoute } from '@/utils/alumnoClassUrl';
import type { StudentTask } from '@/types/alumno';

// Componentes modulares
import SubjectHeader from './Tareas/components/SubjectHeader';
import SubjectClasswork from './Tareas/SubjectClasswork';
import SubjectAssignment from './Tareas/SubjectAssignment';

const EMPTY_GRADE = '\u2014';

const hasNumericGrade = (value: unknown): boolean => {
    if (value === null || value === undefined || value === '') return false;
    return Number.isFinite(Number(value));
};

export default function AlumnoDashboard({
    defaultView = 'perfil',
    studentInfo: propStudentInfo,
    taskList: propTaskList,
    kardex,
    subjectKardex = null,
    alumnoGroups: propAlumnoGroups = [],
    initialParcial = null,
    initialTask = null,
    isCycleActive = true
}: any) {
    const { auth, alumnoGroups: globalAlumnoGroups } = usePage().props as any;
    const { url: currentUrl } = usePage();

    // Estados principales
    const [currentView, setCurrentView] = useState<'perfil' | 'tareas'>(defaultView);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [selectedTask, setSelectedTask] = useState<StudentTask | null>(() => initialTask);
    const [selectedParcial, setSelectedParcial] = useState<number | null>(() => {
        if (typeof initialParcial === 'number' && initialParcial >= 1 && initialParcial <= 3) return initialParcial;
        return getAlumnoClassRoute().parcial;
    });
    const [activeSubjectTab, setActiveSubjectTab] = useState<'novedades' | 'trabajo'>('novedades');
    const [isPageLoading, setIsPageLoading] = useState(() => !subjectKardex && !Array.isArray(kardex));
    const [themeOverrides, setThemeOverrides] = useState<Record<string, string>>({});
    const [partialAvailability, setPartialAvailability] = useState<Record<number, boolean> | null>(null);
    const isInitialMountRef = useRef(true);
    const classroomScrollRef = useRef<HTMLDivElement>(null);
    const partialClassworkRef = useRef<HTMLDivElement>(null);

    // Dentro del aula los datos ya están en memoria. Cambiar sólo la URL y el
    // estado evita una visita Inertia completa por cada flecha o tarea.
    const navigateLocally = useCallback((url: string, replace = false) => {
        // Si el usuario vuelve antes de que termine una visita anterior, esa
        // respuesta ya no puede volver a montar una materia sobre Inicio.
        router.cancelAll({ sync: true, async: true, prefetch: false });
        if ((router as any).page) {
            (router as any).page.url = url;
        }
        const state = window.history.state ? { ...window.history.state, url } : { url };
        window.history[replace ? 'replaceState' : 'pushState'](state, '', url);
        window.dispatchEvent(new CustomEvent('studia:navigation', { detail: { url } }));
    }, []);

    const handleAcademicPeriodChanged = useCallback((event: any) => {
        if (!event?.partialAvailability) return;
        setPartialAvailability(event.partialAvailability);
    }, []);

    const { useGroupSubscription } = useRealtime({ onAcademicPeriodChanged: handleAcademicPeriodChanged });

    // Escuchar actualizaciones de parciales/ciclos en tiempo real en memoria React sin NINGÚN reload
    useEffect(() => {
        const handleSignal = (data: any) => {
            if (data?.parcial !== undefined && data?.activo !== undefined) {
                setPartialAvailability(prev => ({
                    ...(prev || {}),
                    [data.parcial]: !!data.activo
                }));
            }
        };

        const bc = new BroadcastChannel('school-cycle-channel');
        bc.onmessage = (e) => handleSignal(e.data);

        const onStorage = (e: StorageEvent) => {
            const keys = ['studia_v4_signal', 'studia_rt_signal', 'studia_rt_update'];
            if (keys.includes(e.key!) && e.newValue) {
                try { handleSignal(JSON.parse(e.newValue)); } catch(err) {}
            }
        };
        window.addEventListener('storage', onStorage);

        return () => {
            bc.close();
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    useEffect(() => {
        if (isInitialMountRef.current) {
            if (subjectKardex || Array.isArray(kardex)) {
                setIsPageLoading(false);
                isInitialMountRef.current = false;
            } else {
                setIsPageLoading(true);
            }
        }
    }, [kardex, subjectKardex, selectedSubject?.id, selectedSubject?.name]);

    // 1. Catálogo de materias
    const subjects = useMemo(() => {
        const groups = propAlumnoGroups || globalAlumnoGroups || [];
        return groups.map((group: any) => ({
            id: group.id,
            uuid: group.uuid || group.id,
            name: group.nombre,
            iconName: 'compass',
            teacher: group.docente,
            description: group.description || group.descripcion,
            color_tema: themeOverrides[String(group.id)] || group.color_tema || 'blue',
            nombre_grupo: group.nombre_grupo || group.grupo || null,
            specialty: group.specialty || group.especialidad || null
        }));
    }, [propAlumnoGroups, globalAlumnoGroups, themeOverrides]);

    const themedKardex = useMemo(() => {
        if (!Array.isArray(kardex)) return kardex;
        return kardex.map((item: any) => ({
            ...item,
            color_tema: themeOverrides[String(item.id || item.uuid)] || item.color_tema,
        }));
    }, [kardex, themeOverrides]);

    const currentSubjectKardex = useMemo(() => {
        if (!selectedSubject) return null;

        const matchesSubject = (item: any) => item && (
            String(item.id) === String(selectedSubject.id) ||
            String(item.uuid) === String(selectedSubject.id) ||
            (item.subject && selectedSubject.name && item.subject.trim().toLowerCase() === selectedSubject.name.trim().toLowerCase())
        );

        const baseKardex = matchesSubject(subjectKardex)
            ? {
                ...subjectKardex,
                color_tema: themeOverrides[String((subjectKardex as any).id || (subjectKardex as any).uuid)] || (subjectKardex as any).color_tema,
            }
            : (Array.isArray(themedKardex) ? themedKardex.find(matchesSubject) ?? null : null);

        if (!baseKardex || !partialAvailability || !baseKardex.details) return baseKardex;

        return {
            ...baseKardex,
            details: Object.fromEntries(Object.entries(baseKardex.details).map(([partial, detail]: [string, any]) => {
                const partialNumber = Number(partial);
                const allowed = partialAvailability[partialNumber] ?? detail.lock_info?.allowed ?? true;
                return [partial, {
                    ...detail,
                    lock_info: {
                        ...detail.lock_info,
                        allowed,
                        reason: allowed ? 'Habilitado.' : `El Parcial ${partialNumber} se encuentra bloqueado por la administración.`,
                    },
                }];
            })),
        };
    }, [selectedSubject, subjectKardex, themedKardex, themeOverrides, partialAvailability]);

    // Listado de tareas
    const [taskList, setTaskList] = useState<StudentTask[]>(propTaskList || []);
    // Un evento WebSocket representa el cambio más reciente. Una prop
    // diferida de Inertia puede llegar después con el snapshot anterior; no
    // debe volver a pisar campos como la fecha y hora de esa tarea.
    const realtimeTaskIdsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        if (Array.isArray(propTaskList)) {
            setTaskList((current) => {
                const currentById = new Map(current.map((task) => [String(task.id), task]));

                return propTaskList.map((incoming) => {
                    const taskId = String(incoming.id);
                    return realtimeTaskIdsRef.current.has(taskId)
                        ? (currentById.get(taskId) ?? incoming)
                        : incoming;
                });
            });
        }
        if (selectedSubject && subjects.length > 0) {
            const updatedSub = subjects.find((s: any) => s.id === selectedSubject.id || s.name === selectedSubject.name || s.uuid === selectedSubject.id);
            if (updatedSub && updatedSub.color_tema !== selectedSubject.color_tema) {
                setSelectedSubject(updatedSub);
            }
        }
    }, [propTaskList, subjects]);

    // Sincronizar URL estilo Google Classroom: ?c=ID_MATERIA&a=HASH_TAREA
    useEffect(() => {
        const handleSync = () => {
            const routeState = getAlumnoClassRoute();
            const subjectId = routeState.loadId;
            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = urlParams.get('view');
            const parcialParam = routeState.parcial?.toString() || urlParams.get('parcial');
            const taskHashParam = routeState.taskId?.toString() || urlParams.get('a') || urlParams.get('task');

            if (subjectId && subjects.length > 0) {
                const sub = subjects.find((s: any) => s.id?.toString() === subjectId.toString() || s.uuid?.toString() === subjectId.toString());
                if (sub) {
                    setCurrentView('tareas');
                    setSelectedSubject(sub);
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'auto' });
                    classroomScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
                    if (parcialParam && selectedParcial !== parseInt(parcialParam)) {
                        setSelectedParcial(parseInt(parcialParam));
                    } else if (!parcialParam && selectedParcial !== null) {
                        setSelectedParcial(null);
                    }

                    // En un detalle directo, initialTask viene de la ruta
                    // actual y es más reciente que taskList (que es diferido).
                    // Darle prioridad impide que una lista anterior vuelva a
                    // mostrar el estado previo a la calificación.
                    if (taskHashParam && initialTask?.id?.toString() === taskHashParam.toString()) {
                        setSelectedTask(initialTask);
                    } else if (taskHashParam && taskList && taskList.length > 0) {
                        const targetTask = taskList.find((t: any) =>
                            t.id?.toString() === taskHashParam.toString() ||
                            (t.hash && t.hash.endsWith(taskHashParam)) ||
                            t.title === taskHashParam
                        );
                        if (targetTask && (!selectedTask || selectedTask.id !== targetTask.id)) {
                            setSelectedTask(targetTask);
                        }
                    } else if (taskHashParam) {
                        setSelectedTask(null);
                    } else if (!taskHashParam) {
                        setSelectedTask(null);
                    }
                    return;
                }
            }

            if (!subjectId) {
                setSelectedSubject(null);
                setSelectedTask(null);
                setCurrentView('perfil');
                return;
            }

            if (viewParam === 'tareas') {
                if (currentView !== 'tareas') setCurrentView('tareas');
                return;
            }
        };

        handleSync();
        window.addEventListener('popstate', handleSync);
        return () => {
            window.removeEventListener('popstate', handleSync);
        };
    }, [currentUrl, subjects, taskList, initialTask]);

    // Reseteo automático de Scroll al tope absoluto al cambiar de materia o vista
    useEffect(() => {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (selectedParcial && !selectedTask && isMobile) {
            const timer = window.setTimeout(() => {
                partialClassworkRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 40);

            return () => window.clearTimeout(timer);
        }

        const scrollToTopNow = () => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            document.querySelector('main')?.scrollTo({ top: 0, behavior: 'auto' });
            classroomScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
        };

        scrollToTopNow();
        // Ejecutar también en el siguiente tick para garantizar que el renderizado de React se haya completado
        const timer = setTimeout(scrollToTopNow, 10);
        return () => clearTimeout(timer);
    }, [selectedSubject?.id, selectedParcial, selectedTask?.id, currentView]);

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
                if (k && hasNumericGrade(k.score)) {
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

    const applyRealtimeTasks = useCallback((event: any) => {
        if (!event?.loadId || !Array.isArray(event?.tasks)) return;

        event.tasks.forEach((task: StudentTask) => realtimeTaskIdsRef.current.add(String(task.id)));

        // Si el alumno está leyendo una de las tareas modificadas, actualizar
        // ese detalle también; antes sólo se renovaba el listado de fondo.
        setSelectedTask(current => {
            if (!current || String(current.carga_id) !== String(event.loadId) || Number(current.parcial) !== Number(event.parcial)) {
                return current;
            }

            const incoming = event.tasks.find((task: any) => String(task.id) === String(current.id));
            if (!incoming) return null;

            return {
                ...current,
                ...incoming,
                status: current.status ?? incoming.status,
                archivo: (current as any).archivo ?? incoming.archivo,
                grade: current.grade ?? incoming.grade,
            };
        });

        setTaskList(current => {
            const previousById = new Map(current.map((task: any) => [String(task.id), task]));
            const incoming = event.tasks.map((task: any) => {
                const previous = previousById.get(String(task.id)) as any;
                return {
                    ...previous,
                    ...task,
                    status: previous?.status ?? task.status,
                    archivo: previous?.archivo ?? task.archivo,
                    grade: previous?.grade ?? task.grade,
                };
            });
            const unchanged = current.filter((task: any) => !(
                task.carga_id === event.loadId && Number(task.parcial) === Number(event.parcial)
            ));
            return [...unchanged, ...incoming];
        });
    }, []);

    // La calificación devuelta por el docente llega por el canal privado del
    // alumno. Actualizamos de forma optimista tanto el detalle abierto como
    // la tarjeta del listado; la revalidación silenciosa del hook conserva el
    // kardex y cualquier dato relacionado sincronizados.
    useEffect(() => {
        const handleGradeUpdated = (browserEvent: Event) => {
            const { taskId, score } = (browserEvent as CustomEvent<{ taskId?: number | string; score?: string | number }>).detail || {};
            if (!taskId) return;

            const isUpdatedTask = (task: StudentTask) => String(task.id) === String(taskId);
            const grade = score === null || score === undefined ? undefined : String(score);

            setSelectedTask((current) => current && isUpdatedTask(current)
                ? { ...current, status: 'Calificado', grade: grade ?? current.grade }
                : current);

            setTaskList((current) => current.map((task) => isUpdatedTask(task)
                ? { ...task, status: 'Calificado', grade: grade ?? task.grade }
                : task));
        };

        window.addEventListener('studia:grade-updated', handleGradeUpdated);
        return () => window.removeEventListener('studia:grade-updated', handleGradeUpdated);
    }, []);

    const applyRealtimeGroupUpdate = useCallback((event: any) => {
        if (event?.type !== 'theme' || !event?.loadId || !event?.colorTema) return;

        setThemeOverrides((current: Record<string, string>) => ({ ...current, [String(event.loadId)]: event.colorTema }));
        setSelectedSubject((current: any) => {
            if (!current || String(current.id) !== String(event.loadId)) return current;
            return { ...current, color_tema: event.colorTema };
        });
    }, []);

    useGroupSubscription(studentInfo?.groupId, applyRealtimeGroupUpdate, applyRealtimeTasks);

    // Determinar el parcial activo
    const activeParcialNum = useMemo(() => {
        if (!Array.isArray(kardex) || kardex.length === 0) return 1;
        const first = kardex[0];
        if (!first || !first.details) return 1;
        if (!hasNumericGrade(first.details[1]?.average)) return 1;
        if (!hasNumericGrade(first.details[2]?.average)) return 2;
        if (!hasNumericGrade(first.details[3]?.average)) return 3;
        return 1;
    }, [kardex]);

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
        if (!currentSubjectKardex?.details) return [];
        const pNum = selectedParcial || activeParcialNum;
        return currentSubjectKardex.details[pNum]?.criteria || [];
    }, [currentSubjectKardex, selectedParcial, activeParcialNum]);

    const otherTasksOfSubject = useMemo(() => {
        return selectedTask ? currentSubjectTasks.filter(t => t.id !== selectedTask.id) : [];
    }, [currentSubjectTasks, selectedTask]);

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
        <>
            <Head title={currentView === 'tareas' ? "Mis Tareas" : "Mi Perfil Escolar"} />

            <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden w-full max-w-full overflow-x-hidden">
                <div ref={classroomScrollRef} className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto lg:h-full overflow-x-hidden">

                    {currentView === 'perfil' ? (
                        <div className="p-6 md:p-8 space-y-6">
                            <DashboardWelcomeBanner
                                greeting={`Hola ${studentInfo.name}`}
                                subtitle="Portal del Alumno"
                                wrapperClassName="pt-0"
                            />
                            <StudentDashboardCards studentInfo={studentInfo} kardex={themedKardex} alumnoGroups={subjects} />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white overflow-x-hidden w-full">
                            <SubjectHeader
                                subject={selectedSubject}
                                task={selectedTask}
                                activeTab={activeSubjectTab}
                                setActiveTab={setActiveSubjectTab}
                                onBack={() => {
                                    navigateLocally('/alumno');
                                }}
                                activeCriteria={activeCriteria}
                                tasks={currentSubjectTasks}
                                subjectKardex={currentSubjectKardex}
                            />

                            <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
                                {!selectedSubject ? (
                                    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
                                        <DotsLoader label="Cargando portal" />
                                    </div>
                                ) : (
                                    <>
                                        {!selectedTask ? (
                                            <div>
                                                {!selectedParcial ? (
                                                    <div className="space-y-6 text-left w-full">
                                                        {/* Reutilización del componente ParcialHeader */}
                                                        <ParcialHeader
                                                            title="Parciales de evaluación"
                                                            subtitle="Selecciona un parcial para revisar los criterios de evaluación y consultar tus calificaciones"
                                                            count={3}
                                                            unitLabel="parciales"
                                                            themeKey={selectedSubject?.color_tema || 'blue'}
                                                        />

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                                                                {([1, 2, 3] as const).map((num) => {
                                                                    const activeTheme = COLOR_THEMES[selectedSubject?.color_tema || 'blue'] || COLOR_THEMES.blue;
                                                                    const subjectKardex = currentSubjectKardex;
                                                                    // Durante un cambio local de materia puede existir un
                                                                    // kardex de la ruta anterior. El esqueleto debe durar
                                                                    // únicamente hasta recibir el resumen de la materia actual.
                                                                    const isLoadingKardex = !currentSubjectKardex && (isPageLoading || !Array.isArray(kardex));
                                                                    const pData = subjectKardex?.details?.[num];
                                                                    const done = pData?.configured;
                                                                    const avg = pData?.average;
                                                                    const criteria = pData?.criteria || [];

                                                                    const gradedCount = criteria.filter((c: any) => {
                                                                        if (!c || c.score === null || c.score === undefined || c.score === "" || c.score === "—") return false;
                                                                        const numVal = parseFloat(c.score);
                                                                        return !isNaN(numVal);
                                                                    }).length;
                                                                    const totalCriteria = criteria.length;
                                                                    const isFullyGraded = totalCriteria > 0 && gradedCount === totalCriteria;
                                                                    const isPartiallyGraded = gradedCount > 0 && gradedCount < totalCriteria;
                                                                    const isGraded = isFullyGraded;
                                                                    const hasAnyGrade = isFullyGraded || isPartiallyGraded || hasNumericGrade(avg);
                                                                    const displayAverage = hasAnyGrade ? avg : EMPTY_GRADE;

                                                                    // [LÓGICA SIMPLIFICADA] Bloqueado ÚNICAMENTE si el Admin lo tiene bloqueado en el servidor
                                                                    const isLocked = !isLoadingKardex && pData?.lock_info?.allowed === false;
                                                                    const lockReason = pData?.lock_info?.reason || 'El parcial se encuentra bloqueado por la administración.';

                                                                    // Conteo de tareas de este parcial
                                                                    const parcialTasks = (currentSubjectTasks || []).filter(t => !t.parcial || Number(t.parcial) === num);

                                                                    return (
                                                                        <div
                                                                            key={num}
                                                            onClick={() => {
                                                                if (isLoadingKardex || isLocked || !selectedSubject) return;
                                                                const subjectTargetUuid = selectedSubject.uuid || selectedSubject.id;
                                                                setSelectedParcial(num);
                                                                navigateLocally(buildAlumnoClassUrl(subjectTargetUuid, num));
                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                if (!isLocked && !isLoadingKardex) e.currentTarget.style.borderColor = activeTheme.strokeColor;
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                if (!isLocked && !isLoadingKardex) e.currentTarget.style.borderColor = '';
                                                                            }}
                                                                            className={`group relative flex flex-col justify-between h-full bg-white border rounded-xl p-6 sm:p-7 min-w-0 md:min-w-[260px] transition-all duration-300 ${
                                                                                isLoadingKardex
                                                                                    ? 'border-slate-100 cursor-default shadow-xs'
                                                                                    : isLocked
                                                                                        ? 'opacity-50 border-slate-100 cursor-default shadow-none grayscale'
                                                                                        : 'border-slate-200/80 hover:shadow-xl cursor-pointer shadow-xs'
                                                                            }`}
                                                                        >
                                                                            {(isLoadingKardex || isLocked) && (
                                                                                <div
                                                                                    role="tooltip"
                                                                                    className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 -translate-y-2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
                                                                                >
                                                                                    {isLoadingKardex ? 'Preparando información del parcial…' : lockReason}
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                {/* Cabecera de Estado y Badge de Tareas */}
                                                                                <div className="flex items-center justify-between mb-5">
                                                                                    {isLoadingKardex ? (
                                                                                        <StudiaSkeleton className="h-6 w-24 rounded-full" />
                                                                                    ) : isLocked ? (
                                                                                        <span aria-hidden="true" />
                                                                                    ) : (
                                                                                        <span
                                                                                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                                                                            isFullyGraded
                                                                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                                                : isPartiallyGraded
                                                                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                                                    : done
                                                                                                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                                                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                                                                                        }`}>
                                                                                            {isFullyGraded ? (
                                                                                                <><CheckCircle2 size={12} /> Calificado</>
                                                                                            ) : isPartiallyGraded ? (
                                                                                                <><Clock size={12} /> En proceso</>
                                                                                            ) : done ? (
                                                                                                <><Clock size={12} /> En curso</>
                                                                                            ) : (
                                                                                                <><CheckCircle2 size={12} /> Disponible</>
                                                                                            )}
                                                                                        </span>
                                                                                    )}

                                                                                    {!isLoadingKardex && !isLocked && parcialTasks.length > 0 && (
                                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                                                            {parcialTasks.length} {parcialTasks.length === 1 ? 'tarea' : 'tareas'}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {/* Título de la Unidad */}
                                                                                <div className="text-left mb-6">
                                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unidad 0{num}</span>
                                                                                    <h4
                                                                                        className="text-lg font-black text-slate-900 transition-colors"
                                                                                        onMouseEnter={(e) => (e.currentTarget.style.color = activeTheme.strokeColor)}
                                                                                        onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                                                                    >
                                                                                        {num === 1 ? 'Primer Parcial' : num === 2 ? 'Segundo Parcial' : 'Tercer Parcial'}
                                                                                    </h4>
                                                                                </div>

                                                                                {/* Desglose de Criterios con Mini Barras */}
                                                                                <div className="space-y-3.5 mb-6 text-left">
                                                                                    {isLoadingKardex ? (
                                                                                        <div className="space-y-3 py-2">
                                                                                            <StudiaSkeleton className="h-3.5 w-3/4 rounded-md" />
                                                                                            <StudiaSkeleton className="h-3.5 w-1/2 rounded-md" />
                                                                                        </div>
                                                                                    ) : done ? (
                                                                                        <div className="space-y-3">
                                                                                            {criteria.map((c: any, idx: number) => {
                                                                                                const numScore = parseFloat(c.score);
                                                                                                const hasCriterionScore = c.score !== null && c.score !== undefined && c.score !== "" && c.score !== "—" && !isNaN(numScore);
                                                                                                const pctValue = hasCriterionScore ? Math.min(100, Math.max(0, numScore * 10)) : 0;
                                                                                                return (
                                                                                                    <div key={idx} className="space-y-1">
                                                                                                        <div className="flex justify-between items-center text-xs">
                                                                                                            <span className="text-slate-600 font-semibold truncate max-w-[130px]">{c.name}</span>
                                                                                                            <div className="flex items-center gap-2">
                                                                                                                <span className="text-[10px] text-slate-400 font-bold">{c.percentage}%</span>
                                                                                                                <span className={`font-extrabold ${hasCriterionScore ? 'text-slate-900' : 'text-slate-400'}`}>
                                                                                                                    {c.score ?? '—'}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {!isLocked && (
                                                                                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                                                                                <div
                                                                                                                    className="h-full rounded-full transition-all duration-500"
                                                                                                                    style={{
                                                                                                                        backgroundColor: activeTheme.strokeColor,
                                                                                                                        width: `${pctValue}%`
                                                                                                                    }}
                                                                                                                />
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                                                                            {isLocked ? lockReason : 'Aún no se han definido los criterios de evaluación.'}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Footer: Promedio Final y Botón de Acción */}
                                                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                                                                <div className="flex flex-col text-left">
                                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Promedio</span>
                                                                                    {isLoadingKardex ? (
                                                                                        <StudiaSkeleton className="h-7 w-12 rounded-md mt-1" />
                                                                                    ) : (
                                                                                        <span className={`text-2xl font-black ${isGraded ? 'text-slate-900' : 'text-slate-300'}`}>{displayAverage}</span>
                                                                                    )}
                                                                                </div>

                                                                                {!isLoadingKardex && !isLocked && (
                                                                                    <button
                                                                                        type="button"
                                                                                        style={{
                                                                                            backgroundColor: activeTheme.badgeHex,
                                                                                            color: activeTheme.textHex,
                                                                                        }}
                                                                                        onMouseEnter={(e) => {
                                                                                            e.currentTarget.style.backgroundColor = activeTheme.strokeColor;
                                                                                            e.currentTarget.style.color = '#ffffff';
                                                                                        }}
                                                                                        onMouseLeave={(e) => {
                                                                                            e.currentTarget.style.backgroundColor = activeTheme.badgeHex;
                                                                                            e.currentTarget.style.color = activeTheme.textHex;
                                                                                        }}
                                                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-200 text-xs font-bold shadow-none"
                                                                                    >
                                                                                        <span>Entrar</span>
                                                                                        <ChevronRight size={14} className="stroke-[3]" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                    </div>
                                                </div>
                                                ) : (
                                                    <div ref={partialClassworkRef} className="space-y-3">
                                                        <BackButton
                                                            onClick={() => {
                                                                setSelectedParcial(null);
                                                                if (selectedSubject) {
                                                                    const subjectTargetUuid = selectedSubject.uuid || selectedSubject.id;
                                                                    navigateLocally(buildAlumnoClassUrl(subjectTargetUuid));
                                                                }
                                                            }}
                                                            label="Volver a los parciales"
                                                        />
                                                        <SubjectClasswork
                                                            themeKey={selectedSubject?.color_tema || 'blue'}
                                                            tasks={currentSubjectTasks.filter(t => !t.parcial || Number(t.parcial) === Number(selectedParcial))}
                                                            isLoading={!Array.isArray(propTaskList)}
                                                            onSelectTask={(t) => {
                                                                setSelectedTask(t);
                                                                const subjectTargetUuid = selectedSubject.uuid || selectedSubject.id;
                                                                navigateLocally(buildAlumnoClassUrl(subjectTargetUuid, selectedParcial, t.id));
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <SubjectAssignment
                                                task={selectedTask}
                                                otherTasks={otherTasksOfSubject}
                                                themeKey={selectedSubject?.color_tema || 'blue'}
                                                    onBack={() => {
                                                        const taskParcial = Number(selectedTask?.parcial) || selectedParcial;
                                                        setSelectedTask(null);
                                                        if (selectedSubject) {
                                                            const subjectTargetUuid = selectedSubject.uuid || selectedSubject.id;
                                                            navigateLocally(
                                                                taskParcial
                                                                    ? buildAlumnoClassUrl(subjectTargetUuid, taskParcial)
                                                                    : buildAlumnoClassUrl(subjectTargetUuid)
                                                            );
                                                        }
                                                }}
                                                onSwitchTask={(t) => {
                                                    setSelectedTask(t);
                                                    const taskParcial = Number((t as any).parcial) || selectedParcial;
                                                    if (taskParcial) setSelectedParcial(taskParcial);
                                                    if (selectedSubject && taskParcial) {
                                                        const subjectTargetUuid = selectedSubject.uuid || selectedSubject.id;
                                                        navigateLocally(buildAlumnoClassUrl(subjectTargetUuid, taskParcial, t.id));
                                                    }
                                                }}
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
                    <div className="w-full shrink-0 bg-white border-t border-slate-100 lg:w-[380px] lg:border-t-0 lg:border-l">
                        <StudentRightSidebar />
                    </div>
                )}
            </div>
        </>
    );
}

AlumnoDashboard.layout = getAuthenticatedNoPaddingLayout;

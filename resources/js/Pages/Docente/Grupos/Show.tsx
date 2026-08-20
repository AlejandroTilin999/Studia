import AuthenticatedLayout, { getAuthenticatedNoPaddingLayout } from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { Settings, RotateCcw, CheckCircle2, LockKeyhole, Vote, ChevronRight, Clock } from 'lucide-react';
import { PARCIALES } from './Show/services/constants';
import { useGroupClass } from './Show/hooks/useGroupClass';
import GroupHeaderBanner from './Show/components/GroupHeaderBanner';
import NavigationTabs from './Show/components/NavigationTabs';
import WizardSetup from './Show/components/WizardSetup';
import ActivitiesTab from './Show/components/ActivitiesTab';
import TasksTab from './Show/components/TasksTab';
import GradesTab from './Show/components/GradesTab';
import FinalGradesModal from './Show/components/FinalGradesModal';
import TaskGradesModal from './Show/components/TaskGradesModal';
import DotsLoader from '@/Components/ui/DotsLoader';
import BackButton from '@/Components/common/BackButton';
import ParcialHeader from '@/Components/common/ParcialHeader';
import { useRealtime } from '@/hooks/useRealtime';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import { buildDocenteClassUrl, getDocenteClassRoute } from '@/utils/docenteClassUrl';

function DocenteGruposContent({ classInfo }: { classInfo: any }) {
    const { grupo, materia, especialidad, semestre, themeKey, showPaletteMenu, setShowPaletteMenu, handleThemeChange, screen, setScreen, activeParcial, setActiveParcial, configs, wizardStep, setWizardStep, draftCriteria, tasks, setTasks, saveTasks, activeTab, setActiveTab, students, studentGrades, setStudentGrades, getStudentTasksAverage, openParcial, saveWizardConfig, resetConfig, updateCriterion, toggleSyncTasks, addCriterion, removeCriterion, resetParcial, setScore, handleAsentarCalificaciones, returnTaskGrade, selectedTaskId, setSelectedTaskId, selectedStudentId, setSelectedStudentId, isPdfModalOpen, setIsPdfModalOpen, isGradesModalOpen, setIsGradesModalOpen, getParcialAverage, getFinalAverage, isParcialClosed, totalPct, pctValid, isReadOnly, lockReason, lockInfos, isSaving, handleConcludeParcial, refreshClassData } = useGroupClass(classInfo);

    const { useGroupSubscription } = useRealtime();

    // Subscribe to real-time events for this academic group silently via Axios
    useGroupSubscription(classInfo?.grupo_id, refreshClassData);

    const parcialLabel = activeParcial ? PARCIALES.find(p => p.num === activeParcial)?.label : '';
    const activeCriteria = activeParcial ? configs[activeParcial]?.criteria ?? [] : [];
    const classId = classInfo?.id;

    const returnToParciales = () => {
        setScreen('parciales');
        setActiveParcial(null);
        setSelectedTaskId(null);
        if (classId) window.history.pushState({}, '', buildDocenteClassUrl(classId));
    };

    const selectTask = (taskId: number | null) => {
        setSelectedTaskId(taskId);
        if (!classId || !activeParcial) return;
        if (taskId) {
            window.history.pushState({}, '', buildDocenteClassUrl(classId, activeParcial, taskId));
        } else {
            window.history.replaceState({}, '', buildDocenteClassUrl(classId, activeParcial));
        }
    };

    useEffect(() => {
        const syncFromBrowserHistory = () => {
            const routeState = getDocenteClassRoute();
            setSelectedTaskId(routeState.taskId);
            setActiveParcial(routeState.parcial);
            setScreen(routeState.parcial ? 'grades' : 'parciales');
            if (routeState.taskId) setActiveTab('activities');
        };
        window.addEventListener('popstate', syncFromBrowserHistory);
        return () => window.removeEventListener('popstate', syncFromBrowserHistory);
    }, []);

    return (
        <>
            <Head title={grupo ? `${grupo} — ${materia}` : "Cargando clase..."} />

            <div className="flex flex-col h-full bg-white overflow-x-hidden w-full animate-in fade-in duration-500">
                <GroupHeaderBanner
                    grupo={grupo}
                    materia={materia}
                    descripcion={classInfo?.materia_descripcion || classInfo?.descripcion || classInfo?.materia_detalle?.descripcion}
                    especialidad={especialidad}
                    semestre={semestre}
                    themeKey={themeKey}
                    showPaletteMenu={showPaletteMenu}
                    setShowPaletteMenu={setShowPaletteMenu}
                    handleThemeChange={handleThemeChange}
                    studentGradesCount={studentGrades.length || (classInfo && classInfo.students ? classInfo.students.length : 0)}
                    parcialesCount={PARCIALES.length}
                    configuredCount={Object.values(configs).filter(c => c.configured).length}
                    setIsGradesModalOpen={setIsGradesModalOpen}
                    activeCriteria={activeCriteria}
                    screen={screen}
                    onBack={() => {
                        returnToParciales();
                    }}
                />

                <div className="px-4 pb-6 pt-2 md:px-8 md:pb-8 md:pt-2 flex-1 flex flex-col space-y-3">
                    {isReadOnly && activeParcial && (
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                            <div className="bg-white p-2 rounded-xl text-amber-600 shadow-sm border border-amber-100">
                                <LockKeyhole size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">Periodo Bloqueado (Solo Lectura)</p>
                                <p className="text-[11px] text-amber-700 font-medium">{lockReason || 'El periodo de captura ha concluido o el ciclo se encuentra cerrado.'}</p>
                            </div>
                        </div>
                    )}

                    {screen === 'parciales' && (
                        <div className="flex flex-col flex-grow">
                            <ParcialHeader
                                title="Parciales de evaluación"
                                subtitle="Selecciona un parcial para revisar los criterios de evaluación y gestionar tus calificaciones"
                                count={3}
                                unitLabel="parciales"
                                themeKey={themeKey}
                                className="mb-6"
                            />
                            {/* Grid responsivo ajustado para evitar que las tarjetas se deformen en pantallas medianas */}
                            <div className="grid flex-grow grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                                 {PARCIALES.map(({ num, label }) => {
                                    const cfg = configs[num];
                                    const done = cfg?.configured;
                                    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

                                    // [LÓGICA SIMPLIFICADA] Bloqueado ÚNICAMENTE si el Admin lo tiene bloqueado en el servidor
                                    const isLocked = lockInfos[num]?.allowed === false;
                                    const currentLockReason = lockInfos[num]?.reason || 'El parcial se encuentra bloqueado por la administración.';

                                    return (
                                        <div
                                            key={num}
                                            onClick={() => !isLocked && openParcial(num)}
                                            onMouseEnter={(e) => {
                                                if (!isLocked) e.currentTarget.style.borderColor = activeTheme.strokeColor;
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isLocked) e.currentTarget.style.borderColor = '';
                                            }}
                                            className={`group relative flex flex-col justify-between h-full bg-white border rounded-xl p-6 sm:p-7 min-w-0 md:min-w-[260px] transition-all duration-300 ${
                                                isLocked
                                                    ? 'opacity-50 border-slate-100 cursor-not-allowed shadow-none grayscale'
                                                    : 'border-slate-200/80 hover:shadow-xl cursor-pointer shadow-xs'
                                            }`}
                                        >
                                            <div>
                                                {/* Cabecera de Estado y Reconfiguración */}
                                                <div className="flex items-center justify-between mb-5">
                                                    {isLocked ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider" title={currentLockReason}>
                                                            <LockKeyhole size={12} /> Bloqueado
                                                        </span>
                                                    ) : done ? (
                                                        <span 
                                                            style={{
                                                                backgroundColor: activeTheme.badgeHex,
                                                                color: activeTheme.textHex,
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                                                        >
                                                            <CheckCircle2 size={12} /> Configurado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f8fafc] text-slate-400 border border-slate-200/60 text-[10px] font-extrabold uppercase tracking-wider">
                                                            <Clock size={12} /> Pendiente
                                                        </span>
                                                    )}

                                                    {done && !isLocked && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                resetParcial(num);
                                                            }}
                                                            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                                                            title="Reconfigurar criterios"
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Título de la Unidad */}
                                                <div className="text-left mb-6">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">UNIDAD 0{num}</span>
                                                    <h4 
                                                        className="text-lg font-black text-slate-900 transition-colors"
                                                        onMouseEnter={(e) => (e.currentTarget.style.color = activeTheme.strokeColor)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                                    >
                                                        {label}
                                                    </h4>
                                                </div>

                                                {/* Desglose de Criterios con Mini Barras de Porcentaje */}
                                                <div className="space-y-3.5 mb-6 text-left">
                                                    {done ? (
                                                        <div className="space-y-3">
                                                            {cfg.criteria.map((c: any, idx: number) => (
                                                                <div key={c.id || idx} className="space-y-1">
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-slate-600 font-semibold truncate max-w-[140px]">{c.nombre || c.name}</span>
                                                                        <span className="text-[10px] text-slate-400 font-bold">{c.porcentaje ?? c.percentage}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full rounded-full transition-all duration-500"
                                                                            style={{
                                                                                backgroundColor: activeTheme.strokeColor,
                                                                                width: `${c.porcentaje ?? c.percentage}%`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                                            {isLocked ? currentLockReason : 'Aún no se han definido los criterios de evaluación.'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer: Estado y Botón de Acción */}
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                                <div className="flex flex-col text-left">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ESTADO</span>
                                                    <span className={`text-xs font-black ${done ? 'text-emerald-600' : 'text-slate-400'}`}>{done ? 'Configurado' : 'Sin configurar'}</span>
                                                </div>

                                                {isLocked ? (
                                                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-400 text-xs font-bold">Bloqueado</span>
                                                ) : done ? (
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
                                                        <span>Actividades</span>
                                                        <ChevronRight size={14} className="stroke-[3]" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200 text-xs font-bold shadow-none"
                                                    >
                                                        <span>Configurar</span>
                                                        <ChevronRight size={14} className="stroke-[3]" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {screen === 'wizard' && (
                        <WizardSetup 
                            wizardStep={wizardStep} 
                            setWizardStep={setWizardStep} 
                            draftCriteria={draftCriteria} 
                            parcialLabel={parcialLabel || ''} 
                            grupo={grupo} 
                            materia={materia} 
                            pctValid={pctValid} 
                            totalPct={totalPct} 
                            updateCriterion={updateCriterion} 
                            toggleSyncTasks={toggleSyncTasks} 
                            removeCriterion={removeCriterion} 
                            addCriterion={addCriterion} 
                            finishWizard={saveWizardConfig}
                            onBack={() => {
                                returnToParciales();
                            }}
                        />
                    )}

                    {screen === 'grades' && (
                        <div className="flex flex-col flex-grow space-y-3 px-2 pt-0">
                            <div className="flex justify-between items-center">
                                <BackButton onClick={() => {
                                    returnToParciales();
                                }} />
                                <button onClick={resetConfig} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 border border-slate-200 px-3 py-2 rounded-xl"><Settings size={13} /> Reconfigurar</button>
                            </div>
                            <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                            <div className="flex-grow">
                                {activeTab === 'grades' && <GradesTab studentGrades={studentGrades} setStudentGrades={setStudentGrades} activeCriteria={activeCriteria} getStudentTasksAverage={getStudentTasksAverage} setScore={setScore} handleAsentarCalificaciones={handleAsentarCalificaciones} handleConcludeParcial={handleConcludeParcial} isReadOnly={isReadOnly} isSaving={isSaving} themeKey={themeKey} />}
                                {activeTab === 'tasks' && <TasksTab tasks={tasks} setTasks={setTasks} studentGrades={studentGrades} getStudentTasksAverage={getStudentTasksAverage} saveTasks={saveTasks} isReadOnly={isReadOnly} isSaving={isSaving} themeKey={themeKey} />}
                                {activeTab === 'activities' && (
                                    selectedTaskId !== null ? (
                                        <TaskGradesModal selectedTaskId={selectedTaskId} setSelectedTaskId={selectTask} tasks={tasks} studentGrades={studentGrades} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} isPdfModalOpen={isPdfModalOpen} setIsPdfModalOpen={setIsPdfModalOpen} saveTasks={saveTasks} returnTaskGrade={returnTaskGrade} isReadOnly={isReadOnly} themeKey={themeKey} />
                                    ) : (
                                        <ActivitiesTab tasks={tasks} saveTasks={saveTasks} setSelectedTaskId={selectTask} grupo={grupo} materia={materia} parcialLabel={parcialLabel || ''} isReadOnly={isReadOnly} themeKey={themeKey} studentGrades={studentGrades.length > 0 ? studentGrades : students} classInfo={classInfo} />
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <FinalGradesModal
                isOpen={isGradesModalOpen}
                onClose={() => setIsGradesModalOpen(false)}
                grupo={grupo}
                materia={materia}
                students={students}
                getParcialAverage={getParcialAverage}
                getFinalAverage={getFinalAverage}
            />
        </>
    );
}

export default function DocenteGruposShow({ classInfo }: { classInfo: any }) {
    useRealtime();

    if (!classInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white">
                <DotsLoader
                    label="Cargando aula virtual"
                    sublabel="Sincronizando expedientes y criterios..."
                />
            </div>
        );
    }

    return <DocenteGruposContent classInfo={classInfo} />;
}

DocenteGruposShow.layout = getAuthenticatedNoPaddingLayout;

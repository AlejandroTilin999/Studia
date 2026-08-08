import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Deferred } from '@inertiajs/react';
import { ChevronRight, Settings, RotateCcw, ArrowLeft, CheckCircle2, LockKeyhole, Vote, BookOpen } from 'lucide-react';
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
import { useRealtime } from '@/hooks/useRealtime';

function DocenteGruposContent({ classInfo }: { classInfo: any }) {
    const { grupo, materia, especialidad, semestre, themeKey, showPaletteMenu, setShowPaletteMenu, handleThemeChange, screen, setScreen, activeParcial, setActiveParcial, configs, wizardStep, setWizardStep, draftCriteria, tasks, setTasks, saveTasks, activeTab, setActiveTab, students, studentGrades, setStudentGrades, getStudentTasksAverage, openParcial, saveWizardConfig, resetConfig, updateCriterion, toggleSyncTasks, addCriterion, removeCriterion, resetParcial, setScore, handleAsentarCalificaciones, returnTaskGrade, selectedTaskId, setSelectedTaskId, selectedStudentId, setSelectedStudentId, chatInputText, setChatInputText, isPdfModalOpen, setIsPdfModalOpen, isGradesModalOpen, setIsGradesModalOpen, privateMessages, sendPrivateMessage, getParcialAverage, getFinalAverage, isParcialClosed, totalPct, pctValid, isReadOnly, lockReason, lockInfos, isSaving, handleConcludeParcial } = useGroupClass(classInfo);

    const { subscribeToGroup } = useRealtime();

    // Subscribe to real-time events for this academic group
    subscribeToGroup(classInfo?.grupo_id);

    const parcialLabel = activeParcial ? PARCIALES.find(p => p.num === activeParcial)?.label : '';
    const activeCriteria = activeParcial ? configs[activeParcial]?.criteria ?? [] : [];

    return (
        <>
            <Head title={grupo ? `${grupo} — ${materia}` : "Cargando clase..."} />

            {/* Contenedor principal ajustado para ocupar el alto total disponible */}
            <div className="flex flex-col h-full min-h-[calc(100vh-100px)] p-4 md:p-6 space-y-4 animate-in fade-in duration-500">
                {screen !== 'parciales' && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold px-2">
                        <button onClick={() => {
                            setScreen('parciales');
                            setActiveParcial(null);
                            const url = new URL(window.location.href);
                            url.searchParams.delete('parcial');
                            window.history.replaceState({}, '', url.toString());
                        }} className="hover:text-[#1e88e5] transition-colors">Parciales</button>
                        <ChevronRight size={12} className="text-slate-300" />
                        <span className="text-slate-600">{parcialLabel}</span>
                        {screen === 'wizard' && (
                            <>
                                <ChevronRight size={12} className="text-slate-300" />
                                <span className="text-[#1e88e5]">Configurar criterios</span>
                            </>
                        )}
                    </div>
                )}

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

                <GroupHeaderBanner
                    grupo={grupo}
                    materia={materia}
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
                />

                {screen === 'parciales' && (
                    <div className="flex flex-col flex-grow">
                        <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider px-2">Selecciona un parcial</p>
                        {/* Grid responsivo que se estira al tamaño de la pantalla */}
                        <div className="grid flex-grow grid-cols-1 sm:grid-cols-3 gap-6 auto-rows-fr">
                            {PARCIALES.map(({ num, label }) => {
                                const cfg = configs[num];
                                const done = cfg?.configured;

                                // [SINCRONIZACIÓN v4.1] Bloqueo por servidor (Switch del Admin) o por secuencia
                                const serverLocked = lockInfos[num]?.allowed === false;
                                const sequenceLocked = num === 2 ? !isParcialClosed(1) : num === 3 ? (!isParcialClosed(1) || !isParcialClosed(2)) : false;
                                const isLocked = serverLocked || sequenceLocked;
                                const currentLockReason = serverLocked ? lockInfos[num]?.reason : 'Se desbloqueará al concluir el parcial anterior.';

                                return (
                                    <div key={num} onClick={() => !isLocked && openParcial(num)} className={`flex flex-col h-full bg-white border rounded-2xl p-6 shadow-sm transition-all ${isLocked ? 'opacity-60 border-slate-100 cursor-not-allowed' : 'border-slate-100 hover:shadow-lg hover:border-blue-200 cursor-pointer'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            {isLocked ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase" title={currentLockReason}><LockKeyhole size={14}/> Bloqueado</span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}><Vote size={14}/> {done ? 'Configurado':'Pendiente'}</span>
                                            )}
                                            {done && !isLocked && (
                                                <button onClick={(e)=>{ e.stopPropagation(); resetParcial(num); }} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"><RotateCcw size={14}/></button>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-5xl font-black text-slate-900">0{num}</div>
                                            <h3 className="text-lg font-extrabold text-slate-800">{label}</h3>
                                        </div>

                                        <div className="flex-grow overflow-y-auto mb-6">
                                            {done ? (
                                                <div className="space-y-2">
                                                    {cfg.criteria.map((c: any)=>(
                                                        <div key={c.id} className="flex justify-between text-sm"><span className="text-slate-500 truncate">{c.nombre || c.name}</span><span className="font-bold">{c.porcentaje ?? c.percentage}%</span></div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 leading-relaxed">{isLocked ? currentLockReason : 'Configura los criterios de evaluación para este parcial.'}</p>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            {isLocked ? (
                                                <div className="h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold">Bloqueado</div>
                                            ) : done ? (
                                                <div className="h-10 flex items-center justify-center gap-2 rounded-full bg-[#0066CC] text-white font-bold"><CheckCircle2 size={15}/> Ver calificaciones</div>
                                            ) : (
                                                <div className="h-10 flex items-center justify-center gap-2 rounded-full border border-amber-300 text-amber-500 font-bold"><Settings size={15}/> Configurar</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {screen === 'wizard' && (
                    <WizardSetup wizardStep={wizardStep} setWizardStep={setWizardStep} draftCriteria={draftCriteria} parcialLabel={parcialLabel || ''} grupo={grupo} materia={materia} pctValid={pctValid} totalPct={totalPct} updateCriterion={updateCriterion} toggleSyncTasks={toggleSyncTasks} removeCriterion={removeCriterion} addCriterion={addCriterion} finishWizard={saveWizardConfig} />
                )}

                {screen === 'grades' && (
                    <div className="flex flex-col flex-grow space-y-4 px-2">
                        <div className="flex justify-between items-center">
                            <BackButton onClick={() => {
                                setScreen('parciales');
                                setActiveParcial(null);
                                const url = new URL(window.location.href);
                                url.searchParams.delete('parcial');
                                window.history.replaceState({}, '', url.toString());
                            }} />
                            <button onClick={resetConfig} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 border border-slate-200 px-3 py-2 rounded-xl"><Settings size={13} /> Reconfigurar</button>
                        </div>
                        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        <div className="flex-grow">
                            {activeTab === 'grades' && <GradesTab studentGrades={studentGrades} setStudentGrades={setStudentGrades} activeCriteria={activeCriteria} getStudentTasksAverage={getStudentTasksAverage} setScore={setScore} handleAsentarCalificaciones={handleAsentarCalificaciones} handleConcludeParcial={handleConcludeParcial} isReadOnly={isReadOnly} isSaving={isSaving} />}
                            {activeTab === 'tasks' && <TasksTab tasks={tasks} setTasks={setTasks} studentGrades={studentGrades} getStudentTasksAverage={getStudentTasksAverage} saveTasks={saveTasks} isReadOnly={isReadOnly} isSaving={isSaving} />}
                            {activeTab === 'activities' && (
                                selectedTaskId !== null ? (
                                    <TaskGradesModal selectedTaskId={selectedTaskId} setSelectedTaskId={setSelectedTaskId} tasks={tasks} studentGrades={studentGrades} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} privateMessages={privateMessages} chatInputText={chatInputText} setChatInputText={setChatInputText} sendPrivateMessage={sendPrivateMessage} isPdfModalOpen={isPdfModalOpen} setIsPdfModalOpen={setIsPdfModalOpen} saveTasks={saveTasks} returnTaskGrade={returnTaskGrade} isReadOnly={isReadOnly} />
                                ) : (
                                    <ActivitiesTab tasks={tasks} saveTasks={saveTasks} setSelectedTaskId={setSelectedTaskId} grupo={grupo} materia={materia} isReadOnly={isReadOnly} themeKey={themeKey} />
                                )
                            )}
                        </div>
                    </div>
                )}
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
    return (
        <AuthenticatedLayout noPadding>
            <Deferred data="classInfo" fallback={
                <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white">
                    <DotsLoader
                        label="Cargando aula virtual"
                        sublabel="Sincronizando expedientes y criterios..."
                    />
                </div>
            }>
                <DocenteGruposContent classInfo={classInfo} />
            </Deferred>
        </AuthenticatedLayout>
    );
}

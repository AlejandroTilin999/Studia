import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    ChevronRight,
    Settings,
    RotateCcw,
    ArrowLeft,
    CheckCircle2,
} from 'lucide-react';
import { PARCIALES } from './Show/services/constants';

// Modulares refactorizados
import { useGroupClass } from './Show/hooks/useGroupClass';
import GroupHeaderBanner from './Show/components/GroupHeaderBanner';
import CriteriaGrid from './Show/components/CriteriaGrid';
import NavigationTabs from './Show/components/NavigationTabs';
import WizardSetup from './Show/components/WizardSetup';
import ActivitiesTab from './Show/components/ActivitiesTab';
import TasksTab from './Show/components/TasksTab';
import GradesTab from './Show/components/GradesTab';
import FinalGradesModal from './Show/components/FinalGradesModal';
import TaskGradesModal from './Show/components/TaskGradesModal';

export default function DocenteGruposShow() {
    const {
        grupo,
        materia,
        themeKey,
        showPaletteMenu,
        setShowPaletteMenu,
        handleThemeChange,
        screen,
        setScreen,
        activeParcial,
        setActiveParcial,
        configs,
        wizardStep,
        setWizardStep,
        draftCriteria,
        tasks,
        saveTasks,
        activeTab,
        setActiveTab,
        studentGrades,
        getStudentTasksAverage,
        openParcial,
        saveWizardConfig,
        resetConfig,
        updateCriterion,
        toggleSyncTasks,
        addCriterion,
        removeCriterion,
        resetParcial,
        setScore,
        handleAsentarCalificaciones,
        selectedTaskId,
        setSelectedTaskId,
        selectedStudentId,
        setSelectedStudentId,
        chatInputText,
        setChatInputText,
        isPdfModalOpen,
        setIsPdfModalOpen,
        isGradesModalOpen,
        setIsGradesModalOpen,
        privateMessages,
        sendPrivateMessage,
        getParcialAverage,
        getFinalAverage,
        totalPct,
        pctValid
    } = useGroupClass();

    const parcialLabel = activeParcial ? PARCIALES.find(p => p.num === activeParcial)?.label : '';
    const activeCriteria = activeParcial ? configs[activeParcial]?.criteria ?? [] : [];

    return (
        <AuthenticatedLayout>
            <Head title={`${grupo} — ${materia}`} />
            <div className="space-y-6">

                {/* Contexto de ubicación (solo en wizard/grades) */}
                {screen !== 'parciales' && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-slate-400 font-semibold">
                        <button onClick={() => { setScreen('parciales'); setActiveParcial(null); }} className="hover:text-[#1e88e5] transition-colors">
                            Parciales
                        </button>
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

                {/* ══════ BANNER SUPERIOR DEL GRUPO + CARDS AL LADO ══════ */}
                <GroupHeaderBanner
                    grupo={grupo}
                    materia={materia}
                    themeKey={themeKey}
                    showPaletteMenu={showPaletteMenu}
                    setShowPaletteMenu={setShowPaletteMenu}
                    handleThemeChange={handleThemeChange}
                    studentGradesCount={studentGrades.length}
                    parcialesCount={PARCIALES.length}
                    configuredCount={Object.values(configs).filter(c => c.configured).length}
                    setIsGradesModalOpen={setIsGradesModalOpen}
                />

                {/* ══════ PANTALLA: PARCIALES ══════ */}
                {screen === 'parciales' && (
                    <div className="text-left">
                        <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">Selecciona un parcial</p>

                        {/* Cards de parciales */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {PARCIALES.map(({ num, label }) => {
                                const cfg = configs[num];
                                const done = cfg?.configured;
                                return (
                                    <div
                                        key={num}
                                        className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group text-left"
                                        onClick={() => openParcial(num)}
                                    >
                                        {/* Badge estado */}
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
                                                {done ? '✓ Configurado' : 'Pendiente'}
                                            </span>
                                            {done && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); resetParcial(num); }}
                                                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-all"
                                                    title="Reconfigurar"
                                                >
                                                    <RotateCcw size={13} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Número y label */}
                                        <div>
                                            <div className="text-4xl font-black text-slate-900 leading-none mb-1 transition-colors">
                                                0{num}
                                            </div>
                                            <h3 className="text-base font-extrabold text-slate-800">{label}</h3>
                                        </div>

                                        {/* Criterios o prompt */}
                                        {done ? (
                                            <div className="space-y-1.5">
                                                {cfg.criteria.map(c => (
                                                    <div key={c.id} className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-500 font-semibold truncate">{c.name}</span>
                                                        <span className="font-extrabold text-slate-700 ml-2">{c.percentage}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                                Configura los criterios de evaluación para este parcial.
                                            </p>
                                        )}

                                        {/* CTA */}
                                        <div className="mt-auto pt-2">
                                            {done ? (
                                                <div className="h-9 px-5 bg-[#0066CC] text-white rounded-t-full rounded-bl-full rounded-br-none flex items-center justify-center gap-1.5 text-[11px] font-black hover:bg-[#0055aa] transition-all hover:scale-[1.02] active:scale-[0.98] w-full">
                                                    <CheckCircle2 size={13} />
                                                    Ver calificaciones
                                                </div>
                                            ) : (
                                                <div className="h-9 px-5 bg-transparent border border-amber-300 text-amber-500 rounded-t-full rounded-bl-full rounded-br-none flex items-center justify-center gap-1.5 text-[11px] font-black hover:bg-amber-50/40 transition-all hover:scale-[1.02] active:scale-[0.98] w-full">
                                                    <Settings size={13} />
                                                    Configurar
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ══════ PANTALLA: WIZARD ══════ */}
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
                    />
                )}

                {/* ══════ PANTALLA: CALIFICACIONES (GRADES) ══════ */}
                {screen === 'grades' && (
                    <div className="space-y-6">
                        {/* Botón Volver y Reconfigurar */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setScreen('parciales'); setActiveParcial(null); }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-all"
                                >
                                    <ArrowLeft size={13} />
                                    Volver a Parciales
                                </button>
                            </div>
                            <button
                                onClick={resetConfig}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-655 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-all"
                            >
                                <Settings size={13} />
                                Reconfigurar criterios
                            </button>
                        </div>

                        {/* Chips de criterios (Grid cuadrado a todo el ancho) */}
                        <CriteriaGrid activeCriteria={activeCriteria} />

                        {/* Pestañas (Tabs) */}
                        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                        {/* Pestaña: Registro General de Calificaciones */}
                        {activeTab === 'grades' && (
                            <GradesTab
                                studentGrades={studentGrades}
                                activeCriteria={activeCriteria}
                                getStudentTasksAverage={getStudentTasksAverage}
                                setScore={setScore}
                                handleAsentarCalificaciones={handleAsentarCalificaciones}
                            />
                        )}

                        {/* Pestaña: Calificar Actividades */}
                        {activeTab === 'tasks' && (
                            <TasksTab
                                tasks={tasks}
                                studentGrades={studentGrades}
                                getStudentTasksAverage={getStudentTasksAverage}
                                saveTasks={saveTasks}
                            />
                        )}

                        {/* Pestaña: Crear y Ver Actividades */}
                        {activeTab === 'activities' && (
                            <div>
                                {selectedTaskId !== null ? (
                                    <TaskGradesModal
                                        selectedTaskId={selectedTaskId}
                                        setSelectedTaskId={setSelectedTaskId}
                                        tasks={tasks}
                                        studentGrades={studentGrades}
                                        selectedStudentId={selectedStudentId}
                                        setSelectedStudentId={setSelectedStudentId}
                                        privateMessages={privateMessages}
                                        chatInputText={chatInputText}
                                        setChatInputText={setChatInputText}
                                        sendPrivateMessage={sendPrivateMessage}
                                        isPdfModalOpen={isPdfModalOpen}
                                        setIsPdfModalOpen={setIsPdfModalOpen}
                                        saveTasks={saveTasks}
                                    />
                                ) : (
                                    <ActivitiesTab
                                        tasks={tasks}
                                        saveTasks={saveTasks}
                                        setSelectedTaskId={setSelectedTaskId}
                                        grupo={grupo}
                                        materia={materia}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Libreta de Calificaciones Finales del Curso */}
            <FinalGradesModal
                isOpen={isGradesModalOpen}
                onClose={() => setIsGradesModalOpen(false)}
                grupo={grupo}
                materia={materia}
                getParcialAverage={getParcialAverage}
                getFinalAverage={getFinalAverage}
            />
        </AuthenticatedLayout>
    );
}

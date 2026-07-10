import * as React from 'react';
import { ChevronRight, ChevronLeft, GraduationCap } from 'lucide-react';

interface Subject {
    name: string;
    iconName: string;
    teacher: string;
    description: string;
}

interface Task {
    id: number;
    subjectName?: string;
    title: string;
    status: string;
    desc: string;
    points?: string;
    deadline?: string;
}

interface SubjectHeaderProps {
    subject?: Subject | null;
    task?: Task | null;
    activeTab?: 'novedades' | 'trabajo';
    setActiveTab?: (tab: 'novedades' | 'trabajo') => void;
    onBack: () => void;
    onBackToSubject?: () => void;
}

export default function SubjectHeader({ 
    subject, 
    task,
    activeTab, 
    setActiveTab, 
    onBack,
    onBackToSubject
}: SubjectHeaderProps) {
    return (
        <div className="bg-white border-b border-slate-200/80 w-full select-none">
            {/* Top breadcrumb & navigation bar */}
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Navigation path */}
                <div className="flex items-center gap-3">

                    {/* Well-made breadcrumbs list */}
                    <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-slate-400">
                        {subject ? (
                            <>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="hover:text-[#0266E0] transition-colors text-sm font-bold text-slate-400"
                                >
                                    Mis Materias
                                </button>
                                
                                <ChevronRight size={14} className="text-slate-300" />
                                
                                {task ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={onBackToSubject}
                                            className="hover:text-[#0266E0] transition-colors text-left truncate max-w-[120px] sm:max-w-[200px] text-sm font-bold text-slate-400"
                                        >
                                            {subject.name}
                                        </button>
                                        <ChevronRight size={14} className="text-slate-300" />
                                        <span className="text-[#0f172a] font-black text-sm block truncate max-w-[150px] sm:max-w-[250px]">
                                            {task.title}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-[#0f172a] font-black text-sm block truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                        {subject.name}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-[#0f172a] font-black text-sm block">
                                Mis Materias
                            </span>
                        )}
                    </div>
                </div>

                {/* Subtext info (Teacher card - shown when subject is selected) */}
                {subject && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full shrink-0 self-start sm:self-center shadow-none">
                        <div className="bg-[#0266E0]/10 text-[#0266E0] p-1 rounded-full">
                            <GraduationCap size={14} className="stroke-[2.5]" />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-slate-600">
                            Docente: {subject.teacher}
                        </span>
                    </div>
                )}

            </div>

            {/* Pill Tabs selector (only shown when a subject is active, no task is active, and tabs states are provided) */}
            {subject && !task && activeTab && setActiveTab && (
                <div className="max-w-7xl mx-auto px-6 pb-px flex">
                    <div className="flex bg-slate-100 rounded-xl overflow-hidden mb-3.5 w-fit border border-slate-200/30 shadow-none">
                        <button
                            type="button"
                            onClick={() => setActiveTab('novedades')}
                            className={`px-5 py-2 text-xs font-bold transition-all outline-none ${
                                activeTab === 'novedades'
                                    ? 'bg-[#0266E0] text-white font-extrabold'
                                    : 'bg-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Inicio Materia
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('trabajo')}
                            className={`px-5 py-2 text-xs font-bold transition-all outline-none ${
                                activeTab === 'trabajo'
                                    ? 'bg-[#0266E0] text-white font-extrabold'
                                    : 'bg-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Tareas Asignadas
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

import * as React from 'react';
import { ChevronRight, GraduationCap, Layers, Palette, ArrowLeft } from 'lucide-react';
import { COLOR_THEMES } from '@/Pages/Docente/Grupos/ColorThemes';

interface Subject {
    id?: string | number;
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
    // Definimos un tema por defecto para el alumno (por ejemplo azul) o basado en el índice si lo tuviéramos.
    // Para simplificar usamos el azul institucional.
    const themeKey = 'blue';
    const groupColors = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div className="w-full select-none space-y-4">
            {/* Banner de la Materia (Estilo Docente) */}
            {subject && !task && (
                <div className="px-6 md:px-8 pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Banner Principal */}
                        <div className={`relative overflow-hidden rounded-lg border p-8 sm:p-10 flex flex-col justify-center min-h-[220px] shadow-none lg:col-span-2 ${groupColors.bg} ${groupColors.border}`}>
                            {/* Decoración geométrica */}
                            <div className="absolute left-0 top-0 bottom-0 w-48 overflow-hidden pointer-events-none z-0">
                                <svg className="absolute -left-6 top-1 w-44 h-48 opacity-20" viewBox="0 0 120 140" fill="none">
                                    <path d="M10 10 Q50 60 20 100 T100 120" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <div className="absolute left-10 top-4 w-14 h-14 bg-[#4db6ac] rotate-12 opacity-20" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                                <div className="absolute -left-8 top-12 w-24 h-12 bg-[#ab47bc] rotate-45 opacity-15 rounded-md" />
                                <div className="absolute left-8 top-28 w-12 h-12 bg-[#1e88e5] rounded-full opacity-20" />
                            </div>

                            {/* Grid overlay sutil */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e88e505_1px,transparent_1px),linear-gradient(to_bottom,#1e88e505_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />

                            <div className="relative z-10 space-y-4 text-left">
                                {/* Pill superior */}
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg w-fit text-[11px] font-black tracking-widest uppercase ${groupColors.badgeBg} ${groupColors.text}`}>
                                    <Layers size={13} className={groupColors.text} />
                                    <span>Portal de Asignatura</span>
                                </div>

                                <div className="space-y-1.5">
                                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
                                        {subject.name}
                                    </h1>
                                    <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-2xl">
                                        {subject.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Widget de Información Rápida (Estilo Docente) */}
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 sm:p-8 flex flex-col justify-between h-full select-none text-left">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Información Académica</h3>

                            <div className="flex-1 flex flex-col justify-center gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <GraduationCap size={15} className="text-slate-800 shrink-0" />
                                        <span className="text-xs font-semibold text-slate-600">Docente titular</span>
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-100 truncate max-w-[120px]" title={subject.teacher}>{subject.teacher}</span>
                                </div>

                                <div className="h-px bg-slate-200/50 w-full" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <Palette size={15} className="text-slate-800 shrink-0" />
                                        <span className="text-xs font-semibold text-slate-600">Estado</span>
                                    </div>
                                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">Activa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border-b border-slate-200/80 w-full">

            </div>
        </div>
    );
}

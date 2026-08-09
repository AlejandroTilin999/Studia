import * as React from 'react';
import { ChevronRight, GraduationCap, Layers, Palette, ArrowLeft, School, ExternalLink, FileText } from 'lucide-react';
import { COLOR_THEMES } from '@/constants/ColorThemes';

interface Subject {
    id?: string | number;
    name: string;
    iconName: string;
    teacher: string;
    description: string;
    color_tema?: string;
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
    activeCriteria?: any[];
}

export default function SubjectHeader({
    subject,
    task,
    activeTab,
    setActiveTab,
    onBack,
    onBackToSubject,
    activeCriteria = []
}: SubjectHeaderProps) {
    const themeKey = subject?.color_tema || 'blue';
    const groupColors = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div className="w-full select-none space-y-4">
            {/* Banner de la Materia (Estilo Docente) */}
            {subject && !task && (
                <div className="px-0 sm:px-6 md:px-8 pt-0 sm:pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Banner Principal (Full Bleed en Móvil) */}
                        <div 
                            style={{ backgroundColor: groupColors.bgHex }}
                            className={`relative overflow-hidden rounded-none sm:rounded-2xl border-b sm:border border-x-0 border-t-0 sm:border-x sm:border-t px-6 sm:px-8 lg:px-10 py-7 sm:py-8 flex flex-col justify-center min-h-[220px] sm:min-h-[230px] shadow-none lg:col-span-2 ${groupColors.border}`}
                        >
                            {/* Decoración geométrica */}
                            <div className="absolute left-0 top-0 bottom-0 w-48 overflow-hidden pointer-events-none z-0">
                                <svg className="absolute -left-6 top-1 w-44 h-48 opacity-20" viewBox="0 0 120 140" fill="none">
                                    <path d="M10 10 Q50 60 20 100 T100 120" stroke={groupColors.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                                <div className="absolute left-10 top-4 w-14 h-14 bg-[#4db6ac] rotate-12 opacity-20" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                                <div className="absolute -left-8 top-12 w-24 h-12 bg-[#ab47bc] rotate-45 opacity-15 rounded-md" />
                                <div className="absolute left-8 top-28 w-12 h-12 bg-[#1e88e5] rounded-full opacity-20" />
                            </div>

                            {/* Grid overlay sutil */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e88e505_1px,transparent_1px),linear-gradient(to_bottom,#1e88e505_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />

                            <div className="relative z-10 space-y-2.5 text-left pr-4 sm:pr-0">
                                {/* Pill superior */}
                                <div 
                                    style={{ 
                                        color: groupColors.textHex,
                                        backgroundColor: groupColors.badgeHex
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg w-fit text-[10.5px] sm:text-[11.5px] font-extrabold tracking-wide uppercase shadow-xs"
                                >
                                    <Layers size={12} style={{ color: groupColors.textHex }} />
                                    <span>Portal de Asignatura</span>
                                </div>

                                <div className="space-y-1">
                                    {(subject as any).specialty && (
                                        <p 
                                            style={{ color: groupColors.textHex }}
                                            className="text-[11px] sm:text-[12px] font-black uppercase tracking-wider"
                                        >
                                            {(subject as any).specialty}
                                        </p>
                                    )}
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight leading-snug">
                                        {subject.name} {(subject as any).group_name ? `(${(subject as any).group_name})` : ''}
                                    </h1>
                                    <p className="text-xs sm:text-[13px] font-medium text-slate-500 leading-relaxed text-justify max-w-lg">
                                        {subject.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Widget de Información Rápida (Estilo Docente) */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col justify-center h-full select-none text-left">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Información Académica</h3>

                            <div className="flex flex-col justify-center gap-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-normal text-slate-600">Docente titular</span>
                                    <span className="text-[12px] font-bold text-slate-800 truncate max-w-[120px]" title={subject.teacher}>{subject.teacher}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-normal text-slate-600">Estado</span>
                                    <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">Activa</span>
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

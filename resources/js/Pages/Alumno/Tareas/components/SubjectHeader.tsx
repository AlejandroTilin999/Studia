import * as React from 'react';
import { ChevronDown, Layers } from 'lucide-react';
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
    tasks?: Task[];
    subjectKardex?: any;
}

export default function SubjectHeader({
    subject,
    task,
    activeTab,
    setActiveTab,
    onBack,
    onBackToSubject,
    activeCriteria = [],
    tasks = [],
    subjectKardex = null
}: SubjectHeaderProps) {
    const themeKey = subject?.color_tema || 'blue';
    const groupColors = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    const [isExpandedDesc, setIsExpandedDesc] = React.useState(false);

    // Métricas Reales y Útiles para el Alumno
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Entregado' || t.status === 'Calificado').length;
    const pendingTask = tasks.find(t => t.status !== 'Entregado' && t.status !== 'Calificado' && t.deadline);

    const rawAverage = subjectKardex?.score ?? subjectKardex?.average;
    const averageGrade = rawAverage !== null && rawAverage !== undefined && rawAverage !== '' && Number.isFinite(Number(rawAverage))
        ? rawAverage
        : '\u2014';

    const sName = (subject?.name || '').toLowerCase();
    const isSpecialty = Boolean(
        (subject as any)?.specialty ||
        sName.includes('base') ||
        sName.includes('datos') ||
        sName.includes('web') ||
        sName.includes('seguridad') ||
        sName.includes('program') ||
        sName.includes('redes') ||
        sName.includes('software') ||
        sName.includes('diseño') ||
        sName.includes('sistemas') ||
        sName.includes('técnico') ||
        sName.includes('tecnico')
    );

    return (
        <div className="w-full select-none">
            {/* Banner de la Materia (Ajustado perfectamente sin márgenes negativos que desborden en móvil) */}
            {subject && !task && (
                <div className="w-full border-b border-slate-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch min-h-[260px] sm:min-h-[290px]">
                        {/* Banner Principal */}
                        <div
                            style={{ backgroundColor: groupColors.bgHex }}
                            className={`relative overflow-hidden px-5 sm:px-10 lg:px-14 py-6 sm:py-12 flex flex-col justify-center h-full shadow-none lg:col-span-2 ${groupColors.border}`}
                        >
                            {/* Decoración geométrica sutil alineada al tema de la materia */}
                            <div className="absolute left-0 top-0 bottom-0 w-48 overflow-hidden pointer-events-none z-0">
                                <svg className="absolute -left-6 top-1 w-44 h-48 opacity-30" viewBox="0 0 120 140" fill="none">
                                    <path d="M10 10 Q50 60 20 100 T100 120" stroke={groupColors.strokeColor} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <div
                                    style={{ backgroundColor: groupColors.strokeColor, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                                    className="absolute left-6 top-4 w-12 h-12 rotate-12 opacity-25"
                                />
                                <div
                                    style={{ backgroundColor: groupColors.strokeColor }}
                                    className="absolute -left-8 top-12 w-24 h-12 rotate-45 opacity-20 rounded-md"
                                />
                                <div
                                    style={{ backgroundColor: groupColors.strokeColor }}
                                    className="absolute left-8 top-28 w-12 h-12 rounded-full opacity-25"
                                />
                            </div>

                            {/* Grid overlay sutil */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e88e505_1px,transparent_1px),gradient(to_bottom,#1e88e505_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />

                            <div className="relative z-10 space-y-3 text-left pl-0 sm:pl-2 pr-0 sm:pr-4">
                                {/* Pill superior */}
                                <div
                                    style={{
                                        color: groupColors.textHex,
                                        backgroundColor: groupColors.badgeHex
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg w-fit text-[11px] sm:text-[12px] font-black tracking-wider uppercase shadow-xs"
                                >
                                    <Layers size={13} style={{ color: groupColors.textHex }} />
                                    <span>Portal de Asignatura</span>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    {(subject as any).specialty && (
                                        <p
                                            style={{ color: groupColors.textHex }}
                                            className="text-xs sm:text-[13px] font-black uppercase tracking-wider"
                                        >
                                            {(subject as any).specialty}
                                        </p>
                                    )}

                                    <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-slate-800 tracking-tight leading-tight break-words">
                                        <span className="block sm:inline">{subject.name}</span>
                                        {((subject as any).group_name || (subject as any).nombre_grupo) && (
                                            <>
                                                <span className="hidden sm:inline text-slate-800 ml-2">
                                                    ({(subject as any).group_name || (subject as any).nombre_grupo})
                                                </span>
                                                <span className="block sm:hidden text-slate-700/90 font-black text-sm sm:text-base mt-1 tracking-tight">
                                                    {(subject as any).group_name || (subject as any).nombre_grupo}
                                                </span>
                                            </>
                                        )}
                                    </h1>
                                    <div>
                                        <p className={`text-xs sm:text-[14.5px] font-medium text-slate-600/90 leading-relaxed max-w-full lg:max-w-4xl xl:max-w-5xl text-left pr-0 sm:pr-6 ${isExpandedDesc ? '' : 'line-clamp-2 sm:line-clamp-none'}`}>
                                            {subject.description}
                                        </p>
                                        {subject.description && subject.description.length > 80 && (
                                            <button
                                                type="button"
                                                onClick={() => setIsExpandedDesc(!isExpandedDesc)}
                                                className="sm:hidden mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#0266E0] hover:opacity-80 transition-opacity no-underline border-none bg-transparent p-0 select-none"
                                            >
                                                <span>{isExpandedDesc ? 'Ver menos' : 'Ver más'}</span>
                                                <ChevronDown size={12} className={`stroke-[2.5] transition-transform duration-200 ${isExpandedDesc ? 'rotate-180' : 'rotate-0'}`} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Widget de Información Rápida */}
                        <div className="bg-white border-t lg:border-t-0 lg:border-l border-slate-200 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col justify-center h-full select-none text-left shadow-none overflow-hidden">
                            <h3 className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Información Académica</h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3 text-xs sm:text-xs">
                                    <span className="font-semibold text-slate-500 shrink-0">Docente titular</span>
                                    <span className="font-bold text-slate-800 truncate text-right max-w-[180px] sm:max-w-[220px]" title={subject.teacher}>{subject.teacher}</span>
                                </div>

                                <div className="flex items-center justify-between gap-3 text-xs sm:text-xs">
                                    <span className="font-semibold text-slate-500 shrink-0">Promedio General</span>
                                    <span className="font-bold text-slate-800 text-right">
                                        {averageGrade}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3 text-xs sm:text-xs">
                                    <span className="font-semibold text-slate-500 shrink-0">Tipo de Materia</span>
                                    <span className="font-bold text-slate-800 truncate text-right max-w-[180px] sm:max-w-[220px]">
                                        {isSpecialty ? 'Materia de Especialidad' : 'Formación General'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3 text-xs sm:text-xs">
                                    <span className="font-semibold text-slate-500 shrink-0">Fase del Ciclo</span>
                                    <span className="font-bold text-slate-800 text-right">
                                        Evaluación Activa
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

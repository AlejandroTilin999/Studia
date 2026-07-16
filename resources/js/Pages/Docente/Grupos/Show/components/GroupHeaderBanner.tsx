import { Palette, Layers, Users, BookOpen, CheckCircle2, FileText, GraduationCap, School } from 'lucide-react';
import { COLOR_THEMES } from '../../ColorThemes';

interface GroupHeaderBannerProps {
    grupo: string;
    materia: string;
    especialidad?: string;
    semestre?: string;
    themeKey: string;
    showPaletteMenu: boolean;
    setShowPaletteMenu: (show: boolean) => void;
    handleThemeChange: (key: string) => void;
    studentGradesCount: number;
    parcialesCount: number;
    configuredCount: number;
    setIsGradesModalOpen: (open: boolean) => void;
}

export default function GroupHeaderBanner({
    grupo,
    materia,
    especialidad = 'General',
    semestre = '1',
    themeKey,
    showPaletteMenu,
    setShowPaletteMenu,
    handleThemeChange,
    studentGradesCount,
    parcialesCount,
    configuredCount,
    setIsGradesModalOpen
}: GroupHeaderBannerProps) {
    const groupColors = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Banner de color dinámico del grupo */}
            <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 lg:p-7 xl:p-10 flex flex-col justify-center min-h-[135px] lg:min-h-[160px] xl:min-h-[260px] 2xl:min-h-[300px] select-none ${groupColors.bg} ${groupColors.border} lg:col-span-2 shadow-none`}>
                {/* Selector de color (paleta) */}
                <div className="absolute right-4 top-4 z-20">
                    <button
                        onClick={() => setShowPaletteMenu(!showPaletteMenu)}
                        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center border border-slate-200/50 shadow-sm transition-all"
                        title="Cambiar color del banner"
                    >
                        <Palette size={14} />
                    </button>

                    {showPaletteMenu && (
                        <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-xl p-2.5 shadow-lg flex gap-2 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                            {Object.entries(COLOR_THEMES).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => handleThemeChange(key)}
                                    className={`w-6 h-6 rounded-full ${value.dotBg} border-2 ${themeKey === key ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'} hover:scale-105 transition-all`}
                                    title={key}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Decoración geométrica */}
                <div className="absolute left-0 top-0 bottom-0 w-40 overflow-hidden pointer-events-none z-0">
                    <svg className="absolute -left-4 top-2 w-36 h-40 opacity-20" viewBox="0 0 120 140" fill="none">
                        <path d="M10 10 Q50 60 20 100 T100 120" stroke={groupColors.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute left-8 top-3 w-10 h-10 bg-[#4db6ac] rotate-12 opacity-20" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                    <div className="absolute -left-6 top-10 w-16 h-8 bg-[#ab47bc] rotate-45 opacity-15 rounded-md" />
                    <div className="absolute left-6 top-24 w-8 h-8 bg-[#1e88e5] rounded-full opacity-20" />
                </div>

                {/* Grid overlay sutil */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e88e505_1px,transparent_1px),linear-gradient(to_bottom,#1e88e505_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />

                <div className="relative z-10 space-y-3 text-left">
                    {/* Pill superior */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg w-fit text-[11.5px] font-extrabold tracking-wide uppercase ${groupColors.badgeBg} ${groupColors.text}`}>
                        <Layers size={12.5} className={groupColors.text} />
                        <span>Carga Docente</span>
                    </div>

                    <div className="space-y-1">
                        <p className={`text-[12px] font-black uppercase tracking-wider ${groupColors.textMateria}`}>{materia}</p>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                            Grupo {grupo}
                        </h1>
                        <p className="text-[13.5px] font-semibold text-slate-500 leading-relaxed max-w-lg">
                            Gestiona los parciales, configura criterios de evaluación y captura calificaciones de tus alumnos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Widget único de Resumen del Grupo al lado */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-9 shadow-none flex flex-col justify-between h-full lg:col-span-1 min-h-[135px] lg:min-h-[160px] xl:min-h-[260px] 2xl:min-h-[300px] select-none text-left font-body">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Información del Grupo</h3>

                <div className="flex-1 flex flex-col justify-center gap-2.5">
                    {/* Item: Semestre */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <School size={15} className="text-slate-800 shrink-0" />
                            <span className="text-xs font-semibold text-slate-600">Semestre</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{semestre}°</span>
                    </div>

                    <div className="h-px bg-slate-50 w-full" />

                    {/* Item: Especialidad */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <GraduationCap size={15} className="text-slate-800 shrink-0" />
                            <span className="text-xs font-semibold text-slate-600">Bachillerato</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 max-w-[120px] truncate" title={especialidad}>{especialidad}</span>
                    </div>

                    <div className="h-px bg-slate-50 w-full" />

                    {/* Item: Alumnos */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Users size={15} className="text-slate-800 shrink-0" />
                            <span className="text-xs font-semibold text-slate-600">Alumnos inscritos</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{studentGradesCount}</span>
                    </div>

                    <div className="h-px bg-slate-50 w-full" />

                    {/* Item: Configurados */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 size={15} className="text-slate-800 shrink-0" />
                            <span className="text-xs font-semibold text-slate-600">Parciales Configurados</span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-lg border border-emerald-100/40">
                            {configuredCount} / {parcialesCount}
                        </span>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    {/* Acceso a Calificaciones Generales */}
                    <button
                        onClick={() => setIsGradesModalOpen(true)}
                        className="w-full mt-1.5 flex items-center justify-center gap-2 py-3 bg-[#0266E0] hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all active:scale-[0.98] shadow-sm hover:shadow active:shadow-none"
                    >
                        <FileText size={14} />
                        Calificaciones Finales
                    </button>
                </div>
            </div>
        </div>
    );
}

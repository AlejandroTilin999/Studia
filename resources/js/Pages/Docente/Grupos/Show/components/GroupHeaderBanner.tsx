import { Palette, Layers, ChevronLeft, FileText } from 'lucide-react';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import { Criterion } from '../services/constants';

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
    activeCriteria?: Criterion[];
    screen?: string;
    onBack?: () => void;
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
    setIsGradesModalOpen,
    activeCriteria = [],
    screen = 'parciales',
    onBack
}: GroupHeaderBannerProps) {
    const groupColors = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Banner de color dinámico del grupo (Full Bleed en Móvil) */}
            <div 
                style={{ backgroundColor: groupColors.bgHex }}
                className={`relative overflow-hidden -mx-4 sm:mx-0 -mt-4 sm:mt-0 rounded-none sm:rounded-2xl border-b sm:border border-x-0 border-t-0 sm:border-x sm:border-t p-7 sm:p-8 lg:p-9 xl:p-10 flex flex-col justify-center min-h-[220px] sm:min-h-[230px] lg:min-h-[240px] xl:min-h-[270px] 2xl:min-h-[290px] select-none ${groupColors.border} lg:col-span-2 shadow-none`}
            >
                {/* Selector de color (paleta) */}
                <div className="absolute right-4 top-6 sm:top-4 z-20">
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
                                    style={{ backgroundColor: value.strokeColor }}
                                    className={`w-6 h-6 rounded-full border-2 ${themeKey === key ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'} hover:scale-105 transition-all`}
                                    title={value.label}
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

                <div className="relative z-10 space-y-2.5 text-left pr-10 sm:pr-12 lg:pr-0">
                    {/* Pill superior */}
                    <div 
                        style={{ 
                            color: groupColors.textHex,
                            backgroundColor: groupColors.badgeHex
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg w-fit text-[10.5px] sm:text-[11.5px] font-extrabold tracking-wide uppercase shadow-xs"
                    >
                        <Layers size={12} style={{ color: groupColors.textHex }} />
                        <span>Carga Docente</span>
                    </div>

                    <div className="space-y-1">
                        <p 
                            style={{ color: groupColors.textHex }}
                            className="text-[11px] sm:text-[12px] font-black uppercase tracking-wider"
                        >
                            {materia}
                        </p>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight leading-snug">
                            Grupo {grupo}
                        </h1>
                        <p className="text-xs sm:text-[13px] font-medium text-slate-500 leading-relaxed text-justify max-w-lg">
                            Gestiona los parciales, configura criterios de evaluación y captura calificaciones de tus alumnos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Widget único de Resumen del Grupo al lado */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-none flex flex-col justify-center h-full lg:col-span-1 min-h-[135px] lg:min-h-[160px] xl:min-h-[260px] 2xl:min-h-[300px] select-none text-left font-body">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Información del Grupo</h3>

                <div className="flex flex-col justify-center space-y-2.5">
                    {/* Item: Semestre */}
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-normal text-slate-600">Semestre</span>
                        <span className="text-[13px] font-bold text-slate-800">{semestre}°</span>
                    </div>

                    {/* Item: Especialidad */}
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-normal text-slate-600">Bachillerato</span>
                        <span className="text-[13px] font-bold text-slate-800 truncate max-w-[140px]" title={especialidad}>{especialidad}</span>
                    </div>

                    {/* Item: Alumnos */}
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-normal text-slate-600">Alumnos</span>
                        <span className="text-[13px] font-bold text-slate-800">{studentGradesCount}</span>
                    </div>

                    {/* [NEW] Sección de Criterios del Parcial Actual */}
                    {activeCriteria.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Evaluación del Parcial</p>
                            <div className="space-y-4 relative">
                                {activeCriteria.map((c, idx) => (
                                    <div key={c.id} className="relative flex items-center justify-between group/crit">
                                        {/* Línea conectora vertical */}
                                        {idx < activeCriteria.length - 1 && (
                                            <div className="absolute left-[7.5px] top-4 bottom-[-18px] w-0.5 bg-[#0266E0]/10" />
                                        )}

                                        <div className="flex items-center gap-2.5 max-w-[180px] relative z-10">
                                            {/* Círculo con Índice (Azul Fuerte) */}
                                            <div className="w-4 h-4 rounded-full bg-[#0266E0] flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="text-[12.5px] text-slate-900 font-normal truncate" title={c.nombre}>{c.nombre}</span>
                                                {c.sincronizar_tareas && (
                                                    <Layers size={10} className="text-[#0266E0] shrink-0 opacity-60" />
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[13px] text-slate-950 font-medium relative z-10">{c.porcentaje}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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

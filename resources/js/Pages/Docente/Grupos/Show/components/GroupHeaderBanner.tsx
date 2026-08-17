import React, { useState } from 'react';
import { Palette, Layers, ChevronDown, FileText } from 'lucide-react';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import { Criterion } from '../services/constants';

interface GroupHeaderBannerProps {
    grupo: string;
    materia: string;
    descripcion?: string;
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
    descripcion,
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
}: GroupHeaderBannerProps) {
    const groupColors = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;
    const descText = descripcion || 'Gestiona los parciales, configura criterios de evaluación y captura calificaciones de tus alumnos.';

    return (
        <div className="w-full select-none space-y-4">
            <div className="-mt-6 -mx-4 sm:-mx-6 md:-mx-8 mb-6 border-b border-slate-200 bg-white overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch min-h-[290px]">
                    {/* Banner Principal (Full Bleed pegado a bordes) */}
                    <div 
                        style={{ backgroundColor: groupColors.bgHex }}
                        className={`relative overflow-hidden px-9 sm:px-12 lg:px-14 py-10 sm:py-16 flex flex-col justify-center h-full shadow-none lg:col-span-2 ${groupColors.border}`}
                    >
                        {/* Selector de color (paleta) */}
                        <div className="absolute right-7 sm:right-10 top-8 sm:top-10 z-20">
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

                        {/* Decoración geométrica sutil alineada al tema */}
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
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e88e505_1px,transparent_1px),linear-gradient(to_bottom,#1e88e505_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />

                        <div className="relative z-10 space-y-3 text-left pl-2 sm:pl-4 pr-2 sm:pr-4">
                            {/* Pill superior */}
                            <div 
                                style={{ 
                                    color: groupColors.textHex,
                                    backgroundColor: groupColors.badgeHex
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg w-fit text-[11px] sm:text-[12px] font-black tracking-wider uppercase shadow-xs"
                            >
                                <Layers size={13} style={{ color: groupColors.textHex }} />
                                <span>Carga Docente</span>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                {especialidad && especialidad !== 'General' && (
                                    <p 
                                        style={{ color: groupColors.textHex }}
                                        className="text-xs sm:text-[13px] font-black uppercase tracking-wider"
                                    >
                                        {especialidad}
                                    </p>
                                )}

                                <h1 className="text-[28px] sm:text-4xl lg:text-[42px] font-black text-slate-800 tracking-tight leading-tight">
                                    <span className="block sm:inline">{materia}</span>
                                    {grupo && (
                                        <>
                                            <span className="hidden sm:inline text-slate-800 ml-2">
                                                ({grupo})
                                            </span>
                                            <span className="block sm:hidden text-slate-700/90 font-black text-[16px] sm:text-base mt-1 tracking-tight">
                                                {grupo}
                                            </span>
                                        </>
                                    )}
                                </h1>

                                <div>
                                    <p className="text-xs sm:text-[14.5px] font-medium text-slate-600/90 leading-relaxed max-w-full lg:max-w-4xl xl:max-w-5xl text-left pr-2 sm:pr-6">
                                        {descText}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Widget de Información Rápida (Estilo Docente) */}
                    <div className="bg-white border-t lg:border-t-0 lg:border-l border-slate-200 px-9 sm:pl-10 md:pl-12 sm:pr-16 md:pr-20 py-8 flex flex-col justify-center h-full select-none text-left shadow-none overflow-hidden">
                    <h3 className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest mb-5 pb-2.5 border-b border-slate-200">Información del Grupo</h3>

                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">Semestre</span>
                            <span className="font-bold text-slate-800">{semestre}°</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">Bachillerato</span>
                            <span className="font-bold text-slate-800 truncate max-w-[170px]" title={especialidad}>{especialidad}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">Alumnos inscritos</span>
                            <span className="font-bold text-slate-800">{studentGradesCount}</span>
                        </div>

                        {/* Criterios del Parcial Actual */}
                        {activeCriteria.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5 relative">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Evaluación del Parcial</p>
                                <div className="space-y-3 relative">
                                    {activeCriteria.map((c, idx) => (
                                        <div key={c.id} className="relative flex items-center justify-between group/crit">
                                            {idx < activeCriteria.length - 1 && (
                                                <div className="absolute left-[7.5px] top-4 bottom-[-14px] w-0.5 bg-[#0266E0]/10" />
                                            )}

                                            <div className="flex items-center gap-2.5 max-w-[180px] relative z-10">
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
        </div>
    </div>
    );
}

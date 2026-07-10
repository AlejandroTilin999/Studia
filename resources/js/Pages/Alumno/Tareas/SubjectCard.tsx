import * as React from 'react';

interface Subject {
    name: string;
    iconName: string;
    teacher: string;
    description: string;
}

interface SubjectCardProps {
    subjects: Subject[];
    onSelectSubject: (sub: Subject) => void;
}

export default function SubjectCard({ subjects, onSelectSubject }: SubjectCardProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {subjects.map((sub, idx) => {
                
                // Definición de colores por tema
                const themeColor = idx === 0 
                    ? '#0266E0' 
                    : idx === 1 
                    ? '#9333ea' 
                    : '#d97706';

                return (
                    <div 
                        key={idx} 
                        className="relative overflow-hidden bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col justify-between min-h-[310px] text-left group"
                    >
                        {/* Top layout */}
                        <div className="space-y-4">
                            {/* Accent block info instead of icon */}
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                    Ciclo 2025-2026
                                </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-2.5">
                                <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-[#0266E0] transition-colors pr-2">
                                    {sub.name}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[90%]">
                                    {sub.description}
                                </p>
                            </div>
                        </div>

                        {/* Bottom layout */}
                        <div className="space-y-4 pt-4 z-10">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <span>Docente:</span>
                                <span className="text-slate-700 font-black">{sub.teacher}</span>
                            </div>
                            
                            {/* Asymmetrical Login style Access Button */}
                            <button
                                type="button"
                                onClick={() => onSelectSubject(sub)}
                                className="h-9 px-5 bg-[#0266E0] hover:bg-blue-700 text-white rounded-l-full rounded-tr-full rounded-br-none flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-none border-0 w-fit"
                            >
                                Acceder
                            </button>
                        </div>

                        {/* Abstract Geometric shapes in bottom-right corner (Static & Larger) */}
                        <div className="absolute bottom-0 right-0 w-36 h-36 overflow-hidden pointer-events-none select-none -mr-3 -mb-3">
                            {idx === 0 && (
                                // Dev theme: layered blue circles/squares
                                <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tr from-[#0266E0]/15 to-[#0266E0]/0 rounded-full translate-x-4 translate-y-4">
                                    <div className="absolute top-6 left-6 w-16 h-16 border-2 border-[#0266E0]/10 rounded-2xl rotate-12"></div>
                                    <div className="absolute bottom-6 right-6 w-14 h-14 bg-[#0266E0]/5 rounded-full"></div>
                                </div>
                            )}
                            {idx === 1 && (
                                // Physics theme: orbital loops
                                <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tr from-purple-500/15 to-purple-500/0 rounded-full translate-x-4 translate-y-4">
                                    <div className="absolute top-3 left-8 w-20 h-20 border border-purple-500/10 rounded-full rotate-45"></div>
                                    <div className="absolute top-8 left-3 w-14 h-14 border border-purple-500/15 rounded-full -rotate-12"></div>
                                    <div className="absolute bottom-8 right-8 w-9 h-9 bg-purple-500/5 rounded-full"></div>
                                </div>
                            )}
                            {idx === 2 && (
                                // Math theme: triangle & compass circle
                                <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tr from-amber-500/15 to-amber-500/0 rounded-full translate-x-4 translate-y-4">
                                    <div className="absolute top-6 left-6 w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[75px] border-b-amber-500/5 rotate-12"></div>
                                    <div className="absolute bottom-8 right-8 w-16 h-16 border-2 border-dashed border-amber-500/10 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

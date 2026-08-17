import React, { useState } from 'react';
import { Calendar, ClipboardList, MoreVertical, UserRound } from 'lucide-react';

interface AssignmentHeaderProps {
    title: string;
    teacherName: string;
    deadline?: string;
    isMaterialType: boolean;
    strokeColor: string;
    backgroundColor?: string;
    textColor?: string;
    detailsBackgroundColor?: string;
    detailsTextColor?: string;
}

export default function AssignmentHeader({
    title,
    teacherName,
    deadline,
    isMaterialType,
    strokeColor,
    backgroundColor = strokeColor,
    textColor = '#ffffff',
    detailsBackgroundColor = '#ffffff',
    detailsTextColor = '#475569'
}: AssignmentHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const copyTaskLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            const input = document.createElement('textarea');
            input.value = window.location.href;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            input.remove();
        }
        setIsMenuOpen(false);
    };

    return (
        <>
            <div style={{ backgroundColor }} className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-3">
                <div className="flex items-start gap-3">
                    <div style={{ backgroundColor: strokeColor }} className="hidden sm:flex w-10 h-10 rounded-full text-white items-center justify-center shrink-0">
                        <ClipboardList size={19} />
                    </div>
                    <div className="min-w-0">
                        <span style={{ color: strokeColor }} className="hidden">
                            {isMaterialType ? 'Aviso y material informativo' : 'Actividad académica'}
                        </span>
                        <h1 style={{ color: textColor }} className="text-3xl md:text-4xl font-normal tracking-tight leading-tight break-words">
                            {title}
                        </h1>
                    </div>
                    <div className="relative ml-auto shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((open) => !open)}
                            aria-label="Opciones de la actividad"
                            aria-expanded={isMenuOpen}
                            className="w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center"
                        >
                            <MoreVertical size={21} strokeWidth={2.5} />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-11 z-30 min-w-40 bg-white border border-slate-200 shadow-lg py-1">
                                <button
                                    type="button"
                                    onClick={copyTaskLink}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Copiar el vínculo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: detailsBackgroundColor }} className="px-5 py-4 sm:px-6 flex flex-wrap gap-x-9 gap-y-4">
                <div className="flex items-center gap-3 min-w-[190px]">
                    <div style={{ color: detailsTextColor, backgroundColor: '#f1f5f9' }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <UserRound size={15} />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Docente</span>
                        <span style={{ color: detailsTextColor }} className="block text-xs font-bold uppercase tracking-wide truncate">{teacherName}</span>
                    </div>
                </div>

                {!isMaterialType && (
                    <div className="flex items-center gap-3 min-w-[190px]">
                        <div style={{ color: detailsTextColor, backgroundColor: '#f1f5f9' }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                            <Calendar size={15} />
                        </div>
                        <div>
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha límite</span>
                            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{deadline || 'Sin fecha límite'}</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

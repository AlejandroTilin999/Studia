import React from 'react';
import { Calendar } from 'lucide-react';
import BackButton from '@/Components/common/BackButton';

interface AssignmentHeaderProps {
    title: string;
    teacherName: string;
    deadline?: string;
    isMaterialType: boolean;
    strokeColor: string;
    onBack: () => void;
}

export default function AssignmentHeader({
    title,
    teacherName,
    deadline,
    isMaterialType,
    strokeColor,
    onBack
}: AssignmentHeaderProps) {
    return (
        <div className="space-y-6">
            <BackButton onClick={onBack} label="Volver al trabajo de clase" />

            <div className="space-y-4">
                <div className="space-y-1">
                    <span 
                        style={{ color: strokeColor }}
                        className="text-[10px] font-black uppercase tracking-widest block"
                    >
                        {isMaterialType ? 'Aviso y Material Informativo' : 'Actividad Académica'}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        {title}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-450 uppercase tracking-wide">
                    <span>Docente: {teacherName}</span>
                    {!isMaterialType && deadline && (
                        <>
                            <span className="text-slate-200">|</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={13} />
                                Límite: {deadline}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

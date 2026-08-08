import React from 'react';
import { ChevronLeft, ArrowLeft } from 'lucide-react';

export interface BackButtonProps {
    onClick: () => void;
    label?: string;
    icon?: 'chevron' | 'arrow';
    uppercase?: boolean;
    className?: string;
}

export default function BackButton({
    onClick,
    label = 'Volver',
    icon = 'chevron',
    uppercase = true,
    className = ''
}: BackButtonProps) {
    const IconComponent = icon === 'arrow' ? ArrowLeft : ChevronLeft;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 font-bold tracking-widest text-[11px] text-slate-400 hover:text-slate-700 transition-colors group ${
                uppercase ? 'uppercase' : ''
            } ${className}`}
        >
            <IconComponent 
                size={14} 
                strokeWidth={2.2}
                className="group-hover:-translate-x-1 transition-transform shrink-0" 
            />
            <span>{label}</span>
        </button>
    );
}

import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SwalTooltipProps {
    message: string;
    type?: 'warning' | 'error' | 'info';
    position?: 'top' | 'bottom';
}

export default function SwalTooltip({ message, type = 'warning', position = 'top' }: SwalTooltipProps) {
    if (!message) return null;

    const bgColors = {
        warning: 'bg-white border-amber-200 text-slate-700 shadow-xl shadow-amber-500/10',
        error: 'bg-white border-rose-200 text-slate-700 shadow-xl shadow-rose-500/10',
        info: 'bg-white border-blue-200 text-slate-700 shadow-xl shadow-blue-500/10',
    };

    const iconBg = {
        warning: 'bg-amber-500 text-white',
        error: 'bg-rose-500 text-white',
        info: 'bg-[#1e88e5] text-white',
    };

    const Arrow = () => (
        <div className={`absolute left-6 ${position === 'top' ? '-bottom-1.5 border-b border-r' : '-top-1.5 border-t border-l'} w-3 h-3 bg-white rotate-45 border-slate-200`} />
    );

    return (
        <div className={`absolute z-30 ${position === 'top' ? '-top-12' : 'top-full mt-2'} left-0 animate-in fade-in zoom-in-95 duration-200 select-none`}>
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${bgColors[type]} text-xs font-semibold tracking-tight`}>
                <div className={`w-5 h-5 rounded-lg ${iconBg[type]} flex items-center justify-center shrink-0 shadow-sm`}>
                    {type === 'warning' && <AlertTriangle size={12} strokeWidth={2.5} />}
                    {type === 'error' && <AlertCircle size={12} strokeWidth={2.5} />}
                    {type === 'info' && <Info size={12} strokeWidth={2.5} />}
                </div>
                <span>{message}</span>
            </div>
            <Arrow />
        </div>
    );
}

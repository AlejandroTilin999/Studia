import React from 'react';
import { COLOR_THEMES } from '@/constants/ColorThemes';

export interface ParcialHeaderProps {
    title: string;
    subtitle?: string;
    count?: number;
    unitLabel?: string;
    themeKey?: string;
    className?: string;
    rightAction?: React.ReactNode;
}

export default function ParcialHeader({ title, subtitle, count, unitLabel, themeKey = 'blue', className = '', rightAction }: ParcialHeaderProps) {
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div className={`space-y-1.5 w-full ${className}`}>
            <div
                style={{ borderColor: activeTheme.strokeColor }}
                className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 pb-3.5 transition-colors w-full gap-3 sm:gap-4"
            >
                <div className="space-y-1 text-left">
                    <h3 style={{ color: activeTheme.strokeColor }} className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs sm:text-sm font-semibold text-slate-500/90 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                    {rightAction}
                    {typeof count === 'number' && (
                        <span className="text-xs sm:text-sm font-extrabold text-slate-400 shrink-0 pb-0.5">
                            {count} {unitLabel ? unitLabel : (count === 1 ? 'actividad' : 'actividades')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

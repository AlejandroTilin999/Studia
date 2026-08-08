import React from 'react';
import { COLOR_THEMES } from '@/constants/ColorThemes';

export interface ParcialHeaderProps {
    title: string;
    count?: number;
    themeKey?: string;
    className?: string;
}

export default function ParcialHeader({ title, count, themeKey = 'blue', className = '' }: ParcialHeaderProps) {
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div
            style={{ borderColor: activeTheme.strokeColor }}
            className={`flex items-center justify-between border-b-2 pb-2 transition-colors w-full ${className}`}
        >
            <h3 style={{ color: activeTheme.strokeColor }} className="text-lg font-bold">
                {title}
            </h3>
            {typeof count === 'number' && (
                <span className="text-xs font-semibold text-slate-400">
                    {count} {count === 1 ? 'actividad' : 'actividades'}
                </span>
            )}
        </div>
    );
}

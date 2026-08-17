import React from 'react';

interface DeadlineTimeInputProps {
    value: string;
    onChange: (value: string) => void;
    hasError?: boolean;
}

/** Normaliza cualquier valor de hora a HH:mm antes de enviarlo al servidor. */
export function normalizeDeadlineTime(value: string | null | undefined): string {
    const match = String(value ?? '').match(/^(\d{2}):(\d{2})/);
    if (!match) return '';

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return '';

    return `${match[1]}:${match[2]}`;
}

export default function DeadlineTimeInput({ value, onChange, hasError = false }: DeadlineTimeInputProps) {
    return (
        <input
            type="time"
            value={normalizeDeadlineTime(value)}
            onChange={(event) => onChange(normalizeDeadlineTime(event.target.value))}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium outline-none transition-all ${
                hasError
                    ? 'bg-rose-50/40 border-rose-400 focus:ring-1 focus:ring-rose-400'
                    : 'bg-slate-50/60 border-slate-200/90 focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5]'
            }`}
        />
    );
}

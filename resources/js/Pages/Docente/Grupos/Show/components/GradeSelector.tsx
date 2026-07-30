import React, { useState, useEffect, useRef } from 'react';

interface StableGradeInputProps {
    initialValue: string;
    onChange: (val: string) => void;
    onInstantChange?: (val: string) => void; // [NUEVO] Para cálculo inmediato de promedios
    max: number;
    disabled: boolean;
}

/**
 * [ESTABILIZADOR v5.1] Componente de entrada con aislamiento de estado.
 * Evita que la sincronización en tiempo real borre lo que el usuario escribe
 * y permite cálculos de promedio instantáneos.
 */
export default function GradeSelector({
    initialValue,
    onChange,
    onInstantChange,
    max,
    disabled
}: StableGradeInputProps) {
    const formatInt = (val: string) => {
        if (!val || val === '—' || val === '') return '';
        const num = parseFloat(val);
        if (isNaN(num)) return '';
        // Regla .6 sube
        return Math.floor(num + 0.4).toString();
    };

    const [localValue, setLocalValue] = useState(formatInt(initialValue));

    useEffect(() => {
        setLocalValue(formatInt(initialValue));
    }, [initialValue]);

    const handleLocalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        console.log(`[GradeSelector] Valor seleccionado: ${val}`);
        setLocalValue(val);
        if (onInstantChange) onInstantChange(val);
        onChange(val);
    };

    const options = [];
    for (let i = 0; i <= max; i++) {
        options.push(i);
    }

    return (
        <div className="relative inline-flex flex-col items-center justify-center w-7 group">
            {/* VISTA: El número flotando sobre la línea */}
            <div className={`
                w-full h-7 flex items-center justify-center border-b
                transition-all duration-300
                border-slate-200 ${!disabled && 'group-hover:border-[#1e88e5] group-focus-within:border-[#1e88e5]'}
            `}>
                <span className={`text-sm tracking-tight transition-colors ${
                    localValue === '' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                    {localValue || '—'}
                </span>
            </div>

            {/* INTERACCIÓN: Select invisible que abarca todo el espacio */}
            <select
                disabled={disabled}
                value={localValue}
                onChange={handleLocalChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default appearance-none z-10"
            >
                <option value="">—</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

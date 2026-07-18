import React from 'react';

interface DotsLoaderProps {
    label?: string;
    sublabel?: string;
}

export default function DotsLoader({ label, sublabel }: DotsLoaderProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-28 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100 animate-in fade-in duration-700">
            <div className="dots-loader mb-8"></div>

            <div className="text-center space-y-1.5">
                <p className="text-slate-600 font-black text-[13px] tracking-tight">
                    {label || "Cargando datos"}
                </p>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">
                    {sublabel || "Por favor espera un poco..."}
                </p>
            </div>
        </div>
    );
}

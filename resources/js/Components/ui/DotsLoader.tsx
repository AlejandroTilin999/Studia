import React from 'react';
import StudiaSkeleton from './StudiaSkeleton';

interface DotsLoaderProps {
    label?: string;
    sublabel?: string;
}

export default function DotsLoader({ label, sublabel }: DotsLoaderProps) {
    return (
        <div className="w-full space-y-4 py-3 animate-in fade-in duration-300" aria-busy="true" aria-label={label || 'Cargando datos'}>
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                    <StudiaSkeleton className="h-4 w-40 rounded" />
                    <StudiaSkeleton className="h-3 w-64 max-w-[70vw] rounded" />
                </div>
                <StudiaSkeleton className="h-9 w-24 rounded-lg" />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-100">
                {[0, 1, 2, 3, 4].map((row) => (
                    <div key={row} className="grid grid-cols-3 gap-5 border-b border-slate-50 px-5 py-5 last:border-0 md:grid-cols-5">
                        <StudiaSkeleton className="h-4 w-24 rounded" />
                        <StudiaSkeleton className="h-4 w-full rounded" />
                        <StudiaSkeleton className="h-4 w-20 rounded" />
                        <StudiaSkeleton className="hidden h-4 w-24 rounded md:block" />
                        <StudiaSkeleton className="hidden h-4 w-16 rounded md:block" />
                    </div>
                ))}
            </div>
            <span className="sr-only">{sublabel || 'Por favor espera un momento.'}</span>
        </div>
    );
}

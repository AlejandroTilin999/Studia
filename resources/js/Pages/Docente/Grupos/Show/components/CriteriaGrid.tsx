import React from 'react';
import { Layers } from 'lucide-react';
import { Criterion } from '../services/constants';
import { cn } from '@/lib/utils';

interface CriteriaGridProps {
    activeCriteria: Criterion[];
}

export default function CriteriaGrid({ activeCriteria }: CriteriaGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 w-full">
            {activeCriteria.map(c => (
                <div
                    key={c.id}
                    className={cn(
                        "rounded-2xl px-5 py-3 border transition-all flex flex-col justify-between h-[85px] shadow-none",
                        c.sincronizar_tareas
                            ? 'bg-[#f8fbff] border-[#e1effe] text-[#0266E0]'
                            : 'bg-white border-slate-100 text-slate-700'
                    )}
                >
                    <div className="flex justify-between items-start w-full">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            c.sincronizar_tareas ? 'text-[#0266E0]/70' : 'text-slate-400'
                        )}>
                            {c.nombre}
                        </span>
                        {c.sincronizar_tareas && (
                            <Layers size={13} className="text-[#0266E0] shrink-0 opacity-60" />
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-2xl font-bold tracking-tight",
                            c.sincronizar_tareas ? 'text-[#0266E0]' : 'text-slate-800'
                        )}>
                            {c.porcentaje}%
                        </span>
                        {c.sincronizar_tareas && (
                            <span className="text-[8px] font-black uppercase bg-[#e1effe] text-[#0266E0] px-2 py-1 rounded border border-[#0266E0]/10 tracking-widest leading-none">
                                Sincronizado
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

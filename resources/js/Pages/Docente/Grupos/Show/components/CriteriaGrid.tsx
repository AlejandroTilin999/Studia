import React from 'react';
import { Layers } from 'lucide-react';
import { Criterion } from '../services/constants';

interface CriteriaGridProps {
    activeCriteria: Criterion[];
}

export default function CriteriaGrid({ activeCriteria }: CriteriaGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-6 w-full">
            {activeCriteria.map(c => (
                <div 
                    key={c.id} 
                    className={`rounded-xl p-4 flex flex-col justify-between gap-1.5 border transition-all shadow-sm ${
                        c.syncTasks 
                            ? 'bg-blue-50/40 text-[#1e88e5] border-blue-100/60' 
                            : 'bg-slate-50/50 text-slate-700 border-slate-150'
                    }`}
                >
                    <div className="flex justify-between items-start w-full">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            c.syncTasks ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                            {c.name}
                        </span>
                        {c.syncTasks && (
                            <Layers size={13} className="text-[#1e88e5] shrink-0" />
                        )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className={`text-xl font-black ${
                            c.syncTasks ? 'text-[#1e88e5]' : 'text-slate-800'
                        }`}>
                            {c.percentage}%
                        </span>
                        {c.syncTasks && (
                            <span className="text-[9px] font-black uppercase bg-[#1e88e5]/10 text-[#1e88e5] px-1.5 py-0.5 rounded border border-[#1e88e5]/10 tracking-wide">
                                Sincronizado
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

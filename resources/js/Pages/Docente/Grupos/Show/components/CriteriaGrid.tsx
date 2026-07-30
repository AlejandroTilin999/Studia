import React from 'react';
import { Layers, UserCircle } from 'lucide-react';
import { Criterion } from '../services/constants';
import { cn } from '@/lib/utils';

interface CriteriaGridProps {
    activeCriteria: Criterion[];
}

export default function CriteriaGrid({ activeCriteria }: CriteriaGridProps) {
    return (
        <div className="flex flex-wrap items-stretch gap-6 mb-8 w-full">
            {activeCriteria.map((c) => {
                const isSynced = c.sincronizar_tareas;

                return (
                    <div
                        key={c.id}
                        className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col min-h-[160px] transition-all hover:border-blue-100/50 flex-1 min-w-[240px]"
                    >
                        {/* Badge Superior */}
                        <div className="mb-4">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                isSynced
                                    ? "bg-blue-50/50 text-[#0266E0] border-blue-100/50"
                                    : "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                                {isSynced ? (
                                    <>
                                        <Layers size={10} className="fill-current" />
                                        Plataforma
                                    </>
                                ) : (
                                    <>
                                        <UserCircle size={10} />
                                        Manual
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Valor y Nombre */}
                        <div className="flex-1 space-y-1">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-slate-400 tracking-tighter">
                                    {c.porcentaje}
                                </span>
                                <span className="text-xl font-bold text-slate-200">%</span>
                            </div>
                            <h4 className="text-base font-normal text-slate-500 leading-tight">
                                {c.nombre}
                            </h4>
                        </div>

                        {/* Descripción Inferior */}
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                {isSynced
                                    ? "Evaluación automática basada en actividades entregadas."
                                    : "Captura directa de calificaciones por el docente."}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

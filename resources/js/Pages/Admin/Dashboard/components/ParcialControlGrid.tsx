import React from 'react';
import { Calendar, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Cycle {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
    status: 'planificacion' | 'activo' | 'cerrado';
    p1_inicio?: string;
    p1_fin?: string;
    p1_activo?: boolean;
    p2_inicio?: string;
    p2_fin?: string;
    p2_activo?: boolean;
    p3_inicio?: string;
    p3_fin?: string;
    p3_activo?: boolean;
}

interface ParcialControlGridProps {
    activeCycle: Cycle;
    onToggle: (parcial: number, currentStatus: boolean) => void;
}

export default function ParcialControlGrid({ activeCycle, onToggle }: ParcialControlGridProps) {
    const isLocked = activeCycle.status !== 'activo';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((p) => {
                const isActive = !!(activeCycle[`p${p}_activo` as keyof Cycle] ?? false);
                const inicio = activeCycle[`p${p}_inicio` as keyof Cycle] as string;
                const fin = activeCycle[`p${p}_fin` as keyof Cycle] as string;

                return (
                    <div key={p} className={cn(
                        "bg-white border rounded-lg p-5 space-y-4 shadow-none group transition-all",
                        isLocked ? "border-slate-100 opacity-80" : "border-slate-100 hover:border-blue-100"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div>
                                    <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest leading-none">Periodo</p>
                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight mt-1.5">Parcial {p}</h4>
                                </div>
                            </div>
                            <button
                                onClick={() => !isLocked && onToggle(p, isActive)}
                                disabled={isLocked}
                                title={isLocked ? "Debes activar el ciclo escolar para habilitar la captura" : ""}
                                className={cn(
                                    "w-10 h-6 rounded-full relative transition-all duration-300",
                                    isActive ? "bg-[#0266E0]" : "bg-slate-200",
                                    isLocked && "cursor-not-allowed grayscale-[0.5] opacity-50"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                    isActive ? "left-5" : "left-1",
                                    isLocked && "bg-slate-50 shadow-none"
                                )} />
                            </button>
                        </div>

                        <div className="space-y-2.5 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400 font-normal uppercase tracking-wider">Estado de Captura</span>
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded-lg font-bold uppercase text-[9px] tracking-widest",
                                    isActive && !isLocked ? "bg-blue-50 text-[#0266E0]" : "bg-slate-50 text-slate-500",
                                    isLocked && "bg-slate-100 text-slate-400"
                                )}>
                                    {isLocked ? 'Inhabilitada' : (isActive ? 'Abierta' : 'Cerrada')}
                                </span>
                            </div>

                            {isLocked && (
                                <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter animate-pulse">
                                    Requiere activación de ciclo
                                </p>
                            )}

                            <div className="pt-3 border-t border-slate-50 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 font-normal uppercase tracking-tight">Inicia:</span>
                                    <span className="text-[10px] text-slate-600 font-semibold">{inicio ? new Date(inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin definir'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 font-normal uppercase tracking-tight">Termina:</span>
                                    <span className="text-[10px] text-slate-600 font-semibold">{fin ? new Date(fin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin definir'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import React from 'react';
import { Clock, Unlock, Lock, Archive, Calendar } from 'lucide-react';

interface Cycle {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
    status: 'planificacion' | 'activo' | 'cerrado';
}

interface CycleStatusCardProps {
    activeCycle: Cycle | undefined;
    totalCycles: number;
    onOpenNewCycle: () => void;
    onEditCycle: (cycle: Cycle) => void;
    onCloseCycle: () => void;
    onOpenHistory: () => void;
}

export default function CycleStatusCard({
    activeCycle,
    totalCycles,
    onOpenNewCycle,
    onEditCycle,
    onCloseCycle,
    onOpenHistory
}: CycleStatusCardProps) {
    const getStatusLabel = () => {
        if (!activeCycle) return { text: 'Sin Ciclo', color: 'text-slate-400', bg: 'bg-slate-50' };

        switch (activeCycle.status) {
            case 'planificacion':
                return { text: 'En Planeación', color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'activo':
                return { text: 'Vigente', color: 'text-emerald-600', bg: 'bg-emerald-50' };
            case 'cerrado':
                return { text: 'Concluido', color: 'text-slate-500', bg: 'bg-slate-100' };
            default:
                return { text: 'Inactivo', color: 'text-rose-600', bg: 'bg-rose-50' };
        }
    };

    const status = getStatusLabel();

    return (
        <div className="bg-white rounded-lg p-5 md:p-6 border border-slate-100 shadow-none flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 text-left font-body">
            <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${status.bg} ${status.color}`}>
                        {status.text}
                    </span>
                    <span className="text-slate-200 font-normal">|</span>
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        Vigencia del Ciclo
                    </span>
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    {activeCycle?.nombre || 'Ningún ciclo escolar seleccionado'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                    {activeCycle ? (
                        <>
                            Periodo académico: <strong className="text-slate-700 font-bold">{new Date(activeCycle.fecha_inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> al <strong className="text-slate-700 font-bold">{new Date(activeCycle.fecha_fin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                        </>
                    ) : (
                        "Abre un nuevo ciclo para comenzar a inscribir alumnos."
                    )}
                </p>
            </div>
            <div className="flex flex-col gap-2 w-full xl:w-72 mt-2 xl:mt-0">
                <button
                    onClick={onOpenNewCycle}
                    className="w-full bg-[#0266E0] hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-lg text-[11px] uppercase tracking-widest transition-all shadow-none flex items-center justify-center gap-2"
                >
                    <Unlock className="w-3.5 h-3.5" /> Abrir Nuevo Ciclo
                </button>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={onOpenHistory}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100 font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-1.5 px-2"
                        title={`Historial (${totalCycles})`}
                    >
                        <Archive className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-tighter">Hist.</span>
                    </button>

                    {activeCycle && (
                        <>
                            <button
                                onClick={() => onEditCycle(activeCycle)}
                                className="bg-amber-50/50 hover:bg-amber-50 text-amber-600 border border-amber-100/50 font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-1.5 px-2"
                                title="Editar Fechas"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-[10px] uppercase tracking-tighter">Edit.</span>
                            </button>

                            <button
                                onClick={onCloseCycle}
                                className="bg-rose-50/50 hover:bg-rose-50 text-rose-600 border border-rose-100/50 font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-1.5 px-2"
                                title="Concluir Ciclo"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span className="text-[10px] uppercase tracking-tighter">Fin.</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

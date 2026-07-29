import React from 'react';
import { X, Archive, CheckCircle2, Calendar, Layout, Clock, Settings2 } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { cn } from '@/lib/utils';

interface Cycle {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
}

interface CycleHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycles: Cycle[];
    onActivate: (id: number) => void;
    onEdit: (cycle: Cycle) => void;
}

export default function CycleHistoryModal({
    isOpen,
    onClose,
    cycles = [],
    onActivate,
    onEdit
}: CycleHistoryModalProps) {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-5xl" showFooter={false} fullBleed={true}>
            <div className="grid grid-cols-1 md:grid-cols-10 min-h-0 md:min-h-[450px] max-h-[85vh] md:max-h-none overflow-y-auto md:overflow-visible h-full text-left relative font-body">
                <button type="button" onClick={onClose} className="fixed md:absolute top-5 right-5 z-50 p-2 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 transition-all focus:outline-none">
                    <X size={20} className="stroke-[2.5]" />
                </button>

                {/* Left Panel */}
                <div className="col-span-1 md:col-span-3 bg-[#0266E0] p-8 text-white flex flex-col justify-between select-none relative rounded-t-lg md:rounded-l-lg md:rounded-tr-none shrink-0">
                    <div className="space-y-10">
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-10 w-auto object-contain mb-8" />
                            <h3 className="text-2xl font-black text-white leading-tight uppercase">Expediente Histórico</h3>
                            <p className="text-sm text-blue-100 leading-relaxed font-normal mt-4">
                                Consulta y administra la vigencia de los ciclos escolares registrados en la plataforma.
                            </p>
                        </div>
                    </div>
                    <div className="text-[10px] text-blue-200 font-black uppercase tracking-[0.2em] pt-6 border-t border-white/15 hidden md:block">Prepahid · Campus Digital</div>
                </div>

                {/* Right Content */}
                <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col bg-white rounded-b-lg md:rounded-r-lg">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-xs font-normal uppercase text-slate-400 tracking-[0.2em]">
                            Registros Académicos
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            {cycles.length} Periodos
                        </span>
                    </div>

                    <div className="space-y-3.5 overflow-y-auto pr-2 scrollbar-hide flex-1">
                        {cycles.length === 0 ? (
                            <div className="py-20 text-center space-y-3">
                                <Archive size={40} className="mx-auto text-slate-200" />
                                <p className="text-slate-400 font-normal text-sm">No hay ciclos registrados en el historial.</p>
                            </div>
                        ) : (
                            cycles.map((c) => (
                                <div
                                    key={c.id}
                                    className={cn(
                                        "p-5 rounded-xl border flex items-center justify-between gap-6 transition-all duration-300",
                                        c.activo
                                            ? 'border-blue-100 bg-blue-50/30'
                                            : 'border-slate-100 bg-white hover:border-slate-200/60'
                                    )}
                                >
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h4 className={cn(
                                                "font-normal text-[15px] tracking-tight truncate",
                                                c.activo ? "text-slate-900" : "text-slate-800"
                                            )}>
                                                {c.nombre}
                                            </h4>
                                            {c.activo && (
                                                <span className="text-[9px] font-bold uppercase bg-[#0266E0] text-white px-2 py-0.5 rounded-md tracking-widest shadow-none">Vigente</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-slate-900">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={13} className="text-slate-400" />
                                                <span className="text-[11px] font-normal tracking-wide">
                                                    {new Date(c.fecha_inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] font-normal tracking-wide">
                                                    {new Date(c.fecha_fin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {!c.activo && (
                                            <button
                                                onClick={() => onActivate(c.id)}
                                                className="bg-white hover:bg-[#0266E0] hover:text-white border border-slate-200 text-slate-600 font-bold h-9 px-5 rounded-lg text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-none"
                                            >
                                                <CheckCircle2 size={14} />
                                                Activar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end items-center select-none">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-[0.15em] rounded-lg transition-all"
                        >
                            Cerrar Expediente
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

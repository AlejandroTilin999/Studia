import React from 'react';
import { ButtonLogin as Button } from '@/Components/ButtonLogin';
import QuickSummaryWidget, { MetricItem } from '@/Components/QuickSummaryWidget';
import { router } from '@inertiajs/react';

interface AdminToolsSidebarProps {
    metrics: MetricItem[];
    onOpenNewCycle: () => void;
}

export default function AdminToolsSidebar({ metrics, onOpenNewCycle }: AdminToolsSidebarProps) {
    return (
        <div className="w-full lg:w-[340px] bg-white border-l-0 lg:border-l border-t lg:border-t-0 border-slate-150 p-6 lg:pt-8 lg:pb-12 lg:px-5 space-y-7 shrink-0 flex flex-col shadow-none lg:h-full lg:overflow-y-auto lg:justify-start">
            <div className="hidden lg:block">
                <QuickSummaryWidget metrics={metrics} />
            </div>

            <div className="space-y-3 font-body text-left">
                <h4 className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider select-none ml-1">Herramientas Administrativas</h4>
                <div className="space-y-3.5">
                    <div className="bg-slate-50 hover:bg-blue-50 transition-all py-8 px-6 rounded-xl border border-slate-100 flex items-center justify-between gap-5 group">
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm group-hover:text-[#0266E0] leading-tight transition-colors">Asignación de Grupos</p>
                            <p className="text-xs text-slate-500 font-normal mt-1.5 leading-relaxed">Distribución de alumnos y profesores</p>
                        </div>
                        <Button
                            onClick={() => router.visit(route('groups.index'))}
                            className="bg-[#0266E0] hover:bg-blue-700 text-white font-bold h-9 px-5 text-xs rounded-lg shrink-0 shadow-none transition-all active:scale-95"
                        >
                            Ir
                        </Button>
                    </div>

                    <div className="bg-slate-50 hover:bg-blue-50 transition-all py-8 px-6 rounded-xl border border-slate-100 flex items-center justify-between gap-5 group">
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm group-hover:text-[#0266E0] leading-tight transition-colors">Apertura de Nuevo Ciclo</p>
                            <p className="text-xs text-slate-500 font-normal mt-1.5 leading-relaxed">Configurar periodos y fechas clave</p>
                        </div>
                        <Button
                            onClick={onOpenNewCycle}
                            className="bg-[#0266E0] hover:bg-blue-700 text-white font-bold h-9 px-5 text-xs rounded-lg shrink-0 shadow-none transition-all active:scale-95"
                        >
                            Ir
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

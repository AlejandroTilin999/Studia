import React from 'react';
import { Search, Filter, Plus } from "lucide-react";
import { SpecialtySelect } from '@/Components/SpecialtySelect';
import { cn } from "@/lib/utils";

interface TeacherTableControlsProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    cycleFilter: string | number;
    setCycleFilter: (cycle: string | number) => void;
    availableCycles?: any[];
    showFiltersDropdown: boolean;
    setShowFiltersDropdown: (show: boolean) => void;
    onCreate: () => void;
    isCycleActive?: boolean;
}

export default function TeacherTableControls({
    searchQuery,
    setSearchQuery,
    cycleFilter,
    setCycleFilter,
    availableCycles = [],
    showFiltersDropdown,
    setShowFiltersDropdown,
    onCreate,
    isCycleActive
}: TeacherTableControlsProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
            <div className="relative flex-1 w-full text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar profesor por nombre, matrícula, correo o especialidad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-[#0266E0] focus:outline-none text-slate-700 placeholder-slate-400 font-medium"
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto relative">
                <button
                    onClick={onCreate}
                    disabled={!isCycleActive}
                    title={!isCycleActive ? "Debes abrir un ciclo escolar para registrar personal docente" : ""}
                    className={cn(
                        "bg-[#0266E0] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial flex items-center justify-center gap-2 text-sm transition-all",
                        !isCycleActive && "opacity-50 cursor-not-allowed grayscale"
                    )}
                >
                    <Plus size={16} />
                    Registrar profesor
                </button>
                <button
                    onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                    className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg flex-1 md:flex-initial px-8 flex items-center justify-center gap-2 text-sm hover:bg-slate-50"
                >
                    <Filter size={16} />
                    Filtros
                </button>
                {showFiltersDropdown && (
                    <div className="absolute right-0 top-14 w-60 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-4 space-y-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Ciclo Escolar</span>
                            <select
                                value={cycleFilter}
                                onChange={e => {
                                    setCycleFilter(e.target.value);
                                    setShowFiltersDropdown(false);
                                }}
                                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                            >
                                {availableCycles.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre} {c.status === 'activo' ? '(Vigente)' : '(Planeación)'}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                Especialidad
                            </span>
                            <SpecialtySelect
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value === "all" ? "" : e.target.value);
                                    setShowFiltersDropdown(false);
                                }}
                                showAllOption={true}
                                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

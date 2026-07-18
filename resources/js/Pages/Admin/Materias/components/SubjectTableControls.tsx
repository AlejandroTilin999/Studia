import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface SubjectTableControlsProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    groupFilter: string;
    setGroupFilter: (group: string) => void;
    groupsList: string[];
    onOpenCreateModal: () => void;
}

export default function SubjectTableControls({
    searchQuery,
    setSearchQuery,
    groupFilter,
    setGroupFilter,
    groupsList,
    onOpenCreateModal,
}: SubjectTableControlsProps) {
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
            <div className="relative flex-1 w-full text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Buscar materia por código, nombre o docente..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-[#0266E0] focus:outline-none focus:ring-0 shadow-sm text-slate-700 placeholder-slate-450 transition-colors"
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto relative">
                <button
                    type="button"
                    onClick={onOpenCreateModal}
                    className="bg-[#0266E0] hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-lg flex-1 md:flex-initial text-sm transition-all shadow-none flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Registrar Materia
                </button>

                <div className="relative flex-1 md:flex-initial">
                    <button
                        type="button"
                        onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                        className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg w-full md:w-auto gap-2 px-6 text-sm hover:bg-slate-50 transition-all flex items-center justify-center"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>

                    {showFiltersDropdown && (
                        <div className="absolute right-0 top-14 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-4 space-y-2.5 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Filtrar por grupo</span>
                            <select
                                value={groupFilter}
                                onChange={e => {
                                    setGroupFilter(e.target.value);
                                    setShowFiltersDropdown(false);
                                }}
                                className="w-full py-2 px-3 bg-slate-55 border border-slate-200 rounded-lg text-xs font-bold text-slate-650 focus:outline-none focus:border-blue-400 focus:ring-0"
                            >
                                <option value="all">Todos los grupos</option>
                                {groupsList.map((g, idx) => (
                                    <option key={idx} value={g}>Grupo {g}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

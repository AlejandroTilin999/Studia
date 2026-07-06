import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface GroupTableControlsProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    specialtyFilter: string;
    setSpecialtyFilter: (specialty: string) => void;
    onOpenCreateModal: () => void;
}

export default function GroupTableControls({
    searchQuery,
    setSearchQuery,
    specialtyFilter,
    setSpecialtyFilter,
    onOpenCreateModal,
}: GroupTableControlsProps) {
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
            <div className="relative flex-1 w-full text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar grupo..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 shadow-none text-slate-700 placeholder-slate-400"
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto relative">
                <button 
                    type="button"
                    onClick={onOpenCreateModal}
                    className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial text-sm transition-all shadow-none flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Registrar grupo
                </button>
                
                <button 
                    type="button"
                    onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                    className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg flex-1 md:flex-initial gap-2 px-8 text-sm hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                    <Filter className="w-4 h-4" />
                    Filtros
                </button>

                {/* Dropdown Filters Selector */}
                {showFiltersDropdown && (
                    <div className="absolute right-0 top-14 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-3.5 space-y-2 text-left">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Especialidad</span>
                        <select
                            value={specialtyFilter}
                            onChange={e => {
                                setSpecialtyFilter(e.target.value);
                                setShowFiltersDropdown(false);
                            }}
                            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-650 focus:outline-none"
                        >
                            <option value="all">Todas</option>
                            <option value="TI">Tecnologías de la Información (TI)</option>
                            <option value="Gastronomía">Gastronomía</option>
                            <option value="Biotecnología">Biotecnología</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Plus, Search } from 'lucide-react';
import { CatalogItem, GroupCatalogItem } from '../types';
import { cn } from '@/lib/utils';

interface LoadTableControlsProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    periodFilter: string;
    setPeriodFilter: (period: string) => void;
    groupFilter: string;
    setGroupFilter: (group: string) => void;
    periods: CatalogItem[];
    groups: GroupCatalogItem[];
    onOpenCreateModal: () => void;
    isCycleActive?: boolean;
}

export default function LoadTableControls({
    searchQuery,
    setSearchQuery,
    periodFilter,
    setPeriodFilter,
    groupFilter,
    setGroupFilter,
    periods,
    groups,
    onOpenCreateModal,
    isCycleActive
}: LoadTableControlsProps) {
    return (
        <div className="flex flex-col xl:flex-row items-center gap-4 mb-6 shrink-0">
            <div className="relative flex-1 w-full text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Buscar por materia, grupo o profesor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 h-12 w-full bg-white border border-slate-200 rounded-xl text-sm focus:border-[#0266E0] focus:outline-none transition-all text-slate-700 placeholder-slate-450 font-normal"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto relative">
                <button
                    onClick={onOpenCreateModal}
                    disabled={!isCycleActive}
                    className={cn(
                        "bg-[#0266E0] hover:bg-blue-700 text-white font-extrabold h-12 px-6 rounded-xl flex-1 xl:flex-initial text-sm transition-all shadow-none flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]",
                        !isCycleActive && "opacity-50 cursor-not-allowed grayscale"
                    )}
                >
                    <Plus className="w-4 h-4" />
                    Registrar Asignación
                </button>

                {/* Filtro Grupo */}
                <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="h-12 border border-slate-200 bg-white text-slate-600 font-bold pl-4 pr-10 rounded-xl text-xs focus:outline-none focus:border-[#0266E0] transition-all min-w-[155px] appearance-none cursor-pointer flex-1 xl:flex-initial"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em 1.2em', backgroundRepeat: 'no-repeat' }}
                >
                    <option value="all">Todos los grupos</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

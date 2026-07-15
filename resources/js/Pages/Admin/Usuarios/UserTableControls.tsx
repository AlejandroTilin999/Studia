import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface UserTableControlsProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    roleFilter: string;
    setRoleFilter: (role: string) => void;
    onOpenCreateModal: () => void;
}

export default function UserTableControls({
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    onOpenCreateModal,
}: UserTableControlsProps) {
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
            <div className="relative flex-1 w-full text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 shadow-none text-slate-700 placeholder-slate-400"
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto relative">
                <button
                    type="button"
                    onClick={onOpenCreateModal}
                    className="bg-[#0266E0] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial flex items-center justify-center gap-2 text-sm transition-all shadow-none"
                >
                    <Plus size={16} />
                    Registrar Usuario
                </button>

                <button
                    type="button"
                    onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                    className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg flex-1 md:flex-initial px-8 flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition-all"
                >
                    <Filter size={16} />
                    Filtros
                </button>

                {showFiltersDropdown && (
                    <div className="absolute right-0 top-14 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-3.5 space-y-2 text-left">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                            Filtrar por Rol
                        </span>
                        <select
                            value={roleFilter}
                            onChange={e => {
                                setRoleFilter(e.target.value);
                                setShowFiltersDropdown(false);
                            }}
                            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                        >
                            <option value="all">Todos los Roles</option>
                            <option value="admin">Administradores</option>
                            <option value="docente">Docentes</option>
                            <option value="alumno">Alumnos</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
}

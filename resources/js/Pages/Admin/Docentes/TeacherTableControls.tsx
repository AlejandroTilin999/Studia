import { Search, Filter, Plus } from "lucide-react";

interface TeacherTableControlsProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    showFiltersDropdown: boolean;
    setShowFiltersDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    onCreate: () => void;
}

export default function TeacherTableControls({
    searchQuery,
    setSearchQuery,
    showFiltersDropdown,
    setShowFiltersDropdown,
    onCreate,
}: TeacherTableControlsProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">

            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                    type="text"
                    placeholder="Buscar profesor"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none text-slate-700 placeholder-slate-400"
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto relative">

                <button
                    onClick={onCreate}
                    className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial flex items-center justify-center gap-2 text-sm"
                >
                    <Plus size={16} />
                    Registrar profesor
                </button>

                <button
                    onClick={() =>
                        setShowFiltersDropdown(!showFiltersDropdown)
                    }
                    className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg flex-1 md:flex-initial px-8 flex items-center justify-center gap-2 text-sm hover:bg-slate-50"
                >
                    <Filter size={16} />
                    Filtros
                </button>

                {showFiltersDropdown && (
                    <div className="absolute right-0 top-14 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-3.5 space-y-2">

                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                            Especialidad
                        </span>

                        <select
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(
                                    e.target.value === "all"
                                        ? ""
                                        : e.target.value
                                );
                                setShowFiltersDropdown(false);
                            }}
                            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600"
                        >
                            <option value="all">
                                Todas las especialidades
                            </option>
                            <option value="Ciencias">Ciencias</option>
                            <option value="Lenguaje">Lenguaje</option>
                            <option value="Historia">Historia</option>

                        </select>

                    </div>
                )}

            </div>

        </div>
    );
}
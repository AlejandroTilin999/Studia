import * as React from 'react';
import StudentTaskCard from './Componentes/StudentTaskCard';
import ParcialHeader from '@/Components/common/ParcialHeader';
import { COLOR_THEMES } from '@/constants/ColorThemes';

interface Task {
    id: number;
    subjectName?: string;
    title: string;
    status: string;
    desc: string;
    points?: string;
    deadline?: string;
}

interface SubjectClassworkProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
    themeKey?: string;
}

export default function SubjectClasswork({ tasks, onSelectTask, themeKey = 'blue' }: SubjectClassworkProps) {
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;
    const [filterStatus, setFilterStatus] = React.useState<'Todas' | 'Entregadas' | 'Asignadas' | 'Calificadas'>('Todas');
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTasks = React.useMemo(() => {
        if (filterStatus === 'Todas') return tasks;
        return tasks.filter(t => {
            const st = (t.status || '').toLowerCase();
            if (filterStatus === 'Entregadas') return st === 'entregado' || st === 'submitted' || st === 'entregada';
            if (filterStatus === 'Calificadas') return st === 'calificado' || st === 'graded' || st === 'calificada';
            if (filterStatus === 'Asignadas') return st === 'pendiente' || st === 'asignado' || st === 'pending';
            return true;
        });
    }, [tasks, filterStatus]);

    return (
        <div className="space-y-6 text-left pt-2 w-full">
            {/* Header info con estilo dinámico homogado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <ParcialHeader
                    title="Trabajos escolares"
                    count={filteredTasks.length}
                    themeKey={themeKey}
                />

                {/* Filtro desplegable 'Ordenar por estatus...' idéntico al diseño */}
                <div className="relative self-start sm:self-auto" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-10 px-4 bg-[#e5e7eb]/80 hover:bg-[#d1d5db]/80 text-slate-700 text-xs font-semibold rounded-t-lg rounded-b-none border-b-2 border-slate-400/60 flex items-center justify-between gap-3 min-w-[170px] transition-all shadow-none outline-none select-none"
                    >
                        <span className="truncate">
                            {filterStatus === 'Todas' ? 'Ordenar por esta...' : `Filtro: ${filterStatus}`}
                        </span>
                        <svg
                            className={`w-3.5 h-3.5 text-slate-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Menú Desplegable Adaptable al Tema */}
                    {isOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200/90 rounded-lg shadow-lg py-1 z-30 overflow-hidden text-xs">
                            {[
                                { label: 'Todas', val: 'Todas' },
                                { label: 'Entregadas', val: 'Entregadas' },
                                { label: 'Asignadas', val: 'Asignadas' },
                                { label: 'Calificadas', val: 'Calificadas' }
                            ].map((opt) => {
                                const isSelected = filterStatus === opt.val;
                                return (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => {
                                            setFilterStatus(opt.val as any);
                                            setIsOpen(false);
                                        }}
                                        style={isSelected ? { backgroundColor: `${activeTheme.strokeColor}15`, color: activeTheme.strokeColor } : undefined}
                                        className={`w-full text-left px-4 py-2.5 transition-colors font-semibold ${
                                            isSelected
                                                ? 'font-bold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* List of Tasks */}
            <div className="w-full">
                {filteredTasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-xl">
                        No se encontraron actividades con el filtro seleccionado.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200/80 w-full">
                        {filteredTasks.map((task) => (
                            <StudentTaskCard
                                key={task.id}
                                task={task}
                                onSelectTask={onSelectTask}
                                themeKey={themeKey}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

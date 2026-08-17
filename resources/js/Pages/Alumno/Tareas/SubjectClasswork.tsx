import * as React from 'react';
import StudentTaskCard from './components/StudentTaskCard';
import ParcialHeader from '@/Components/common/ParcialHeader';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import type { StudentTask } from '@/types/alumno';
import StudiaSkeleton from '@/Components/ui/StudiaSkeleton';

interface SubjectClassworkProps {
    tasks: StudentTask[];
    onSelectTask: (task: StudentTask) => void;
    themeKey?: string;
    isLoading?: boolean;
}

export default function SubjectClasswork({ tasks, onSelectTask, themeKey = 'blue', isLoading = false }: SubjectClassworkProps) {
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;
    const [filterStatus, setFilterStatus] = React.useState<'Todas' | 'Entregadas' | 'Asignadas' | 'Calificadas' | 'Vencidas'>('Todas');
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
            if (filterStatus === 'Vencidas') return st === 'vencida' || st === 'vencido' || t.isOverdue === true;
            return true;
        });
    }, [tasks, filterStatus]);

    return (
        <div className="space-y-6 text-left w-full">
            {/* Header info con el filtro alineado en la misma línea en Web */}
            <ParcialHeader
                title="Trabajos escolares"
                subtitle="Consulta y gestiona tus actividades asignadas"
                count={filteredTasks.length}
                themeKey={themeKey}
                rightAction={
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="h-9 px-3.5 bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-lg border border-slate-200/90 flex items-center justify-between gap-2.5 min-w-[165px] transition-all shadow-2xs outline-none select-none cursor-pointer"
                        >
                            <span className="truncate">
                                {filterStatus === 'Todas' ? 'Ordenar por estatus...' : `Filtro: ${filterStatus}`}
                            </span>
                            <svg
                                className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Menú Desplegable Alineado a la Izquierda (Garantiza visibilidad 100%) */}
                        {isOpen && (
                            <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200/90 rounded-xl shadow-xl py-1.5 z-50 overflow-hidden text-xs">
                                {[
                                    { label: 'Todas las actividades', val: 'Todas' },
                                    { label: 'Asignadas (Pendientes)', val: 'Asignadas' },
                                    { label: 'Entregadas', val: 'Entregadas' },
                                    { label: 'Calificadas', val: 'Calificadas' },
                                    { label: 'Vencidas', val: 'Vencidas' },
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
                                            className={`w-full text-left px-4 py-2.5 transition-colors font-bold ${
                                                isSelected
                                                    ? ''
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
                }
            />

            {/* Lista de Tareas Responsivas */}
            <div className="w-full">
                {isLoading ? (
                    <div className="divide-y divide-slate-200/80 w-full" aria-label="Cargando actividades">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="flex items-center gap-4 py-5 first:pt-0">
                                <StudiaSkeleton className="h-12 w-12 shrink-0 rounded-full" />
                                <div className="flex-1 space-y-2.5">
                                    <StudiaSkeleton className="h-4 w-52 max-w-[65%] rounded-md" />
                                    <StudiaSkeleton className="h-3 w-36 rounded-md" />
                                </div>
                                <StudiaSkeleton className="h-7 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-xl">
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

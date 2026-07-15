import { Folder } from 'lucide-react';
import AppTable from '@/Components/table/AppTable';
import { StudentGrade, Criterion, MINIMUM_PASSING_GRADE } from '../services/constants';

interface GradesTabProps {
    studentGrades: StudentGrade[];
    activeCriteria: Criterion[];
    getStudentTasksAverage: (studentId: number) => string;
    setScore: (studentId: number, criterionId: number, val: string) => void;
    handleAsentarCalificaciones: () => void;
}

export default function GradesTab({
    studentGrades,
    activeCriteria,
    getStudentTasksAverage,
    setScore,
    handleAsentarCalificaciones
}: GradesTabProps) {
    return (
        <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <AppTable
                    data={studentGrades}
                    keyExtractor={r => r.id}
                    columns={[
                        {
                            header: 'Matrícula',
                            accessor: r => r.matricula,
                            className: 'text-sm text-slate-500',
                        },
                        {
                            header: 'Alumno',
                            accessor: r => r.name,
                            className: 'text-sm text-slate-500',
                        },
                        ...activeCriteria.map(c => {
                            const isSynced = c.syncTasks;
                            return {
                                header: (
                                    <div className="flex flex-col items-center gap-0.5 min-w-[140px] max-w-[200px] text-center">
                                        <span className="text-xs font-semibold text-slate-700 truncate w-full" title={c.name}>{c.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{c.percentage}%</span>
                                    </div>
                                ),
                                align: 'center' as const,
                                headerClassName: 'w-36',
                                accessor: (r: StudentGrade) => {
                                    const val = isSynced ? getStudentTasksAverage(r.id) : (r.scores[c.id] ?? '');
                                    return (
                                        <div className="flex justify-center items-center gap-1.5 h-8">
                                            {isSynced ? (
                                                <div className="flex items-center gap-1 text-slate-800" title="Sincronizado con Plataforma">
                                                    <span className="text-sm text-slate-800">
                                                        {val || '0'}
                                                    </span>
                                                    <span className="text-[13px] text-slate-400">/10</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="10"
                                                        value={val}
                                                        onChange={e => setScore(r.id, c.id, e.target.value)}
                                                        placeholder="—"
                                                        className={`w-12 text-center text-sm bg-transparent border-0 border-b ${
                                                            val === '' ? 'border-slate-200' : 'border-transparent'
                                                            } focus:border-[#1e88e5] focus:ring-0 text-slate-800 outline-none transition-all py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                    />
                                                    <span className="text-[10px]text-slate-400">/ 10</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                },
                            };
                        }),
                        {
                            header: 'Promedio',
                            align: 'center' as const,
                            headerClassName: 'w-24',
                            accessor: (r: StudentGrade) => {
                                const filled = activeCriteria.every(c => {
                                    const val = c.syncTasks ? getStudentTasksAverage(r.id) : (r.scores[c.id] ?? '');
                                    return val !== '';
                                });
                                if (!filled) return <span className="text-xs text-slate-300 font-semibold">—</span>;
                                const avg = activeCriteria.reduce((sum, c) => {
                                    const val = c.syncTasks ? getStudentTasksAverage(r.id) : (r.scores[c.id] || '0');
                                    return sum + (parseFloat(val) * c.percentage / 100);
                                }, 0);
                                return (
                                    <span className={`text-sm font-black ${avg >= MINIMUM_PASSING_GRADE ? 'text-slate-700' : 'text-rose-500'}`}>
                                        {avg % 1 === 0 ? avg.toString() : avg.toFixed(1)}
                                    </span>
                                );
                            },
                        },
                    ]}
                />
            </div>

            {/* Guardar */}
            <div className="flex justify-end mt-5">
                <button
                    onClick={handleAsentarCalificaciones}
                    className="flex items-center gap-2 bg-[#1e88e5] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-extrabold text-sm transition-all shadow-sm active:scale-[0.98]"
                >
                    <Folder size={14} />
                    Guardar calificaciones
                </button>
            </div>
        </div>
    );
}

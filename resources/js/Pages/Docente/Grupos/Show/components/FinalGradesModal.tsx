import React from 'react';
import { FileText, X } from 'lucide-react';
import { MOCK_STUDENTS } from '../services/constants';

interface FinalGradesModalProps {
    isOpen: boolean;
    onClose: () => void;
    grupo: string;
    materia: string;
    getParcialAverage: (studentId: number, num: number) => number | string;
    getFinalAverage: (studentId: number) => number | string;
}

export default function FinalGradesModal({
    isOpen,
    onClose,
    grupo,
    materia,
    getParcialAverage,
    getFinalAverage
}: FinalGradesModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
                {/* Cabecera del visualizador */}
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e88e5]">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-800 leading-none">Calificaciones Finales</h4>
                            <span className="text-[11px] font-bold text-slate-400 mt-1.5 block">Acta de Calificaciones · Grupo {grupo} · {materia}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-655 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-xl transition-all"
                        title="Cerrar vista"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Cuerpo del Acta (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Matrícula</th>
                                    <th className="px-6 py-4">Alumno</th>
                                    <th className="px-6 py-4 text-center">P1</th>
                                    <th className="px-6 py-4 text-center">P2</th>
                                    <th className="px-6 py-4 text-center">P3</th>
                                    <th className="px-6 py-4 text-center">Prom. Final</th>
                                    <th className="px-6 py-4 text-center">Estatus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MOCK_STUDENTS.map(s => {
                                    const p1 = getParcialAverage(s.id, 1);
                                    const p2 = getParcialAverage(s.id, 2);
                                    const p3 = getParcialAverage(s.id, 3);
                                    const finalAvg = getFinalAverage(s.id);
                                    const hasPassed = typeof finalAvg === 'number' && finalAvg >= 6;
                                    return (
                                        <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-3.5 text-xs text-slate-400 font-bold">{s.matricula}</td>
                                            <td className="px-6 py-3.5 text-sm text-slate-800 font-extrabold">{s.name}</td>
                                            <td className="px-6 py-3.5 text-sm font-bold text-slate-600 text-center">{p1}</td>
                                            <td className="px-6 py-3.5 text-sm font-bold text-slate-600 text-center">{p2}</td>
                                            <td className="px-6 py-3.5 text-sm font-bold text-slate-600 text-center">{p3}</td>
                                            <td className="px-6 py-3.5 text-sm font-black text-slate-800 text-center bg-slate-50/40">
                                                {finalAvg}
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                {finalAvg === '—' ? (
                                                    <span className="text-[10px] font-black text-slate-350 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        Sin Nota
                                                    </span>
                                                ) : hasPassed ? (
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                        Aprobado
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                        Reprobado
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-450 font-bold">
                    <span>Total de Alumnos: {MOCK_STUDENTS.length}</span>
                    <button
                        type="button"
                        onClick={() => {
                            window.print();
                        }}
                        className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
                    >
                        <FileText size={13} />
                        Imprimir Acta
                    </button>
                </div>
            </div>
        </div>
    );
}

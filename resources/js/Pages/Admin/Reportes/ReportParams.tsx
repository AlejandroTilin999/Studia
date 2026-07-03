import { Download } from 'lucide-react';

interface StudentItem {
    matricula: string;
    name: string;
    group: string;
}

interface ReportParamsProps {
    selectedReport: 'asistencia' | 'constancia' | 'boleta';
    groupFilter: string;
    onGroupChange: (group: string) => void;
    selectedStudentMatricula: string;
    setSelectedStudentMatricula: (matricula: string) => void;
    periodFilter: string;
    setPeriodFilter: (period: string) => void;
    filteredStudents: StudentItem[];
    onDownload: () => void;
    onReset: () => void;
}

export default function ReportParams({
    selectedReport,
    groupFilter,
    onGroupChange,
    selectedStudentMatricula,
    setSelectedStudentMatricula,
    periodFilter,
    setPeriodFilter,
    filteredStudents,
    onDownload,
    onReset,
}: ReportParamsProps) {
    return (
        <div className="col-span-1 md:col-span-2 border border-slate-100 bg-slate-50/50 rounded-2xl p-6 flex flex-col gap-6 h-fit text-left">
            <div className="space-y-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parámetros del Reporte</span>
                
                {/* Group filter dropdown */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar Grupo por:</label>
                    <div>
                        <select
                            value={groupFilter}
                            onChange={e => onGroupChange(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1e88e5] text-xs font-bold text-slate-700 transition-all focus:outline-none focus:border-[#1e88e5]"
                        >
                            <option value="1°A">1°A</option>
                            <option value="2-B">2-B</option>
                            <option value="3-A">3-A</option>
                        </select>
                    </div>
                </div>

                {/* Student filter dropdown (only for constancia or boleta) */}
                {(selectedReport === 'constancia' || selectedReport === 'boleta') && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seleccionar Alumno:</label>
                        <div>
                            <select
                                value={selectedStudentMatricula}
                                onChange={e => setSelectedStudentMatricula(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1e88e5] text-xs font-bold text-slate-700 transition-all focus:outline-none focus:border-[#1e88e5]"
                            >
                                {filteredStudents.map((s) => (
                                    <option key={s.matricula} value={s.matricula}>
                                        {s.name} ({s.matricula})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Period filter dropdown (only for asistencia or boleta) */}
                {(selectedReport === 'asistencia' || selectedReport === 'boleta') && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar por Periodo:</label>
                        <div>
                            <select
                                value={periodFilter}
                                onChange={e => setPeriodFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1e88e5] text-xs font-bold text-slate-700 transition-all focus:outline-none focus:border-[#1e88e5]"
                            >
                                <option value="Mayo 2026">Mayo 2026</option>
                                <option value="Junio 2026">Junio 2026</option>
                                <option value="Julio 2026">Julio 2026</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
                <button 
                    type="button"
                    onClick={onDownload}
                    className="w-full bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-none"
                >
                    <Download className="w-4 h-4" />
                    Generar y Descargar
                </button>
                <button 
                    type="button"
                    onClick={onReset}
                    className="w-full border border-slate-200 text-slate-500 font-bold h-12 rounded-xl flex items-center justify-center gap-2 text-xs hover:bg-slate-50 transition-all"
                >
                    Restablecer
                </button>
            </div>
        </div>
    );
}

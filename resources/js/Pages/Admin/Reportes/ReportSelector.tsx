interface ReportSelectorProps {
    selectedReport: 'asistencia' | 'constancia' | 'boleta';
    setSelectedReport: (report: 'asistencia' | 'constancia' | 'boleta') => void;
}

export default function ReportSelector({
    selectedReport,
    setSelectedReport,
}: ReportSelectorProps) {
    return (
        <div className="col-span-1 md:col-span-3 space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">Selecciona el tipo de reporte</span>
            
            {/* Option 1: Asistencia */}
            <div 
                onClick={() => setSelectedReport('asistencia')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedReport === 'asistencia'
                        ? 'bg-blue-50/50 border-[#1e88e5] shadow-sm animate-none'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
            >
                <div className="text-left">
                    <span className="font-extrabold text-slate-800 text-sm block">Reportes de asistencia</span>
                    <span className="text-[11px] text-slate-400 font-bold block mt-1 leading-tight">
                        Descarga formato de asistencia mensual por grupo
                    </span>
                </div>
            </div>

            {/* Option 2: Constancia */}
            <div 
                onClick={() => setSelectedReport('constancia')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedReport === 'constancia'
                        ? 'bg-blue-50/50 border-[#1e88e5] shadow-sm animate-none'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
            >
                <div className="text-left">
                    <span className="font-extrabold text-slate-800 text-sm block">Constancia de estudios</span>
                    <span className="text-[11px] text-slate-400 font-bold block mt-1 leading-tight">
                        Generación de constancias de inscripción oficial
                    </span>
                </div>
            </div>

            {/* Option 3: Boleta */}
            <div 
                onClick={() => setSelectedReport('boleta')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedReport === 'boleta'
                        ? 'bg-blue-50/50 border-[#1e88e5] shadow-sm animate-none'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
            >
                <div className="text-left">
                    <span className="font-extrabold text-slate-800 text-sm block">Boleta de calificaciones</span>
                    <span className="text-[11px] text-slate-400 font-bold block mt-1 leading-tight">
                        Visualización y descarga de calificaciones por periodo
                    </span>
                </div>
            </div>
        </div>
    );
}

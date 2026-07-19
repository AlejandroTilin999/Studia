import { Rows3, FileText, ClipboardList, Dock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportSelectorProps {
    selectedReport: 'asistencia' | 'constancia' | 'boleta' | 'kardex' | null;
    setSelectedReport: (report: 'asistencia' | 'constancia' | 'boleta' | 'kardex' | null) => void;
}

export default function ReportSelector({
    selectedReport,
    setSelectedReport,
}: ReportSelectorProps) {
    const options = [
        {
            id: 'asistencia',
            title: 'Lista de asistencias',
            icon: Rows3
        },
        {
            id: 'constancia',
            title: 'Constancia de estudios',
            icon: FileText
        },
        {
            id: 'boleta',
            title: 'Boleta de calificaciones',
            icon: ClipboardList
        },
        {
            id: 'kardex',
            title: 'Kardex académico',
            icon: Dock
        }
    ];

    return (
        <div className="space-y-4 w-full">
            <h4 className="text-[13px] font-semibold text-slate-400 block text-left mb-6 ml-1">
                Paso 1: Selecciona el tipo de documento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                {options.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = selectedReport === opt.id;

                    return (
                        <button
                            key={opt.id}
                            onClick={() => setSelectedReport(opt.id as any)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-3 p-6 rounded-lg border transition-all duration-200 text-center bg-white shadow-none group relative h-[120px]",
                                isActive
                                    ? "bg-slate-100 border-slate-200"
                                    : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                            )}
                        >
                            {/* Radio Button Indicator */}
                            <div className={cn(
                                "absolute top-3 left-3 w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                                isActive
                                    ? "border-[#0266E0] bg-white"
                                    : "border-slate-200 bg-white group-hover:border-slate-300"
                            )}>
                                {isActive && (
                                    <div className="w-2 h-2 rounded-full bg-[#0266E0] animate-in zoom-in-50 duration-300" />
                                )}
                            </div>

                            <Icon
                                size={26}
                                strokeWidth={1.5}
                                className={cn(
                                    "shrink-0 transition-colors",
                                    isActive ? "text-slate-600" : "text-slate-300"
                                )}
                            />

                            <div className="min-w-0">
                                <span className={cn(
                                    "text-[13px] font-semibold tracking-tight block transition-colors leading-tight px-2",
                                    isActive ? "text-slate-900" : "text-slate-600"
                                )}>
                                    {opt.title}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

import BaseModal from '@/Components/BaseModal';

interface Grade {
    id: number;
    subject: string;
    teacher: string;
    score: string;
    approved: string;
    details?: Record<number, {
        configured: boolean;
        criteria: {
            name: string;
            percentage: number;
            score: number | null;
        }[];
        average: number | string;
    }>;
}

interface GradeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    grade: Grade | null;
}

export default function GradeDetailsModal({
    isOpen,
    onClose,
    grade,
}: GradeDetailsModalProps) {
    if (!grade) return null;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Desglose de Calificaciones"
            subtitle="Detalle y ponderaciones del ciclo académico para la asignatura"
            maxWidthClass="max-w-md"
            cancelLabel="Cerrar"
        >
            {/* Body */}
            <div className="space-y-4 font-body text-left">
                <div>
                    <h4 className="text-base font-extrabold text-slate-800 leading-tight">
                        {grade.subject}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold mt-1">Docente: {grade.teacher}</p>
                </div>

                {/* Grades breakdown */}
                <div className="space-y-3 pt-2">
                    {[1, 2, 3].map(num => {
                        const pDetail = grade.details?.[num];
                        const avg = pDetail ? pDetail.average : '—';
                        return (
                            <div key={num} className="border-b border-slate-100 pb-2">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                                    <span>Parcial {num}</span>
                                    <span>{avg}</span>
                                </div>
                                {pDetail?.configured && pDetail.criteria.map((c: any, cIdx: number) => (
                                    <div key={cIdx} className="flex justify-between items-center text-[11px] text-slate-400 pl-4">
                                        <span>{c.name} ({c.percentage}%)</span>
                                        <span>{c.score !== null ? c.score : '—'}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                    <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="font-extrabold text-slate-700">Calificación Final</span>
                        <span className="font-black text-base text-[#5c54f2]">{grade.score}</span>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

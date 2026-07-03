import BaseModal from '@/Components/BaseModal';

interface Grade {
    id: number;
    subject: string;
    teacher: string;
    score: string;
    approved: string;
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
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 text-xs">
                        <span className="font-semibold text-slate-500">Examen Parcial 1 (30%)</span>
                        <span className="font-bold text-slate-800">9.5</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 text-xs">
                        <span className="font-semibold text-slate-500">Examen Parcial 2 (30%)</span>
                        <span className="font-bold text-slate-800">10.0</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 text-xs">
                        <span className="font-semibold text-slate-500">Tareas y Proyectos (40%)</span>
                        <span className="font-bold text-slate-800">{grade.score}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 text-xs">
                        <span className="font-extrabold text-slate-700">Calificación Final</span>
                        <span className="font-black text-base text-[#5c54f2]">{grade.score}</span>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

import React from 'react';
import { Hash, Folder, Download } from 'lucide-react';
import { MockStudent } from './Index';
import AppTable, { AppTableColumn } from '@/Components/AppTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput } from '@/Components/FormFields';

interface StudentKardexModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: MockStudent | null;
    onEditClick?: (student: MockStudent) => void;
    onDownloadKardex: (student: MockStudent) => void;
    calculateGPA: (grades: { score: number }[]) => string;
}

export default function StudentKardexModal({
    isOpen,
    onClose,
    student,
    onEditClick,
    onDownloadKardex,
    calculateGPA
}: StudentKardexModalProps) {
    if (!student) return null;

    const displayGrades = student.grades.length > 0 ? student.grades : [
        { subject: 'Matemáticas', score: 10, period: '2° Semestre (Ene-Jun 2026)' },
        { subject: 'Inglés', score: 10, period: '2° Semestre (Ene-Jun 2026)' },
        { subject: 'Redes', score: 10, period: '2° Semestre (Ene-Jun 2026)' },
        { subject: 'Literatura', score: 10, period: '2° Semestre (Ene-Jun 2026)' }
    ];
    const gpa = calculateGPA(displayGrades);

    const handleDownloadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onDownloadKardex(student);
    };

    const kardexColumns: AppTableColumn<{ subject: string; score: number; period: string }>[] = [
        {
            header: "Semestre/Ciclo",
            accessor: (grade, idx) => {
                const isFirstOfPeriod = idx === 0 || displayGrades[idx - 1].period !== grade.period;
                return isFirstOfPeriod ? (
                    <div>
                        <span className="text-slate-800 font-extrabold block">{grade.period}</span>
                        <span className="text-[10px] text-slate-400 font-normal block mt-0.5">Ciclo escolar: 2025-2026</span>
                    </div>
                ) : null;
            },
            align: "left",
            className: "text-slate-500 font-medium w-1/3 pl-6 text-left"
        },
        {
            header: "Materia",
            accessor: (grade) => grade.subject,
            align: "left",
            className: "text-slate-655 font-semibold w-1/3 pl-6 text-left"
        },
        {
            header: "Calificación",
            accessor: (grade) => grade.score.toFixed(0),
            align: "left",
            className: "text-slate-700 font-medium w-1/3 pl-6 text-left"
        }
    ];

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Kardex de Alumno"
            subtitle="Consulta el historial académico y promedio general del estudiante"
            maxWidthClass="max-w-3xl"
            onSubmit={handleDownloadSubmit}
            confirmLabel="Descargar Kardex"
            cancelLabel="Cerrar"
        >
            {/* Student Info Fields */}
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1 text-left">
                    <FormLabel>Matrícula</FormLabel>
                    <FormInput
                        readOnly
                        value={student.matricula}
                        className="bg-slate-100 border-0 text-slate-500 font-mono"
                        icon={<Hash size={13} />}
                    />
                </div>
                <div className="space-y-1.5 col-span-2 text-left">
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormInput
                        readOnly
                        value={student.name}
                        className="bg-slate-100 border-0 text-slate-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                    <FormLabel>Grupo Asignado</FormLabel>
                    <FormInput
                        readOnly
                        value={student.groupName}
                        className="bg-slate-100 border-0 text-slate-500"
                    />
                </div>
                <div className="space-y-1.5 text-left">
                    <FormLabel>Promedio General</FormLabel>
                    <FormInput
                        readOnly
                        value={gpa}
                        className="bg-slate-100 border-0 text-[#1e88e5] font-black"
                    />
                </div>
            </div>

            {/* Grades Table */}
            <div className="space-y-1.5 text-left pt-2">
                <FormLabel>Historial de Calificaciones</FormLabel>
                <AppTable
                    columns={kardexColumns}
                    data={displayGrades}
                    keyExtractor={(grade, idx) => idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-none text-sm animate-none"
                />
            </div>
        </BaseModal>
    );
}

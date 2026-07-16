import React from 'react';
import { Hash, X, FileText, Calendar } from 'lucide-react';
import AppTable from '@/Components/table/AppTable';
import { AppTableColumn } from '@/Components/table/types/table.types';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { calculateGPA } from '@/utils/stringUtils';

interface StudentKardexModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    onDownloadKardex: (student: any) => void;
}

interface KardexRow {
    subject: string;
    code: string;
    score: number;
    period: string;
}

export default function StudentKardexModal({
    isOpen,
    onClose,
    student,
    onDownloadKardex
}: StudentKardexModalProps) {
    if (!student) return null;

    const displayGrades = student.grades || [];

    // Extraemos el periodo del primer registro si existe, para mostrarlo arriba
    const displayPeriod = displayGrades.length > 0 ? displayGrades[0].period : 'S/C';

    // Función de redondeo personalizado: >= 0.6 sube, <= 0.5 baja
    const customRound = (val: number) => Math.floor(val + 0.4);

    const rawGpa = calculateGPA(displayGrades);
    const gpa = isNaN(parseFloat(rawGpa)) ? rawGpa : customRound(parseFloat(rawGpa));

    const handleDownloadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onDownloadKardex(student);
    };

    const kardexColumns: AppTableColumn<KardexRow>[] = [
        {
            header: "Clave",
            accessor: (grade: KardexRow) => (
                <span className="font-normal text-xs text-slate-800">{grade.code}</span>
            ),
            align: "left",
            className: "pl-4 text-left w-1/4"
        },
        {
            header: "Materia",
            accessor: (grade: KardexRow) => grade.subject,
            align: "left",
            className: "text-slate-755 font-normal pl-4 text-left w-2/4"
        },
        {
            header: "Calificación",
            accessor: (grade: KardexRow) => customRound(Number(grade.score)),
            align: "center",
            headerClassName: "text-center",
            className: "text-slate-700 font-normal text-center w-1/4"
        }
    ];

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            onSubmit={handleDownloadSubmit}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[500px] h-full text-left relative">
                {/* Windows Close button relative to the entire grid modal container */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Info Panel (col-span-2) - Solid Blue #0266E0 */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-xl font-normal text-white leading-tight">
                                Kardex Académico
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                Consulta el historial completo de calificaciones asentadas y el promedio de rendimiento de este alumno.
                            </p>
                            <div className="py-2">
                                <span className="text-[10px] uppercase font-normal text-blue-200 block mb-1">Promedio General</span>
                                <span className="text-4xl font-normal text-white">{gpa}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-normal leading-tight pt-4 border-t border-white/15 hidden md:block">
                        Prepahid Campus Escolar
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <form onSubmit={handleDownloadSubmit} className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[500px] relative">
                    <div className="space-y-4 flex-1 flex flex-col justify-center pr-2">

                        {/* Student Details Fields */}
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel className="font-normal">Matrícula</FormLabel>
                                <FormInput
                                    readOnly
                                    value={student.matricula}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-mono focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs font-normal"
                                    icon={<Hash size={13} />}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel className="font-normal">Ciclo Escolar</FormLabel>
                                <FormInput
                                    readOnly
                                    value={displayPeriod}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-800 font-normal focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"
                                    icon={<Calendar size={13} />}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel className="font-normal">Nombre del Estudiante</FormLabel>
                                <FormInput
                                    readOnly
                                    value={student.name}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs font-normal"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel className="font-normal">Grupo Asignado</FormLabel>
                                <FormInput
                                    readOnly
                                    value={student.groupName || 'SIN GRUPO'}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs font-normal"
                                />
                            </div>
                        </div>

                        {/* Grades Table */}
                        <div className="space-y-1.5 text-left pt-1">
                            <FormLabel className="font-normal">Historial de Calificaciones</FormLabel>
                            <AppTable
                                columns={kardexColumns}
                                data={displayGrades}
                                keyExtractor={(grade: KardexRow, idx: number) => idx.toString()}
                                emptyMessage="Sin calificaciones asentadas en el sistema."
                                className="border border-slate-100 rounded-xl overflow-hidden shadow-none max-h-[170px] overflow-y-auto text-xs"
                                enablePagination={false}
                                enableSorting={false}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 h-10 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-550 hover:text-slate-700 font-normal text-[12.5px] transition-all outline-none min-w-[100px]"
                        >
                            Cerrar
                        </button>
                        <button
                            type="submit"
                            className="bg-[#1e88e5] hover:bg-blue-700 text-white font-normal h-10 px-6 rounded-lg text-[12.5px] transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-100/50 outline-none min-w-[150px]"
                        >
                            <FileText size={14} />
                            Descargar PDF
                        </button>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
}

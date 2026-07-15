import React from 'react';
import { FileText, X, Users, CheckCircle, GraduationCap } from 'lucide-react';
import AppTable from '@/Components/table/AppTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { MOCK_STUDENTS, MINIMUM_PASSING_GRADE, StudentGrade } from '../services/constants';

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

    const totalStudents = MOCK_STUDENTS.length;
    const passedCount = MOCK_STUDENTS.filter(s => {
        const finalAvg = getFinalAverage(s.id);
        return typeof finalAvg === 'number' && finalAvg >= MINIMUM_PASSING_GRADE;
    }).length;
    const passPercentage = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

    const handlePrintSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        window.print();
    };

    const columns = [
        {
            header: "Matrícula",
            accessor: (student: any) => student.matricula,
            align: "left" as const,
            sortable: false,
            headerClassName: "pl-1.5",
            className: "text-slate-500 font-semibold text-left pl-1.5 text-xs max-w-[50px]"
        },
        {
            header: "Alumno",
            accessor: (student: any) => student.name,
            align: "left" as const,
            sortable: false,
            headerClassName: "pl-2",
            className: "text-slate-500 font-normal text-left pl-2 text-xs truncate max-w-[120px]"
        },
        {
            header: "P1",
            accessor: (student: any) => getParcialAverage(student.id, 1),
            align: "center" as const,
            sortable: false,
            headerClassName: "text-center w-12 min-w-[48px]",
            className: "text-slate-650 font-bold text-center text-xs w-12 min-w-[48px]"
        },
        {
            header: "P2",
            accessor: (student: any) => getParcialAverage(student.id, 2),
            align: "center" as const,
            sortable: false,
            headerClassName: "text-center w-12 min-w-[48px]",
            className: "text-slate-650 font-bold text-center text-xs w-12 min-w-[48px]"
        },
        {
            header: "P3",
            accessor: (student: any) => getParcialAverage(student.id, 3),
            align: "center" as const,
            sortable: false,
            headerClassName: "text-center w-12 min-w-[48px]",
            className: "text-slate-650 font-bold text-center text-xs w-12 min-w-[48px]"
        },
        {
            header: "Final",
            accessor: (student: any) => {
                const avg = getFinalAverage(student.id);
                return (
                    <span className="font-black text-slate-800 text-xs">
                        {avg}
                    </span>
                );
            },
            align: "center" as const,
            sortable: false,
            headerClassName: "text-center w-16 min-w-[64px]",
            className: "text-center bg-slate-50/50 w-16 min-w-[64px]"
        },
        {
            header: "Estatus",
            accessor: (student: any) => {
                const finalAvg = getFinalAverage(student.id);
                const hasPassed = typeof finalAvg === 'number' && finalAvg >= MINIMUM_PASSING_GRADE;

                if (finalAvg === '—') {
                    return (
                        <span className="text-[9px] font-black text-slate-350 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Sin Nota
                        </span>
                    );
                }
                return hasPassed ? (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Aprobado
                    </span>
                ) : (
                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Reprobado
                    </span>
                );
            },
            align: "center" as const,
            sortable: false,
            headerClassName: "text-center w-24 min-w-[96px]",
            className: "text-center pr-4 w-24 min-w-[96px]"
        }
    ];

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-4xl"
            onSubmit={handlePrintSubmit}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[480px] h-full text-left relative">
                {/* Close button relative to the entire grid modal container */}
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
                            <h3 className="text-xl font-bold text-white leading-tight">
                                Acta de Calificaciones
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                Consulta el promedio final de los parciales activos y el estatus de aprobación de los alumnos del grupo.
                            </p>

                            <div className="py-2">
                                <span className="text-[10px] uppercase font-black text-blue-200 block mb-1">Índice de Aprobación</span>
                                <span className="text-4xl font-black text-white">{passPercentage}%</span>
                            </div>

                            <div className="pt-2 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-blue-100">
                                    <Users size={14} />
                                    <span>Alumnos inscritos: {totalStudents}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-blue-100">
                                    <CheckCircle size={14} />
                                    <span>Aprobados: {passedCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block">
                        Prepahid Campus Escolar · Docente
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <form onSubmit={handlePrintSubmit} className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[480px] relative">
                    <div className="space-y-4 flex-1 flex flex-col justify-center pr-2">
                        {/* Course Details Fields */}
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel>Materia / Asignatura</FormLabel>
                                <FormInput
                                    readOnly
                                    value={materia}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-normal focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"

                                />
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel>Grupo Asignado</FormLabel>
                                <FormInput
                                    readOnly
                                    value={grupo}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"
                                />
                            </div>
                        </div>

                        {/* Grades Table */}
                        <div className="space-y-1.5 text-left pt-1">
                            <FormLabel>Registro Final de Calificaciones</FormLabel>
                            <AppTable
                                columns={columns}
                                data={MOCK_STUDENTS}
                                keyExtractor={(student: any) => student.id.toString()}
                                emptyMessage="Sin estudiantes asignados a esta clase."
                                className="border border-slate-100 rounded-xl overflow-hidden shadow-none max-h-[220px] overflow-y-auto text-xs"
                                enablePagination={false}
                                enableSorting={false}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 h-10 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-550 hover:text-slate-700 font-extrabold text-[12.5px] transition-all outline-none min-w-[100px]"
                        >
                            Cerrar
                        </button>
                        <button
                            type="submit"
                            className="bg-[#1e88e5] hover:bg-blue-700 text-white font-extrabold h-10 px-6 rounded-lg text-[12.5px] transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-100/50 outline-none min-w-[150px]"
                        >
                            <FileText size={14} />
                            Imprimir Acta
                        </button>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
}

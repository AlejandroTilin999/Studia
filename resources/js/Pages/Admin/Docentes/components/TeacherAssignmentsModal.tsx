import React from 'react';
import { GraduationCap } from "lucide-react";
import BaseModal from "@/Components/BaseModal";
import { TeacherFormatted } from '../types';

interface TeacherAssignmentsModalProps {
    open: boolean;
    teacher: TeacherFormatted | null;
    onClose: () => void;
}

export default function TeacherAssignmentsModal({
    open,
    teacher,
    onClose,
}: TeacherAssignmentsModalProps) {
    if (!teacher) return null;

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Asignación Académica"
            subtitle="Consulta las materias y los grupos a cargo de este docente"
            maxWidthClass="max-w-lg"
            showFooter={false}
        >
            {/* Información del profesor */}
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-left">
                <span className="text-slate-400 font-bold uppercase tracking-wider block">
                    Profesor
                </span>
                <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                    {teacher.name}
                </span>
                <span className="text-[10.5px] text-[#1e88e5] bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-100 inline-block mt-2">
                    {teacher.specialty}
                </span>
            </div>

            {/* Asignaciones */}
            <div className="space-y-4 text-left mt-5">
                <h4 className="font-bold text-slate-800 text-xs">
                    Materias y Grupos a Cargo
                </h4>
                {teacher.assignments.length > 0 ? (
                    <div className="space-y-2">
                        {teacher.assignments.map((assignment, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all animate-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-xl text-slate-600 border border-slate-100">
                                        <GraduationCap size={16} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-800 block text-xs">
                                            {assignment.subject}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                            Ciclo Escolar 2026-A
                                        </span>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-xl">
                                    Grupo {assignment.groupName}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                        Este profesor aún no cuenta con materias asignadas para el ciclo actual.
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all focus:outline-none"
                >
                    Cerrar
                </button>
            </div>
        </BaseModal>
    );
}

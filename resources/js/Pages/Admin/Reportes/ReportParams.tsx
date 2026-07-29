import React, { useMemo } from 'react';
import { RotateCcw, Users, User, Calendar } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import { FormSelect } from '@/Components/forms/FormSelect';
import { cn } from '@/lib/utils';

interface StudentItem {
    matricula: string;
    nombre: string;
    grupo_id: number;
}

interface GroupItem {
    id: number;
    nombre: string;
}

interface PeriodItem {
    id: number;
    nombre: string;
}

interface ReportParamsProps {
    selectedReport: 'asistencia' | 'constancia' | 'boleta' | 'kardex' | null;
    groupFilter: string;
    onGroupChange: (group: string) => void;
    selectedStudentMatricula: string;
    setSelectedStudentMatricula: (matricula: string) => void;
    periodFilter: string;
    setPeriodFilter: (period: string) => void;
    filteredStudents: StudentItem[];
    groups: GroupItem[];
    periods: PeriodItem[];
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
    groups,
    periods,
    onDownload,
    onReset,
}: ReportParamsProps) {
    if (!selectedReport) return null;

    const showStudent = selectedReport === 'constancia' || selectedReport === 'boleta' || selectedReport === 'kardex';
    const showPeriod = selectedReport === 'asistencia' || selectedReport === 'boleta';

    // Validación de formulario completo según el tipo de reporte
    const isFormValid = useMemo(() => {
        if (selectedReport === 'asistencia') {
            return !!groupFilter && !!periodFilter;
        }
        if (selectedReport === 'constancia' || selectedReport === 'kardex') {
            return !!selectedStudentMatricula;
        }
        if (selectedReport === 'boleta') {
            return !!selectedStudentMatricula && !!periodFilter;
        }
        return false;
    }, [selectedReport, groupFilter, selectedStudentMatricula, periodFilter]);

    // Verificar si hay algún filtro seleccionado para habilitar el reset
    const isAnyFilterSelected = useMemo(() => {
        return !!groupFilter || !!selectedStudentMatricula || !!periodFilter;
    }, [groupFilter, selectedStudentMatricula, periodFilter]);

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
            <h4 className="text-[13px] font-semibold text-slate-400 block text-left ml-1">
                Paso 2: Configura los parámetros de filtrado
            </h4>

            {/* Fila 1: Selectores de Filtrado (Dinámicos) */}
            <div className="flex flex-col lg:flex-row bg-white border border-slate-100 rounded-xl overflow-hidden shadow-none divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                {/* 1. GRUPO */}
                <div className="flex-1 flex flex-col justify-center px-6 py-5 min-w-0">
                    <div className="flex items-center gap-2 mb-2.5">
                        <Users size={14} className="text-slate-400 shrink-0" />
                        <label className="text-[13px] font-normal text-slate-500 truncate">
                            Grupo académico <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                    </div>
                    <FormSelect
                        value={groupFilter}
                        onChange={e => onGroupChange(e.target.value)}
                        className="h-11 bg-slate-50 border-slate-100 rounded-xl text-[13.5px] text-slate-700"
                    >
                        <option value="">Seleccionar grupo...</option>
                        {groups.map((g) => (
                            <option key={g.id} value={g.id.toString()}>{g.nombre}</option>
                        ))}
                    </FormSelect>
                </div>

                {/* 2. ALUMNO (Opcional) */}
                {showStudent && (
                    <div className="flex-1 flex flex-col justify-center px-6 py-5 min-w-0 animate-in fade-in zoom-in-98 duration-300">
                        <div className="flex items-center gap-2 mb-2.5">
                            <User size={14} className="text-slate-400 shrink-0" />
                            <label className="text-[13px] font-normal text-slate-500 truncate">
                                Estudiante seleccionado <span className="text-red-500 font-bold ml-0.5">*</span>
                            </label>
                        </div>
                        <FormSelect
                            value={selectedStudentMatricula}
                            onChange={e => setSelectedStudentMatricula(e.target.value)}
                            className="h-11 bg-slate-50 border-slate-100 rounded-xl text-[13.5px] text-slate-700"
                        >
                            <option value="">Seleccionar alumno...</option>
                            {filteredStudents.map((s) => (
                                <option key={s.matricula} value={s.matricula}>{s.nombre}</option>
                            ))}
                        </FormSelect>
                    </div>
                )}

                {/* 3. CICLO (Opcional) */}
                {showPeriod && (
                    <div className="flex-1 flex flex-col justify-center px-6 py-5 min-w-0 animate-in fade-in zoom-in-98 duration-300">
                        <div className="flex items-center gap-2 mb-2.5">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <label className="text-[13px] font-normal text-slate-500 truncate">
                                Periodo escolar <span className="text-red-500 font-bold ml-0.5">*</span>
                            </label>
                        </div>
                        <FormSelect
                            value={periodFilter}
                            onChange={e => setPeriodFilter(e.target.value)}
                            className="h-11 bg-slate-50 border-slate-100 rounded-xl text-[13.5px] text-slate-700"
                        >
                            <option value="">Seleccionar ciclo...</option>
                            {periods.map((p) => (
                                <option key={p.id} value={p.id.toString()}>{p.nombre}</option>
                            ))}
                        </FormSelect>
                    </div>
                )}
            </div>

            {/* Fila 2: Acciones Ancladas a la derecha */}
            <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onReset}
                    disabled={!isAnyFilterSelected}
                    className="h-11 px-5 bg-white border border-slate-100 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-[12px] uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-[0.97]"
                >
                    <RotateCcw size={16} />
                    Restablecer
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    disabled={!isFormValid}
                    className="h-11 px-8 bg-white border border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-bold text-[13px] rounded-lg flex items-center justify-center gap-3 hover:bg-rose-50/30 hover:border-rose-100 transition-all active:scale-[0.95] shadow-sm group"
                >
                    <FaFilePdf size={16} className={cn("transition-colors", isFormValid ? "text-rose-500" : "text-slate-300")} />
                    Generar reporte PDF
                </button>
            </div>
        </div>
    );
}

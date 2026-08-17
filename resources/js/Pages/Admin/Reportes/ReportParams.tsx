import React, { useMemo, useState } from 'react';
import { RotateCcw, Users, User, Calendar, FileSpreadsheet, Search } from 'lucide-react';
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
    onExportExcel?: () => void;
    onSendEmail?: () => void;
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
    onExportExcel,
    onSendEmail,
    onReset,
}: ReportParamsProps) {
    const [studentSearch, setStudentSearch] = useState('');
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

    const visibleStudents = useMemo(() => {
        const term = studentSearch.trim().toLocaleLowerCase('es-MX');
        if (!term) return filteredStudents;
        return filteredStudents.filter((student) =>
            student.nombre.toLocaleLowerCase('es-MX').includes(term) ||
            student.matricula.toLocaleLowerCase('es-MX').includes(term),
        );
    }, [filteredStudents, studentSearch]);

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
                        <div className="relative mb-2">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={studentSearch}
                                onChange={(event) => setStudentSearch(event.target.value)}
                                placeholder="Buscar por nombre o matrícula..."
                                className="h-9 w-full rounded-lg border border-slate-100 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-[#0266E0]"
                            />
                        </div>
                        <FormSelect
                            value={selectedStudentMatricula}
                            onChange={e => setSelectedStudentMatricula(e.target.value)}
                            className="h-11 bg-slate-50 border-slate-100 rounded-xl text-[13.5px] text-slate-700"
                        >
                            <option value="">Seleccionar alumno...</option>
                            {visibleStudents.map((s) => (
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
            <div className="flex flex-wrap items-center justify-end gap-3">
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

                {selectedReport === 'asistencia' && onExportExcel && (
                    <button
                        type="button"
                        onClick={onExportExcel}
                        disabled={!isFormValid}
                        className="h-11 px-5 bg-emerald-600 border border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[12px] rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.95]"
                    >
                        <FileSpreadsheet size={16} />
                        Exportar para Excel
                    </button>
                )}
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { getAuthenticatedNoPaddingLayout } from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    GraduationCap,
    Calendar,
    Printer,
    FileText,
    ChevronDown,
    ChevronUp,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectRecord {
    id: number;
    code: string;
    name: string;
    teacher: string;
    p1: string;
    p2: string;
    p3: string;
    finalGrade: string;
    credits: number;
    status: 'Aprobada' | 'En Cursamiento' | 'Reprobada';
}

interface PeriodRecord {
    cycleId: number;
    cycleName: string;
    semester: number;
    groupName: string;
    status: string;
    subjects: SubjectRecord[];
}

interface HistorialProps {
    studentInfo: {
        name: string;
        matricula: string;
        groupName: string;
        specialty: string;
        ciclo: string;
    };
    fullKardex: {
        summary: {
            gpa: string;
            totalSubjects: number;
            approvedSubjects: number;
            totalCredits: number;
            semestersCount: number;
        };
        periods: PeriodRecord[];
    };
}

export default function Historial({ studentInfo, fullKardex }: HistorialProps) {
    const { summary, periods = [] } = fullKardex || { summary: {}, periods: [] };
    const [collapsedPeriods, setCollapsedPeriods] = useState<Record<number, boolean>>({});

    const togglePeriod = (cycleId: number) => {
        setCollapsedPeriods(prev => ({
            ...prev,
            [cycleId]: !prev[cycleId]
        }));
    };

    const handlePrintKardex = () => {
        window.print();
    };

    const currentDate = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

    return (
        <>
            <Head title="Historial Académico y Kardex" />

            <div className="w-full font-body text-left pb-12 print:p-0">

                {/* --- HERO BANNER (100% PEGADO CANCELANDO PADDING DE CONTENEDOR) --- */}
                <div className="-mt-6 -mx-6 md:-mt-8 md:-mx-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] relative overflow-hidden bg-[#e8f0fe] rounded-none p-6 sm:p-8 md:p-10 border-b border-blue-100/80 select-none print:bg-white print:p-0 print:border-b">

                    {/* Decoraciones Geométricas de Studia */}
                    <div className="absolute left-0 top-0 bottom-0 w-48 overflow-hidden pointer-events-none select-none z-0 print:hidden">
                        <svg className="absolute -left-6 top-1 w-44 h-48 opacity-25" viewBox="0 0 120 140" fill="none">
                            <path d="M10 10 Q50 60 20 100 T100 120" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <div className="absolute left-10 top-4 w-14 h-14 bg-[#4db6ac] rotate-12 opacity-30" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                        <div className="absolute -left-8 top-12 w-24 h-12 bg-[#ab47bc] rotate-45 opacity-20 rounded-md"></div>
                        <div className="absolute left-8 top-28 w-12 h-12 bg-[#1e88e5] rounded-full opacity-40"></div>
                        <div className="absolute -left-6 top-40 w-12 h-12 bg-[#ffa726] rotate-12 opacity-35 rounded-md"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                        <div className="space-y-3 max-w-2xl pt-2 sm:pt-3">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold tracking-widest uppercase text-blue-600">
                                    Expediente Escolar Oficial
                                </p>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#0a0f1d] tracking-tight leading-tight">
                                    Historial Académico
                                </h2>
                            </div>

                            <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-xl leading-relaxed">
                                Consulta el registro oficial de asignaturas cursadas, calificaciones aprobatorias por parcial y promedios finales del centro escolar.
                            </p>

                            {/* Datos del Alumno - Tira Estilo Dashboard Moderno con Iconos Circulares */}
                            <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-[#0266E0] flex items-center justify-center shrink-0">
                                        <User size={15} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider leading-tight">Estudiante</span>
                                        <span className="font-extrabold text-[#0a0f1d] leading-tight">{studentInfo.name}</span>
                                    </div>
                                </div>

                                <div className="h-7 w-[1px] bg-blue-200/60 hidden sm:block"></div>

                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-[#0266E0] flex items-center justify-center shrink-0">
                                        <FileText size={15} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider leading-tight">Matrícula</span>
                                        <span className="font-extrabold text-[#0a0f1d] leading-tight">{studentInfo.matricula}</span>
                                    </div>
                                </div>

                                <div className="h-7 w-[1px] bg-blue-200/60 hidden sm:block"></div>

                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-[#0266E0] flex items-center justify-center shrink-0">
                                        <GraduationCap size={15} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider leading-tight">Especialidad</span>
                                        <span className="font-extrabold text-[#0a0f1d] leading-tight">{studentInfo.specialty}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTENIDOS (MAX WIDTH CON PADDING Y ESPACIADO) --- */}
                <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-8">

                {/* --- TARJETAS DE MÉTRICAS RESUMEN (ESTILO STUDIA) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Promedio General</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-extrabold text-[#0a0f1d] tracking-tight">
                            {(() => {
                                const raw = summary?.gpa;
                                if (raw === undefined || raw === null || raw === '' || raw === '—') return '—';
                                const num = Number(raw);
                                return isNaN(num) ? '—' : Math.round(num);
                            })()}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Materias Aprobadas</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-extrabold text-[#0a0f1d] tracking-tight">
                            {summary?.approvedSubjects || 0} <span className="text-xs font-semibold text-slate-400">/ {summary?.totalSubjects || 0}</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Semestres</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-extrabold text-[#0a0f1d] tracking-tight">
                            {summary?.semestersCount || 0} <span className="text-xs font-semibold text-slate-400">periodos</span>
                        </p>
                    </div>
                </div>

                {/* --- SECCIONES POR SEMESTRE / CICLO --- */}
                <div className="space-y-6">
                    {periods.length === 0 ? (
                        <div className="bg-white rounded-lg p-12 text-center space-y-4 border border-dashed border-slate-200">
                            <FileText size={40} className="mx-auto text-slate-300" />
                            <p className="text-slate-500 font-bold text-sm">
                                Aún no cuentas con registros de materias en tu historial académico.
                            </p>
                        </div>
                    ) : (
                        periods.map((period) => {
                            const isCollapsed = collapsedPeriods[period.cycleId];

                            return (
                                <div
                                    key={period.cycleId}
                                    className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden print:border-slate-300 print:shadow-none print:break-inside-avoid"
                                >
                                    {/* Encabezado del Semestre */}
                                    <div
                                        onClick={() => togglePeriod(period.cycleId)}
                                        className="p-5 md:p-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 transition-all select-none print:bg-slate-100"
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#0266E0] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                                                {period.semester}°
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-[#0a0f1d] leading-tight">
                                                    {period.semester}° Semestre · {period.groupName}
                                                </h3>
                                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                                    {period.cycleName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs",
                                                period.status === 'Vigente'
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-blue-600 text-white'
                                            )}>
                                                {period.status}
                                            </span>

                                            <button type="button" className="text-slate-400 hover:text-slate-700 print:hidden">
                                                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabla de Asignaturas del Semestre */}
                                    {!isCollapsed && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200/80 bg-white text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <th className="py-3.5 px-6">Clave</th>
                                                        <th className="py-3.5 px-6">Asignatura</th>
                                                        <th className="py-3.5 px-6">Docente</th>
                                                        <th className="py-3.5 px-3 text-center">P1</th>
                                                        <th className="py-3.5 px-3 text-center">P2</th>
                                                        <th className="py-3.5 px-3 text-center">P3</th>
                                                        <th className="py-3.5 px-4 text-center">Final</th>
                                                        <th className="py-3.5 px-6 text-center">Estatus</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                                    {period.subjects.map((sub) => (
                                                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="py-4 px-6 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                                {sub.code}
                                                            </td>
                                                            <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                                                                {sub.name}
                                                            </td>
                                                            <td className="py-4 px-6 text-slate-[#526985] whitespace-nowrap">
                                                                {sub.teacher}
                                                            </td>
                                                            <td className="py-4 px-3 text-center font-semibold text-slate-700">
                                                                {sub.p1}
                                                            </td>
                                                            <td className="py-4 px-3 text-center font-semibold text-slate-700">
                                                                {sub.p2}
                                                            </td>
                                                            <td className="py-4 px-3 text-center font-semibold text-slate-700">
                                                                {sub.p3}
                                                            </td>
                                                            <td className="py-4 px-4 text-center font-black text-sm text-[#0a0f1d]">
                                                                {sub.finalGrade}
                                                            </td>
                                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                                <span className={cn(
                                                                    "inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs",
                                                                    sub.status === 'Aprobada'
                                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                        : sub.status === 'En Cursamiento'
                                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                )}>
                                                                    {sub.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    </>
);
}

Historial.layout = getAuthenticatedNoPaddingLayout;

import React from 'react';
import { ClipboardList, BookOpen, FileText, User, ChevronRight, Star, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Task {
    id: number;
    title: string;
    status: string;
    desc: string;
    subjectName?: string;
}

interface StudentInfo {
    name: string;
    matricula: string;
    groupName: string;
    email: string;
    registeredAt: string;
    gpa: string;
    tutor: string;
    ciclo: string;
    periodo: string;
    subjectsCount?: number;
}

interface StudentDashboardCardsProps {
    studentInfo: StudentInfo;
    taskList: Task[];
    kardex?: any[];
    onOpenTaskModal: (task: Task) => void;
    onViewAllTasks?: () => void;
}

export default function StudentDashboardCards({
    studentInfo,
    taskList,
    kardex = [],
    onOpenTaskModal,
    onViewAllTasks,
}: StudentDashboardCardsProps) {
    // Helper to split student full name into Nombre(s), Apellido Paterno, Apellido Materno
    const fullName = studentInfo?.name || '';
    const nameParts = fullName.trim().split(/\s+/);
    let firstName = studentInfo.name;
    let lastNamePaternal = '-';
    let lastNameMaternal = '-';

    if (nameParts.length >= 4) {
        firstName = nameParts.slice(0, nameParts.length - 2).join(' ');
        lastNamePaternal = nameParts[nameParts.length - 2];
        lastNameMaternal = nameParts[nameParts.length - 1];
    } else if (nameParts.length === 3) {
        firstName = nameParts[0];
        lastNamePaternal = nameParts[1];
        lastNameMaternal = nameParts[2];
    } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastNamePaternal = nameParts[1];
        lastNameMaternal = '-';
    }

    const shortcuts = [
        {
            title: "Tareas Escolares",
            subtitle: "Consulta tus trabajos y sube entregas",
            icon: ClipboardList,
            path: "/alumno/materias",
        },
        {
            title: "Boleta Escolar",
            subtitle: "Revisa tus calificaciones parciales",
            icon: BookOpen,
            path: "/alumno/calificaciones",
        },
        {
            title: "Kárdex y Reportes",
            subtitle: "Descarga documentos académicos oficiales",
            icon: FileText,
            path: "/alumno/documentos",
        },
        {
            title: "Mi Perfil",
            subtitle: "Modifica tus datos y contraseña",
            icon: User,
            path: "/profile",
        }
    ];

    return (
        <div className="w-full text-left select-none space-y-8">

            {/* SECCIÓN 1: Información General (Diseño unificado con Docente) */}
            <div className="bg-slate-50 rounded-[32px] p-6 md:p-8 border border-slate-100 select-none transition-all duration-300 hover:shadow-sm">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-200/50">
                        <div className="text-center sm:text-left space-y-1.5 flex-1">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Expediente del Alumno</span>
                            <h2 className="text-xl font-medium text-slate-800 leading-none tracking-tight">Rendimiento Académico y Datos Escolares</h2>
                            <p className="text-xs text-slate-500 font-semibold">{studentInfo.email}</p>
                        </div>

                        <div className="hidden lg:flex flex-col items-start gap-1 shrink-0">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institución</span>
                            <img src="/assets/phid_logo.png" alt="Prepa Hidalgo" className="h-7 w-auto grayscale opacity-70" />
                        </div>
                    </div>

                    {/* Perfil Header: Grid de datos detallados */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 pt-1">
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Matrícula</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1">{studentInfo.matricula}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Nombre(s)</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1">{firstName}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Apellido Paterno</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1">{lastNamePaternal}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Apellido Materno</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1">{lastNameMaternal}</h3>
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Ciclo Escolar</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1 truncate">{studentInfo.ciclo}</h3>
                        </div>
                    </div>

                    {/* Grid de Estatus Secundario */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 pt-4 border-t border-slate-100/50">
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Semestre / Grupo</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1">{studentInfo.groupName}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Especialidad</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1 truncate" title="Técnico en Informática">Técnico en Informática</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Tutor de Grupo</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1">{studentInfo.tutor}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Promedio Gral.</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1">{studentInfo.gpa}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Materias Inscritas</span>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight mt-1">{studentInfo.subjectsCount || 0} materias</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: Mis Materias e Información de Parciales (Estilo Docente unificado) */}
            <div className="space-y-6">
                <div className="space-y-1 text-left px-2">
                    <h3 className="text-[11px] font-normal uppercase text-slate-400 tracking-[0.2em] mb-1">Tu Carga Académica</h3>
                    <h2 className="text-lg md:text-xl font-medium text-slate-800 tracking-tight leading-snug">Mis Materias e Información de Parciales</h2>
                    <p className="text-xs md:text-[13px] text-slate-500 font-normal leading-relaxed max-w-2xl mt-1.5">
                        Consulta el desglose de tus calificaciones por parcial y el promedio general de tus materias inscritas en tiempo real.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kardex.length > 0 ? kardex.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => router.visit(`/alumno/materias?id=${item.uuid}`)}
                            className="group flex flex-col p-5 bg-white border border-slate-200 hover:border-[#1e88e5] hover:bg-slate-50 transition-all duration-200 rounded-2xl shadow-none cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="min-w-0 text-left">
                                    <h4 className="text-sm font-medium text-slate-900 truncate leading-tight group-hover:text-[#1e88e5] transition-colors">
                                        {item.subject}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">
                                            {item.teacher}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-normal text-[#1e88e5] uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-lg">
                                        PROM: {item.score}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                                {[1, 2, 3].map((p) => {
                                    const pData = item.details?.[p];
                                    const avg = pData?.average ?? '—';
                                    return (
                                        <div key={p} className="flex flex-col items-center p-2 rounded-xl bg-slate-50/50 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                                            <span className="text-[9px] font-normal text-slate-400 uppercase tracking-widest mb-1">Parcial {p}</span>
                                            <span className={cn(
                                                "text-xs font-medium",
                                                avg === '—' ? "text-slate-300" : "text-slate-700"
                                            )}>
                                                {avg}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.visit(`/alumno/materias?id=${item.uuid}`);
                                    }}
                                    className="flex items-center gap-1 text-[10px] font-normal text-[#1e88e5] uppercase tracking-widest hover:text-blue-700 transition-colors"
                                >
                                    Ver Detalle completo
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="md:col-span-2 p-12 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                            <p className="text-sm text-slate-400 font-normal">No tienes materias inscritas actualmente.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CARD 2: Accesos Rápidos & Wizard Stepper */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100 space-y-8">
                <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Accesos Rápidos</h3>
                    <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-snug">Trámites y Rutas del Alumno</h2>
                    <p className="text-xs md:text-[13px] text-slate-500 font-semibold leading-relaxed max-w-2xl mt-1.5">
                        Navega de forma inmediata utilizando los accesos directos de nuestro wizard digital para consultar tus tareas, boletas o perfil.
                    </p>
                </div>

                {/* 2. Wizard Stepper Trail */}
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 py-4 w-full">
                    {/* Horizontal connection line behind circles (Visible only on desktop) */}
                    <div className="hidden md:block absolute left-12 right-12 top-[38px] h-0.5 bg-slate-100 z-0" />

                    {/* Vertical connection line behind circles (Visible only on mobile) */}
                    <div className="md:hidden absolute left-1/2 top-4 bottom-4 w-0.5 border-l border-dashed border-slate-200 z-0 -translate-x-1/2" />

                    {shortcuts.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => router.visit(item.path)}
                            className="flex flex-col items-center text-center cursor-pointer group relative z-10 w-full md:w-40"
                        >
                            {/* Circle Container */}
                            <div className="w-14 h-14 rounded-full bg-white border border-slate-250 group-hover:border-[#0266E0] group-hover:scale-105 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-[#0266E0] transition-all duration-300 relative z-10">
                                <item.icon size={20} className="stroke-[2.2]" />
                            </div>

                            {/* Title text */}
                            <span className="text-xs font-black text-slate-750 mt-3 group-hover:text-[#0266E0] transition-colors leading-tight block">
                                {item.title}
                            </span>

                            {/* Subtitle description */}
                            <span className="text-[10px] text-slate-400 font-semibold mt-1 leading-normal block max-w-[130px] md:max-w-none">
                                {item.subtitle}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

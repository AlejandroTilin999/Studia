import React from 'react';
import { ClipboardList, BookOpen, FileText, User, ChevronRight, Star, Clock } from 'lucide-react';
import { router, Deferred, Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import DotsLoader from '@/Components/ui/DotsLoader';
import { COLOR_THEMES } from '@/constants/ColorThemes';

interface Task {
    id: number;
    title: string;
    status: string;
    desc: string;
    subjectName?: string;
}

interface StudentInfo {
    name: string;
    firstName?: string;
    lastNamePaternal?: string;
    lastNameMaternal?: string;
    matricula: string;
    groupName: string;
    email: string;
    registeredAt: string;
    gpa: string;
    tutor: string;
    ciclo: string;
    periodo: string;
    subjectsCount?: number;
    specialty?: string;
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
    // Usar los campos directos si existen
    const displayFirstName = studentInfo?.firstName || studentInfo?.name || '—';
    const displayPaternal = (studentInfo?.lastNamePaternal !== null && studentInfo?.lastNamePaternal !== undefined && studentInfo?.lastNamePaternal !== '') ? studentInfo.lastNamePaternal : '—';
    const displayMaternal = (studentInfo?.lastNameMaternal !== null && studentInfo?.lastNameMaternal !== undefined && studentInfo?.lastNameMaternal !== '') ? studentInfo.lastNameMaternal : '—';

    const shortcuts = [
        {
            title: "Tareas Escolares",
            subtitle: "Consulta tus trabajos y sube entregas",
            icon: ClipboardList,
            path: "/alumno/materias",
        },
        {
            title: "Mi Perfil",
            subtitle: "Modifica tus datos y contraseña",
            icon: User,
            path: "/perfil",
        }
    ];

    return (
        <div className="w-full text-left select-none space-y-8">

            {/* SECCIÓN 1: Información General (Expediente del Alumno) */}
            <div className="bg-[#f8fafc] rounded-2xl p-6 md:p-10 border border-slate-200/60 select-none shadow-sm shadow-slate-100/50">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-5 pb-6 border-b border-slate-100">
                        <div className="text-left space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Expediente del Alumno</span>
                            <h2 className="text-lg md:text-xl font-black text-slate-800 leading-tight tracking-tight">Rendimiento Académico y Datos Escolares</h2>
                            <p className="text-sm font-bold text-blue-500/70">{studentInfo.email}</p>
                        </div>

                        <div className="hidden lg:flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Institución</span>
                            <img src="/assets/phid_logo.webp" alt="Prepa Hidalgo" className="h-8 w-auto grayscale opacity-60" />
                        </div>
                    </div>

                    {/* Perfil Header: Grid de datos detallados (Fila 1) */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-2">
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Matrícula</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight">{studentInfo.matricula}</h3>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Nombre(s)</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight">{displayFirstName}</h3>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Apellido Paterno</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight">{displayPaternal}</h3>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Apellido Materno</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight">{displayMaternal}</h3>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Ciclo Escolar</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight truncate">{studentInfo.ciclo}</h3>
                        </div>
                    </div>

                    {/* Perfil Header: Grid de datos detallados (Fila 2) */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-4 border-t border-slate-50">
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Semestre / Grupo</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight">{studentInfo.groupName}</h3>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Especialidad</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight truncate" title={studentInfo.specialty || "General"}>
                                {studentInfo.specialty || "Técnico en Informática"}
                            </h3>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Tutor de Grupo</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight truncate">{studentInfo.tutor}</h3>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Promedio Gral.</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight">{studentInfo.gpa}</h3>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block">Materias Inscritas</span>
                            <h3 className="text-[14px] font-extrabold text-slate-800 leading-tight">{studentInfo.subjectsCount || 0} materias</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: Mis Materias e Información de Parciales (Estilo Docente unificado) */}
            <Deferred data="kardex" fallback={
                <DotsLoader
                    label="Calculando rendimiento académico"
                    sublabel="Sincronizando tus promedios actuales..."
                />
            }>
                <div className="space-y-6">
                    <div className="space-y-1 text-left px-2">
                        <h3 className="text-[11px] font-normal uppercase text-slate-400 tracking-[0.2em] mb-1">Tu Carga Académica</h3>
                        <h2 className="text-lg md:text-xl font-medium text-slate-800 tracking-tight leading-snug">Mis Materias e Información de Parciales</h2>
                        <p className="text-xs md:text-[13px] text-slate-500 font-normal leading-relaxed max-w-2xl mt-1.5">
                            Consulta el desglose de tus calificaciones por parcial y el promedio general de tus materias inscritas en tiempo real.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {kardex && kardex.length > 0 ? kardex.map((item) => {
                            const themeKey = item.color_tema || 'blue';
                            const colors = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/alumno/materias?id=${item.uuid}`}
                                    prefetch="hover"
                                    className={cn(
                                        "group flex flex-col p-5 bg-white border transition-all duration-200 rounded-2xl shadow-none cursor-pointer",
                                        colors.borderHover,
                                        colors.bgSoft
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="min-w-0 text-left">
                                            <h4 className={cn(
                                                "text-sm font-medium text-slate-900 truncate leading-tight transition-colors group-hover:text-blue-600",
                                                colors.text
                                            )}>
                                                {item.subject}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">
                                                    {item.teacher}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[10px] font-normal uppercase tracking-wider px-2 py-1 rounded-lg",
                                                colors.badgeBg,
                                                colors.text
                                            )}>
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
                                        <div
                                            className={cn(
                                                "flex items-center gap-1 text-[10px] font-normal uppercase tracking-widest transition-colors",
                                                colors.text,
                                                `hover:${colors.textDark}`
                                            )}
                                        >
                                            Ver Detalle completo
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        }) : (
                            <div className="md:col-span-2 p-12 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                                <p className="text-sm text-slate-400 font-normal">No tienes materias inscritas actualmente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Deferred>

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
                        <Link
                            key={idx}
                            href={item.path}
                            prefetch="hover"
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
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}

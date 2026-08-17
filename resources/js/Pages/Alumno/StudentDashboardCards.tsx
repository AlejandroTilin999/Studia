import React from 'react';
import { ClipboardList, User, ChevronRight } from 'lucide-react';
import { Deferred, Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import StudentKardexSkeleton from './StudentKardexSkeleton';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import ImageWithSkeleton from '@/Components/ui/ImageWithSkeleton';

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
    kardex?: any[];
    alumnoGroups?: any[];
}

export default function StudentDashboardCards({
    studentInfo,
    kardex = [],
    alumnoGroups: propAlumnoGroups,
}: StudentDashboardCardsProps) {
    const { alumnoGroups: pageAlumnoGroups } = usePage().props as any;
    const alumnoGroups = propAlumnoGroups || pageAlumnoGroups || [];

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
            <div className="bg-slate-50 rounded-xl p-6 md:p-8 border border-slate-200/80 select-none transition-all duration-300 hover:shadow-xs text-left">
                <div className="max-w-7xl mx-auto space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-5 pb-5 border-b border-slate-200/50">
                        <div className="text-left space-y-1.5">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Expediente del Alumno</span>
                            <h2 className="text-xl font-medium text-slate-800 leading-none tracking-tight">Rendimiento Académico y Datos Escolares</h2>
                            <p className="text-xs text-slate-500 font-semibold">{studentInfo.email}</p>
                        </div>

                        <div className="hidden lg:flex flex-col items-end text-right gap-1 shrink-0 ml-auto">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-right">Institución</span>
                            <ImageWithSkeleton
                                src="/assets/phid_logo.webp"
                                alt="Prepa Hidalgo"
                                containerClassName="h-7 w-36"
                                className="h-full w-full object-contain object-right grayscale opacity-70"
                            />
                        </div>
                    </div>

                    {/* Perfil Header: Grid de 10 datos unificados (2 columnas en móvil / 5 en desktop) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 pt-1 text-left">
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Matrícula</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate">{studentInfo.matricula}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Nombre(s)</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate">{displayFirstName}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Apellido Paterno</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate">{displayPaternal}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Apellido Materno</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate">{displayMaternal}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Ciclo Escolar</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate" title={studentInfo.ciclo}>{studentInfo.ciclo}</h3>
                        </div>

                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Semestre / Grupo</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate">{studentInfo.groupName}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Especialidad</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate" title={studentInfo.specialty || "General"}>
                                {studentInfo.specialty || "Técnico en Informática"}
                            </h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Tutor de Grupo</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate" title={studentInfo.tutor}>{studentInfo.tutor}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Promedio Gral.</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate">{studentInfo.gpa}</h3>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Materias Inscritas</span>
                            <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1 truncate">
                                {studentInfo.subjectsCount ? `${studentInfo.subjectsCount} materias` : '8 materias'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: Mis Materias e Información de Parciales (Estilo Docente unificado) */}
            <Deferred data="kardex" fallback={
                <StudentKardexSkeleton
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
                            const matchingGroup = (alumnoGroups || []).find((g: any) =>
                                g.id?.toString() === item.id?.toString() ||
                                g.uuid?.toString() === item.uuid?.toString() ||
                                (g.nombre || '').trim().toLowerCase() === (item.subject || '').trim().toLowerCase()
                            );

                            const themeKey = item.color_tema || matchingGroup?.color_tema || 'blue';
                            const colors = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;
                            // La ruta del aula espera el UUID de la carga, no su ID interno.
                            // El kardex trae ambos valores; se prioriza siempre el UUID.
                            const subjectTargetId = matchingGroup?.id || item.uuid;

                            if (!subjectTargetId) return null;

                            return (
                                <Link
                                    key={item.id || item.uuid || item.subject}
                                    href={`/alumno/materias/${subjectTargetId}`}
                                    preserveScroll
                                    preserveState={false}
                                    prefetch="hover"
                                    cacheFor={120000}
                                    style={{
                                        backgroundColor: colors.bgHex || '#e8f0fe',
                                        borderColor: `${colors.strokeColor}40`
                                    }}
                                    className="group relative flex flex-col p-6 border transition-all duration-300 rounded-xl shadow-2xs hover:shadow-md cursor-pointer overflow-hidden text-left"
                                >
                                    <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 text-left space-y-1">
                                                <h4 className={cn("text-base sm:text-lg font-extrabold truncate leading-tight transition-colors", colors.text)}>
                                                    {item.subject}
                                                </h4>
                                                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                                                    {item.teacher}
                                                </p>
                                            </div>

                                            <div className="shrink-0">
                                                <span
                                                    style={{
                                                        backgroundColor: `${colors.strokeColor}20`,
                                                        color: colors.textHex,
                                                        borderColor: `${colors.strokeColor}40`
                                                    }}
                                                    className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border"
                                                >
                                                    PROM: {item.score}
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            style={{ borderColor: `${colors.strokeColor}30` }}
                                            className="grid grid-cols-3 gap-2.5 pt-4 border-t"
                                        >
                                            {[1, 2, 3].map((p) => {
                                                const pData = item.details?.[p];
                                                const avg = pData?.average ?? '—';
                                                return (
                                                    <div key={p} className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-white/85 backdrop-blur-xs border border-white/60 group-hover:bg-white transition-all text-center">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Parcial {p}</span>
                                                        <span className={cn(
                                                            "text-xs font-black tracking-tight",
                                                            avg === '—' ? "text-slate-400" : "text-slate-900"
                                                        )}>
                                                            {avg}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex justify-end pt-1">
                                            <div className={cn("flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider transition-colors", colors.text)}>
                                                <span>Ver detalle completo</span>
                                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
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

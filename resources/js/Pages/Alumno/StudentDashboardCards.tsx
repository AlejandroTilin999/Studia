import React from 'react';
import { ClipboardList, BookOpen, FileText, User } from 'lucide-react';
import { router } from '@inertiajs/react';

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
}

interface StudentDashboardCardsProps {
    studentInfo: StudentInfo;
    taskList: Task[];
    onOpenTaskModal: (task: Task) => void;
    onViewAllTasks?: () => void;
}

export default function StudentDashboardCards({
    studentInfo,
    taskList,
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
            path: "/alumno/tareas",
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
        <div className="w-full text-left select-none space-y-6">

            {/* CARD 1: Información General & Rendimiento Académico */}
            <div className="bg-white rounded-none md:rounded-2xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100/80 space-y-6">
                <div className="space-y-3">
                    <img src="/assets/phid_logo.png" alt="Prepa Hidalgo" className="h-9 w-auto object-contain" />
                    <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Expediente Alumno</h3>
                        <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-snug">Rendimiento Académico y Datos Escolares</h2>
                        <p className="text-xs md:text-[13px] text-slate-500 font-semibold leading-relaxed max-w-2xl mt-1.5">
                            Consulta en tiempo real el estado general de tu promedio, información de tu tutor asignado y ciclo escolar actual.
                        </p>
                    </div>
                </div>

                {/* 3. Horizontal Light Gray Banner - fully contained, responsive and max-width bounded */}
                <div className="bg-slate-50 rounded-xl p-5 md:p-6 border border-slate-100 select-none">
                    <div className="max-w-7xl mx-auto space-y-4">

                        {/* Top Profile Header: Grid of 5 items matching the bottom stats row (Symmetrical layout) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 pb-4 border-b border-slate-200/50">
                            <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Matrícula</span>
                                <h3 className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{studentInfo.matricula}</h3>
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Nombre(s)</span>
                                <h3 className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{firstName}</h3>
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Apellido Paterno</span>
                                <h3 className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{lastNamePaternal}</h3>
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Apellido Materno</span>
                                <h3 className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{lastNameMaternal}</h3>
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Correo Electrónico</span>
                                <h3 className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate" title={studentInfo.email}>{studentInfo.email}</h3>
                            </div>
                        </div>

                        {/* Bottom Stats Grid: 5 columns aligned on large screens, wraps cleanly on smaller devices */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 text-left">

                            {/* Col 1: Promedio */}
                            <div className="space-y-1 min-w-0">
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Promedio</span>
                                <span className="text-base font-bold text-slate-800 block leading-none mt-0.5">{studentInfo.gpa}</span>
                            </div>

                            {/* Col 2: Semestre / Grupo */}
                            <div className="space-y-1 min-w-0">
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Semestre / Grupo</span>
                                <span className="text-xs font-bold text-slate-800 block leading-tight mt-0.5 truncate">{studentInfo.groupName}</span>
                            </div>

                            {/* Col 3: Especialidad */}
                            <div className="space-y-1 min-w-0">
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Especialidad</span>
                                <span className="text-xs font-bold text-slate-800 block leading-tight mt-0.5 truncate" title="Técnico en Informática">Técnico en Informática</span>
                            </div>

                            {/* Col 4: Tutor de Grupo */}
                            <div className="space-y-1 min-w-0">
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Tutor de Grupo</span>
                                <span className="text-xs font-bold text-slate-800 block leading-tight mt-0.5 truncate" title={studentInfo.tutor}>{studentInfo.tutor}</span>
                            </div>

                            {/* Col 5: Ciclo Escolar */}
                            <div className="space-y-1 min-w-0">
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Ciclo Escolar</span>
                                <div className="leading-tight mt-0.5">
                                    <span className="text-xs font-bold text-slate-800 block truncate">{studentInfo.ciclo}</span>
                                    <span className="text-slate-450 font-semibold text-[8px] block mt-0.5">{studentInfo.periodo}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* CARD 2: Accesos Rápidos & Wizard Stepper */}
            <div className="bg-white rounded-none md:rounded-2xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100/80 space-y-6">
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

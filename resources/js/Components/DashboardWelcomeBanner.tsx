import * as React from 'react';
import { Calendar } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';

interface DashboardWelcomeBannerProps {
    greeting: string;
    title?: string;
    subtitle?: string;
    imageSrc?: string; // Kept for compatibility
    imageAlt?: string; // Kept for compatibility
    showCircle?: boolean; // Kept for compatibility
    wrapperClassName?: string;
}

export default function DashboardWelcomeBanner({
    greeting,
    title = "Bienvenido al",
    subtitle,
    wrapperClassName = "pt-0 pb-6 md:pb-10"
}: DashboardWelcomeBannerProps) {
    const { url } = usePage();

    // Resolve role based on path
    let role = 'ADMIN';
    if (url.startsWith('/docente')) {
        role = 'DOCENTE';
    } else if (url.startsWith('/alumno')) {
        role = 'ALUMNO';
    }

    const imageSrc = role === 'ADMIN'
        ? '/assets/admin-dashboard.png'
        : role === 'DOCENTE'
            ? '/assets/docente-dashboard.png'
            : '/assets/persona-dashboard.webp';

    const currentDate = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

    const handleButtonClick = () => {
        if (role === 'ADMIN') {
            router.visit('/admin/reportes');
        } else if (role === 'DOCENTE') {
            router.visit('/docente');
        } else {
            router.visit('/alumno/calificaciones');
        }
    };

    const getButtonText = () => {
        if (role === 'ADMIN') return 'Generar reportes';
        if (role === 'DOCENTE') return 'Ver mis clases';
        return 'Ver mis materias';
    };

    const getRoleDescription = () => {
        if (role === 'ADMIN') {
            return "Administra expedientes de alumnos, gestiona profesores, planifica materias y configura los periodos académicos de forma centralizada.";
        }
        if (role === 'DOCENTE') {
            return "Consulta tus grupos asignados, registra calificaciones, evalúa el desempeño de tus alumnos y mantén el control escolar al día.";
        }
        return "Consulta tus calificaciones en tiempo real, descarga tus kardex oficiales y mantente al día con tus tareas escolares asignadas.";
    };

    return (
        <div className={`relative w-full ${wrapperClassName}`}>
            {/* Main Card Container */}
            <div className="relative w-full overflow-hidden bg-[#e8f0fe] rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12 lg:p-14 shadow-sm border border-blue-100 select-none">

                {/* --- DECORACIONES GEOMÉTRICAS (Abstract background elements) --- */}
                <div className="absolute left-0 top-0 bottom-0 w-48 overflow-hidden pointer-events-none select-none z-0">
                    {/* Wavy line */}
                    <svg className="absolute -left-6 top-1 w-44 h-48 opacity-25" viewBox="0 0 120 140" fill="none">
                        <path d="M10 10 Q50 60 20 100 T100 120" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>

                    {/* Green Triangle */}
                    <div className="absolute left-10 top-4 w-14 h-14 bg-[#4db6ac] rotate-12 opacity-30" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>

                    {/* Purple Rectangle */}
                    <div className="absolute -left-8 top-12 w-24 h-12 bg-[#ab47bc] rotate-45 opacity-20 rounded-md"></div>

                    {/* Blue Circle */}
                    <div className="absolute left-8 top-28 w-12 h-12 bg-[#1e88e5] rounded-full opacity-40"></div>

                    {/* Orange Square */}
                    <div className="absolute -left-6 top-40 w-12 h-12 bg-[#ffa726] rotate-12 opacity-35 rounded-md"></div>
                </div>

                {/* Faint Abstract Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e88e505_1px,transparent_1px),linear-gradient(to_bottom,#1e88e505_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0"></div>

                {/* --- CONTENT GRID --- */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

                    {/* Left Column: Text & Button */}
                    <div className="col-span-1 lg:col-span-8 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 relative z-10">
                        {/* Date Pill Badge */}
                        <div className="relative z-20 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-lg text-blue-700 select-none">
                            <Calendar size={13} className="text-blue-600" />
                            <span className="text-[10px] md:text-xs font-semibold tracking-wide uppercase">
                                {formattedDate}
                            </span>
                        </div>

                        <div className="space-y-2 w-full">
                            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-blue-600">
                                {greeting}
                            </p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-semibold text-[#0a0f1d] tracking-tight leading-tight">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-sm sm:text-base font-semibold text-blue-900 mt-1">
                                    {subtitle}
                                </p>
                            )}
                            <p className="text-xs sm:text-sm font-normal text-slate-500 max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl leading-relaxed pt-1 mx-auto lg:mx-0">
                                {getRoleDescription()}
                            </p>
                        </div>

                        {/* Actions Button */}
                        <button
                            onClick={handleButtonClick}
                            className="inline-flex items-center justify-center px-6 py-3 bg-[#0a0f1d] hover:bg-slate-900 text-white rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer"
                        >
                            {getButtonText()}
                        </button>
                    </div>

                    {/* Right Column: Image */}
                    <div className="col-span-1 lg:col-span-4 flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[340px] xl:max-w-[380px] h-40 sm:h-48 md:h-56 lg:h-[280px] xl:h-[320px] flex items-end justify-center">
                            <img
                                src={imageSrc}
                                alt="Personaje Dashboard"
                                draggable="false"
                                className="h-full w-auto object-contain pointer-events-none select-none"
                            />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

import { Link } from '@inertiajs/react';

const COLORS = {
    primary: "#0066CC",
    secondary: "#483D8B",
    accent: "#3CB371"
};

export default function Hero() {
    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between gap-12 select-none h-full items-stretch">
            {/* Lado izquierdo - Texto original y botones de acceso */}
            <div className="w-full lg:w-[60%] text-center lg:text-left space-y-4 lg:space-y-6 self-center py-4 lg:py-12 relative z-30">
                <p className="text-slate-500 font-black text-[10px] sm:text-sm lg:text-base uppercase tracking-[0.3em]">
                    Control Escolar PREPAHID
                </p>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-black text-slate-900 leading-[1.1] lg:leading-[1] tracking-tighter lg:w-[110%] relative z-20">
                    Todo lo que necesitas para gestionar tu <span className="whitespace-nowrap" style={{ color: COLORS.primary }}>vida académica</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-base md:text-lg lg:text-xl max-w-lg leading-relaxed mx-auto lg:mx-0 font-medium">
                    La plataforma educativa diseñada para que tus materias, calificaciones y tareas sean tan únicas como tú. Controla tu avance escolar al instante.
                </p>

                <div className="pt-6 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                    <Link
                        href="/login?role=student"
                        className="w-full sm:w-auto block"
                    >
                        <span className="inline-flex items-center justify-center text-white px-10 py-4 rounded-t-full rounded-bl-full rounded-br-none font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:opacity-90 hover:scale-105 bg-[#0066CC] w-full sm:w-auto border-2 border-transparent">
                            Acceso Alumnos
                        </span>
                    </Link>

                    <Link
                        href="/login?role=staff"
                        className="w-full sm:w-auto block"
                    >
                        <span className="inline-flex items-center justify-center text-slate-800 px-10 py-4 rounded-t-full rounded-bl-full rounded-br-none font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-slate-50 hover:scale-105 bg-white border-2 border-slate-100 w-full sm:w-auto">
                            Acceso Personal
                        </span>
                    </Link>
                </div>
            </div>

            {/* Espacio vacío en desktop para dejar ver el fondo azul de Welcome.tsx */}
            <div className="hidden lg:block lg:w-[40%] h-full"></div>
        </div>
    );
}

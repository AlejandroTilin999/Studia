import { Link, usePage } from '@inertiajs/react';

const COLORS = {
    primary: "#0066CC",
    secondary: "#483D8B",
    accent: "#3CB371"
};

export default function Hero() {
    const { auth } = usePage().props as any;
    const isLogged = !!auth.user;

    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between gap-12 select-none h-full items-stretch">
            {/* Lado izquierdo - Texto original y botones de acceso */}
            <div className="w-full lg:w-[55%] text-center lg:text-left space-y-4 lg:space-y-5 xl:space-y-6 self-center py-4 lg:py-6 xl:py-12 relative z-30">
                <p className="text-slate-500 font-black text-[10px] sm:text-sm lg:text-base uppercase tracking-[0.3em]">
                    Control Escolar PREPAHID
                </p>
                <h1 className="text-3xl sm:text-5xl lg:text-[2.8rem] xl:text-[3.5rem] 2xl:text-[4.5rem] font-black text-slate-900 leading-[1.1] lg:leading-[1.15] xl:leading-[1.1] tracking-tighter lg:w-full xl:w-[110%] relative z-20">
                    Todo lo que necesitas para gestionar tu <span className="whitespace-nowrap" style={{ color: COLORS.primary }}>vida académica</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-base md:text-lg lg:text-base xl:text-lg 2xl:text-xl max-w-lg leading-relaxed mx-auto lg:mx-0 font-medium">
                    La plataforma educativa diseñada para que tus materias, calificaciones y tareas sean tan únicas como tú. Controla tu avance escolar al instante.
                </p>

                <div className="pt-4 lg:pt-5 xl:pt-6 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                    {!isLogged ? (
                        <>
                            <Link
                                href="/login?acceso=alumno"
                                className="w-full sm:w-auto block"
                            >
                                <span className="inline-flex items-center justify-center text-white px-10 py-4 rounded-t-full rounded-bl-full rounded-br-none font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:opacity-90 hover:scale-105 bg-[#0066CC] w-full sm:w-auto border-2 border-transparent shadow-lg shadow-blue-200">
                                    Acceso Alumnos
                                </span>
                            </Link>

                            <Link
                                href="/login?acceso=institucional"
                                className="w-full sm:w-auto block"
                            >
                                <span className="inline-flex items-center justify-center text-slate-800 px-10 py-4 rounded-t-full rounded-bl-full rounded-br-none font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-slate-50 hover:scale-105 bg-white border-2 border-slate-100 w-full sm:w-auto shadow-sm">
                                    Acceso Institucional
                                </span>
                            </Link>
                        </>
                    ) : (
                        <Link
                            href={route('dashboard')}
                            className="w-full sm:w-auto block group"
                        >
                            <span className="inline-flex items-center justify-center text-white px-12 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.2em] transition-all bg-[#0266E0] hover:bg-blue-700 w-full sm:w-auto border-2 border-transparent shadow-xl shadow-blue-100 group-active:scale-95">
                                Ir a mi Panel de Control
                            </span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Espacio vacío en desktop para dejar ver el fondo azul de Welcome.tsx */}
            <div className="hidden lg:block lg:w-[45%] h-full"></div>
        </div>
    );
}

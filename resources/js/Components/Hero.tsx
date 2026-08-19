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
                <p className="text-slate-500 font-black text-[11px] sm:text-sm lg:text-base uppercase tracking-[0.3em]">
                    Control Escolar PREPAHID
                </p>
                <h1 
                    className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-[3.1rem] 2xl:text-[3.6rem] font-black text-slate-900 tracking-tight relative z-20 max-w-[320px] sm:max-w-none mx-auto lg:mx-0"
                    style={{ lineHeight: 1.22 }}
                >
                    Todo lo que necesitas para gestionar tu <span className="inline" style={{ color: COLORS.primary }}>vida académica</span>
                </h1>
                <p className="text-slate-500 text-sm sm:text-base lg:text-lg xl:text-xl max-w-[340px] sm:max-w-xl leading-relaxed mx-auto lg:mx-0 font-medium">
                    La plataforma educativa diseñada para que tus materias, calificaciones y tareas sean tan únicas como tú. Controla tu avance escolar al instante.
                </p>

                <div className="pt-4 lg:pt-5 xl:pt-6 flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
                    {!isLogged ? (
                        <>
                            <Link
                                href="/login?acceso=alumno"
                                className="w-full sm:w-auto block"
                            >
                                <span className="inline-flex items-center justify-center text-white px-6 sm:px-8 xl:px-10 py-4 rounded-t-full rounded-bl-full rounded-br-none font-black text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-all hover:bg-[#0152b5] active:scale-95 bg-[#0266E0] w-full sm:w-auto border-2 border-transparent shadow-none">
                                    Acceso Alumnos
                                </span>
                            </Link>

                            <Link
                                href="/login?acceso=institucional"
                                className="w-full sm:w-auto block"
                            >
                                <span className="inline-flex items-center justify-center text-slate-700 px-6 sm:px-8 xl:px-10 py-4 rounded-t-full rounded-bl-full rounded-br-none font-black text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-95 bg-white border-2 border-slate-300 w-full sm:w-auto shadow-none">
                                    Acceso Institucional
                                </span>
                            </Link>
                        </>
                    ) : (
                        <Link
                            href={route('dashboard')}
                            className="w-full sm:w-auto block group"
                        >
                            <span className="inline-flex items-center justify-center text-white px-12 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.2em] transition-all bg-[#0266E0] hover:bg-blue-700 w-full sm:w-auto border-2 border-transparent shadow-none group-active:scale-95">
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

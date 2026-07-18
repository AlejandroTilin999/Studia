import { Link } from '@inertiajs/react';
import Button from '@/Components/ui/button';

const COLORS = {
    primary: "#0066CC",
    secondary: "#483D8B",
    accent: "#3CB371"
};

export default function Hero() {
    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between gap-12 select-none h-full items-stretch">
            {/* Lado izquierdo - Texto original y botón */}
            <div className="w-full lg:w-[50%] text-center lg:text-left space-y-6 self-center py-8 lg:py-12 relative z-30">
                <p className="text-slate-500 font-semibold text-base sm:text-lg lg:text-xl uppercase tracking-wider">
                    Control Escolar PREPAHID
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.15rem] font-extrabold text-slate-900 leading-tight tracking-tight lg:w-[125%] relative z-20">
                    Todo lo que necesitas para gestionar tu <span className="whitespace-nowrap" style={{ color: COLORS.primary }}>vida académica</span>
                </h1>
                <p className="text-slate-500 text-sm sm:text-base md:text-lg lg:text-xl max-w-lg leading-relaxed mx-auto lg:mx-0">
                    La plataforma educativa diseñada para que tus materias, calificaciones y tareas sean tan únicas como tú. Controla tu avance escolar al instante y mantén al día tus entregables.
                </p>
                
                <div className="pt-2 flex justify-center lg:justify-start">
                    <Link href={route('login')} className="w-full sm:w-auto block text-center">
                        <span className="inline-block text-white px-10 py-3.5 rounded-t-full rounded-bl-full rounded-br-none font-medium transition-all hover:opacity-90 hover:scale-105 bg-[#0066CC] shadow-lg shadow-blue-500/20 w-full sm:w-auto">
                            Inicia sesión en PREPAHID
                        </span>
                    </Link>
                </div>
            </div>

            {/* Lado derecho - Estudiante con widgets de información estáticos */}
            <div className="w-full lg:w-[50%] flex items-end justify-center lg:justify-end self-end h-full relative">
                {/* Contenedor con escala e idéntica proporción a la imagen para anclar widgets */}
                <div className="relative inline-flex items-end justify-center w-full max-w-xs sm:max-w-md lg:max-w-xl xl:max-w-[48rem]">
                    {/* Widget A: Información del Alumno */}
                    <div className="absolute top-[18%] -right-2 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200/50 select-none hidden sm:block">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portal Activo</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1">Sesión: Alumno PREPAHID</p>
                    </div>

                    {/* Widget B: Materias */}
                    <div className="absolute bottom-[20%] -right-12 z-20 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200/50 select-none w-48 hidden lg:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gestiona tus materias</p>
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-400 line-through">
                                <span>✓ Álgebra</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                <span>Química</span>
                            </div>
                        </div>
                    </div>

                    {/* Widget C: Promedio (justo al lado donde apunta el dedo, sin encimarse) */}
                    <div className="absolute top-[38%] -left-12 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200/50 select-none hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promedio General</p>
                        <h4 className="text-sm font-bold text-slate-800 mt-0.5">Calificación: 10.0</h4>
                    </div>

                    <img 
                        src="/assets/hero-img.png" 
                        alt="Estudiante" 
                        className="w-full max-h-[350px] sm:max-h-[460px] lg:max-h-[600px] xl:max-h-[760px] object-contain pointer-events-none block translate-y-1 lg:translate-y-2 relative z-10" 
                    />
                </div>
            </div>
        </div>
    );
}

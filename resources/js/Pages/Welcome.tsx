import Navbar from '@/Components/Navbar';
import Hero from '@/Components/Hero';

export default function Welcome() {
    return (
        <div className="relative min-h-screen lg:h-screen flex flex-col justify-between overflow-x-hidden lg:overflow-hidden bg-[#e2e7ff] select-none">
            {/* Contenedor de fondos recortados (evita desbordamientos y scroll extra en móvil) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* 1. Gran onda blanca desde la izquierda */}
                <div 
                    className="absolute -top-[10%] -left-[25%] w-[95%] h-[130%] bg-white" 
                    style={{ borderRadius: "45% 55% 40% 60% / 45% 50% 50% 55%" }}
                />
                {/* 2. Onda perla en la esquina superior derecha */}
                <div 
                    className="absolute -top-[30%] -right-[15%] w-[60%] h-[100%] bg-white/50" 
                    style={{ borderRadius: "50%" }}
                />
                {/* 3. Onda periwinkle profunda al fondo a la derecha */}
                <div 
                    className="absolute -bottom-[10%] -right-[5%] lg:-bottom-[30%] lg:-right-[10%] w-[90%] lg:w-[75%] h-[55%] lg:h-[110%] bg-[#cbd2ff]" 
                    style={{ borderRadius: "50% 50% 40% 60% / 40% 55% 45% 60%" }}
                />
            </div>

            {/* Navbar */}
            <Navbar />

            {/* Hero content area (se auto-ajusta para evitar scroll en desktop) */}
            <div className="flex-1 flex items-stretch relative z-10 overflow-hidden pt-6">
                <Hero />
            </div>

            {/* Footer desarrollado por Studia */}
            <footer className="w-full bg-white/40 backdrop-blur-sm py-4 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between border-t border-white/20 text-xs text-slate-500 relative z-20 gap-3">
                <div className="flex items-center gap-2 font-semibold text-slate-600">
                    <span>Desarrollado por</span>
                    <img src="/assets/studia-logo.png" alt="Studia Logo" className="w-[55px] h-auto object-contain" />
                </div>
                <span className="font-semibold text-slate-500">© 2026 PREPAHID. Todos los derechos reservados.</span>
            </footer>
        </div>
    );
}
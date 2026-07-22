import Hero from '@/Components/Hero';
import { Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="relative min-h-screen lg:h-screen flex flex-col justify-between overflow-x-hidden lg:overflow-hidden bg-white select-none">
            {/* Contenedor de Fondos Orgánicos (IDÉNTICO A LOGIN) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* SECCIÓN VISUAL (Header en móvil, lateral en desktop) */}
                <div className="absolute top-0 right-0 w-full lg:w-[45%] h-[340px] sm:h-80 lg:h-screen bg-[#0266E0] z-0">
                    {/* Imagen de la chica */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src="/assets/hero-img.png"
                            alt="Welcome Visual"
                            className="absolute bottom-0 left-0 w-full h-[95%] lg:h-full object-contain lg:object-cover object-bottom lg:scale-95 origin-bottom opacity-100 brightness-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0266E0]/40 lg:hidden"></div>
                    </div>

                    {/* La Gran Onda Divisoria Responsive */}
                    <div className="absolute bottom-[-4px] lg:bottom-0 left-0 w-full h-16 lg:top-0 lg:left-0 lg:h-full lg:w-24 z-10">
                        {/* Onda para Escritorio */}
                        <svg
                            className="hidden lg:block h-full w-full fill-white"
                            viewBox="0 0 100 1000"
                            preserveAspectRatio="none"
                        >
                            <path 
                                d="M0 0 C 40 150, 80 250, 40 400 C 0 550, 80 750, 40 850 C 20 950, 0 1000, 0 1000 L 0 1000 L 0 0 Z" 
                                stroke="white"
                                strokeWidth="3"
                            />
                        </svg>

                        {/* Onda para Móvil */}
                        <svg
                            className="block lg:hidden w-full h-full fill-white"
                            viewBox="0 0 1000 100"
                            preserveAspectRatio="none"
                        >
                            <path 
                                d="M0 100 C 150 60, 250 20, 400 60 C 550 100, 750 20, 850 60 C 950 80, 1000 100, 1000 100 L 1000 100 L 0 100 Z" 
                                stroke="white"
                                strokeWidth="3"
                            />
                        </svg>
                    </div>

                    {/* Logotipo Minimalista en la esquina */}
                    <div className="absolute top-4 left-6 lg:bottom-6 lg:right-12 lg:top-auto lg:left-auto z-20 opacity-80 lg:opacity-40">
                        <img src="/assets/logo-ph-blanco.png" alt="Logo PH" className="h-6 lg:h-12 w-auto brightness-200" />
                    </div>
                </div>
            </div>

            {/* Header del Logo (Alineado con el contenido y con separación) */}
            <header className="w-full relative z-30 hidden md:block">
                <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 lg:pt-14 pb-4">
                    <Link href="/">
                        <img src="/assets/phid_logo.png" className="w-40 sm:w-52 md:w-64 h-auto object-contain" alt="Logo"/>
                    </Link>
                </div>
            </header>

            {/* Hero content area (se auto-ajusta para evitar scroll en desktop) */}
            <div className="flex-1 flex items-stretch relative z-10 overflow-hidden pt-[320px] sm:pt-[340px] lg:pt-6">
                <Hero />
            </div>

            {/* Footer desarrollado por Studia - Alineado con el contenido del Hero */}
            <footer className="w-full relative z-20">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="w-full lg:w-[55%] py-4 xl:py-6 flex flex-col md:flex-row lg:flex-col xl:flex-row items-center justify-between text-[10px] text-slate-400 gap-4 lg:gap-2 xl:gap-4">
                        <span className="font-bold opacity-60 text-center lg:text-left">© 2026 PREPAHID. Todos los derechos reservados.</span>
                        <div className="flex flex-col gap-1 md:flex-row lg:flex-col xl:flex-row items-center md:gap-4 lg:gap-1 xl:gap-4 font-bold uppercase tracking-widest text-center">
                            <span>Soporte: 800-PREPAHID-12</span>
                            <span className="hidden md:inline lg:hidden xl:inline text-slate-200">|</span>
                            <div className="flex items-center gap-2">
                                <span>Desarrollado por</span>
                                <img src="/assets/studia-logo.png" alt="Studia Logo" className="w-[50px] h-auto object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

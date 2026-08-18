import Hero from '@/Components/Hero';
import { Link, Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="relative min-h-screen lg:h-screen flex flex-col justify-between overflow-x-hidden lg:overflow-hidden bg-white select-none">
            <Head title="Inicio" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-full lg:w-[45%] h-[410px] sm:h-[450px] lg:h-screen bg-[#0266E0] z-0">
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src="/assets/hero-img.webp"
                            alt="Welcome Visual"
                            loading="eager"
                            // @ts-ignore
                            fetchpriority="high"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 h-[100%] sm:h-[105%] lg:h-full scale-125 sm:scale-130 lg:scale-95 origin-bottom object-contain lg:object-cover object-bottom opacity-100 brightness-105 transition-all duration-500 lg:translate-x-[10px] translate-y-20 sm:translate-y-24 lg:translate-y-0"
                        />
                    </div>

                    <div className="absolute bottom-[-2px] lg:bottom-0 left-0 w-full h-32 sm:h-36 lg:top-0 lg:left-0 lg:h-full lg:w-24 z-10 pointer-events-none">
                        <svg className="hidden lg:block h-full w-full fill-white" viewBox="0 0 100 1000" preserveAspectRatio="none">
                            <path d="M0 0 C 40 150, 80 250, 40 400 C 0 550, 80 750, 40 850 C 20 950, 0 1000, 0 1000 L 0 1000 L 0 0 Z" stroke="white" strokeWidth="3" />
                        </svg>

                        <svg className="block lg:hidden w-full h-full fill-white" viewBox="0 0 1000 200" preserveAspectRatio="none">
                            <path d="M 0 200 L 0 110 C 120 70, 300 130, 500 120 C 780 120, 900 80, 1000 10 L 1000 200 Z" stroke="none" />
                        </svg>
                    </div>

                    <div className="absolute top-12 sm:top-14 left-6 lg:bottom-6 lg:right-12 lg:top-auto lg:left-auto z-20 opacity-90 lg:opacity-40">
                        <img src="/assets/logo-ph-blanco.webp" alt="Logo PH" className="h-7 lg:h-12 w-auto brightness-200" />
                    </div>
                </div>
            </div>

            <header className="w-full relative z-30 hidden md:block">
                <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 lg:pt-14 pb-4">
                    <Link href="/">
                        <img src="/assets/phid_logo.webp" className="w-40 sm:w-52 md:w-64 h-auto object-contain" alt="Logo" />
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-stretch relative z-10 overflow-hidden pt-[365px] sm:pt-[405px] lg:pt-6">
                <Hero />
            </main>

            <footer className="w-full relative z-20">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="w-full lg:w-[55%] py-4 xl:py-6 flex flex-col md:flex-row lg:flex-col xl:flex-row items-center justify-between text-[10px] text-slate-400 gap-4 lg:gap-2 xl:gap-4">
                        <span className="font-bold opacity-60 text-center lg:text-left">© 2026 PREPAHID. Todos los derechos reservados.</span>
                        <div className="flex flex-col gap-1 md:flex-row lg:flex-col xl:flex-row items-center md:gap-4 lg:gap-1 xl:gap-4 font-bold uppercase tracking-widest text-center">
                            <span>Soporte: 800-PREPAHID-12</span>
                            <span className="hidden md:inline lg:hidden xl:inline text-slate-200">|</span>
                            <div className="flex items-center gap-2">
                                <span>Desarrollado por</span>
                                <img src="/assets/studia-logo.webp" alt="Studia Logo" className="w-[50px] h-auto object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

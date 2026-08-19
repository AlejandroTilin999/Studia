import Hero from '@/Components/Hero';
import { Link, Head } from '@inertiajs/react';
import { SCHOOL_CONTACT } from '@/constants/SchoolContact';

export default function Welcome() {
    return (
        <div className="relative min-h-screen lg:h-screen flex flex-col justify-between overflow-x-hidden lg:overflow-hidden bg-white select-none">
            <Head title="Inicio" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-full lg:w-[45%] h-[320px] sm:h-[350px] lg:h-screen bg-[#0266E0] z-0">
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src="/assets/hero-img.webp"
                            alt="Welcome Visual"
                            loading="eager"
                            // @ts-ignore
                            fetchpriority="high"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 h-[100%] sm:h-[105%] lg:h-full scale-110 sm:scale-115 lg:scale-95 origin-bottom object-contain lg:object-cover object-bottom opacity-100 brightness-105 transition-all duration-500 lg:translate-x-[10px] translate-y-10 sm:translate-y-12 lg:translate-y-0"
                        />
                    </div>

                    <div className="absolute bottom-[-2px] lg:bottom-0 left-0 w-full h-24 sm:h-28 lg:top-0 lg:-left-[3px] lg:h-full lg:w-28 z-10 pointer-events-none">
                        <svg className="hidden lg:block h-full w-full fill-white" viewBox="0 0 100 1000" preserveAspectRatio="none">
                            <path d="M-5 0 C 40 150, 80 250, 40 400 C 0 550, 80 750, 40 850 C 20 950, -5 1000, -5 1000 L -5 1000 L -5 0 Z" stroke="white" strokeWidth="4" />
                        </svg>

                        <svg className="block lg:hidden w-full h-full fill-white" viewBox="0 0 1000 200" preserveAspectRatio="none">
                            <path d="M 0 200 L 0 110 C 120 70, 300 130, 500 120 C 780 120, 900 80, 1000 10 L 1000 200 Z" stroke="none" />
                        </svg>
                    </div>

                    <div className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:bottom-6 lg:right-12 lg:top-auto lg:left-auto z-20 opacity-90 lg:opacity-40">
                        <img src="/assets/logo-ph-blanco.webp" alt="Logo PH" className="h-7 sm:h-8 lg:h-12 w-auto brightness-200" />
                    </div>
                </div>
            </div>

            <header className="w-full relative z-30 hidden lg:block">
                <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 lg:pt-14 pb-4">
                    <Link href="/">
                        <img src="/assets/phid_logo.webp" className="w-40 sm:w-52 md:w-64 h-auto object-contain" alt="Logo" />
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-stretch relative z-10 overflow-hidden pt-[290px] sm:pt-[315px] lg:pt-6">
                <Hero />
            </main>

            <footer className="w-full relative z-20 border-t border-slate-100 lg:border-none bg-white/90 lg:bg-transparent backdrop-blur-xs">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="w-full lg:max-w-[480px] xl:max-w-[620px] py-3 sm:py-4 flex flex-col xl:flex-row items-center lg:items-start justify-start gap-2 xl:gap-2.5 text-xs font-semibold text-slate-600">
                        {/* Copyright */}
                        <span className="font-bold text-slate-600 text-[10.5px] sm:text-[11px] text-center lg:text-left whitespace-nowrap">
                            2026 <strong className="font-black text-slate-800">PREPAHID</strong>. Todos los derechos reservados.
                        </span>

                        {/* Soporte y Créditos */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[10.5px] sm:text-[11px] font-bold text-slate-700 whitespace-nowrap">
                            <a 
                                href={SCHOOL_CONTACT.mailtoLink}
                                className="px-2 py-0.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 font-extrabold text-[10px] sm:text-[10.5px] tracking-wide shadow-2xs transition-colors"
                                title="Enviar correo a soporte"
                            >
                                Soporte: {SCHOOL_CONTACT.email}
                            </a>

                            <div className="flex items-center gap-1 text-slate-600 font-bold uppercase tracking-wider text-[9.5px]">
                                <span>Desarrollado por</span>
                                <img 
                                    src="/assets/studia-logo.webp" 
                                    alt="Studia Logo" 
                                    className="w-[42px] h-auto object-contain opacity-95 hover:opacity-100 transition-opacity" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

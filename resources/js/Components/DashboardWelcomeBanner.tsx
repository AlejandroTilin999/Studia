import * as React from 'react';

interface DashboardWelcomeBannerProps {
    greeting: string;
    title?: string;
    subtitle?: string;
    imageSrc?: string;
    imageAlt?: string;
    showCircle?: boolean;
    wrapperClassName?: string;
}

export default function DashboardWelcomeBanner({
    greeting,
    title = "Bienvenido al",
    subtitle,
    imageSrc = "/assets/persona-dashboard.png",
    imageAlt = "Personaje Dashboard",
    showCircle = true,
    wrapperClassName = "pt-0 pb-6 md:pb-10"
}: DashboardWelcomeBannerProps) {
    return (
        <div className={`relative flex justify-center overflow-hidden md:overflow-visible ${wrapperClassName}`}>
            <div className="relative w-full max-w-5xl">
                <div className="min-h-[220px] md:h-72 bg-[#1e88e5] rounded-none md:rounded-3xl overflow-hidden relative flex items-center p-6 md:p-14 shadow-none select-none">
                    <div className="space-y-1.5 md:space-y-2 z-10 w-full md:w-auto pr-24 sm:pr-32 md:pr-0 text-white text-left">
                        <p className="text-xs sm:text-sm md:text-xl font-medium opacity-90">{greeting}</p>
                        <h2 className="text-3xl sm:text-4xl md:text-7xl font-black leading-tight tracking-tight">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-lg sm:text-xl md:text-3xl font-bold opacity-90 mt-1 md:mt-4 leading-tight">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {showCircle && (
                        <div className="absolute right-[-150px] md:right-[-250px] top-1/2 -translate-y-1/2 w-[380px] h-[380px] md:w-[650px] md:h-[650px] bg-[#8ecbff] rounded-full z-0 opacity-100"></div>
                    )}
                </div>
                <div className="absolute right-4 md:right-8 bottom-4 md:bottom-[-20px] top-4 md:top-[-40px] w-[100px] sm:w-[120px] md:w-[380px] flex items-end justify-center pointer-events-none z-20">
                    <img 
                        src={imageSrc} 
                        alt={imageAlt} 
                        className="h-full w-auto object-contain hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500"
                    />
                </div>
            </div>
        </div>
    );
}

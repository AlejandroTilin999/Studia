import * as React from "react";

interface PageHeaderBannerProps {
    title: string;
    subtitle: string;
    breadcrumb: string;
}

export default function PageHeaderBanner({
    title,
    subtitle,
    breadcrumb,
}: PageHeaderBannerProps) {
    return (
        <div className="bg-[#0266E0] text-white px-6 py-8 md:px-10 md:py-10 shadow-sm shrink-0 select-none">
            <div className="max-w-6xl">

                {/* Breadcrumb */}
                <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-blue-100 mb-2">
                    Inicio / {breadcrumb}
                </p>

                {/* Título */}
                <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                    {title}
                </h1>

                {/* Subtítulo */}
                <p className="mt-3 text-sm md:text-lg font-medium text-blue-100 max-w-3xl">
                    {subtitle}
                </p>

            </div>
        </div>
    );
}

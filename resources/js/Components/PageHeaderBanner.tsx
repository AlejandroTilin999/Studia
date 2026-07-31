import * as React from "react";
import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

interface PageHeaderBannerProps {
    title: string;
    subtitle: string;
    breadcrumb: string;
    backUrl?: string;
    backText?: string;
}

export default function PageHeaderBanner({
    title,
    subtitle,
    breadcrumb,
    backUrl,
    backText = "Regresar",
}: PageHeaderBannerProps) {
    return (
        <div className="bg-[#0266E0] text-white px-6 py-8 md:px-10 md:py-10 shadow-sm shrink-0 select-none">
            <div className="max-w-7xl mx-auto space-y-4">

                <div className="flex flex-col gap-1">
                    {backUrl && (
                        <Link
                            href={backUrl}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black text-white/70 hover:text-white uppercase tracking-[0.2em] transition-colors group mb-1"
                        >
                            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                            {backText}
                        </Link>
                    )}

                    {/* Breadcrumb */}
                    <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/60">
                        Inicio / {breadcrumb}
                    </p>
                </div>

                <div className="space-y-2">
                    {/* Título */}
                    <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                        {title}
                    </h1>

                    {/* Subtítulo */}
                    <p className="text-sm md:text-base font-medium text-blue-100/80 max-w-3xl leading-relaxed">
                        {subtitle}
                    </p>
                </div>

            </div>
        </div>
    );
}

import * as React from "react";
import { LucideIcon } from "lucide-react";

interface ReportDocCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    buttonText: string;
    buttonIcon: LucideIcon;
    onClick: () => void;
}

export default function ReportDocCard({
    title,
    description,
    icon: Icon,
    buttonText,
    buttonIcon: ButtonIcon,
    onClick
}: ReportDocCardProps) {
    return (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-all select-none">
            <div className="w-12 h-12 bg-[#ff8b00] text-white rounded-full flex items-center justify-center shrink-0">
                <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1 text-left">
                <span className="font-bold text-slate-800 text-[15px] block leading-tight">{title}</span>
                <span className="text-[11px] text-slate-400 font-medium block mt-1">{description}</span>
                <button 
                    onClick={onClick}
                    className="inline-flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold mt-3 transition-all"
                >
                    <ButtonIcon size={11} className="text-slate-400" />
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

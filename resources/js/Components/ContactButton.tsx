import { Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

interface ContactButtonProps {
    href: string;
    label: string;
    icon: LucideIcon;
    external?: boolean;
    isLink?: boolean;
}

export default function ContactButton({
    href,
    label,
    icon: Icon,
    external = false,
    isLink = false
}: ContactButtonProps) {
    const className = "bg-slate-50 border border-slate-200/50 hover:bg-slate-100 hover:border-slate-300 rounded-xl py-3.5 px-1.5 flex flex-col items-center justify-center text-center transition-all group shrink-0 w-full";

    const content = (
        <>
            <div className="p-1.5 bg-slate-200/50 text-slate-500 rounded-lg group-hover:bg-slate-200 transition-colors">
                <Icon size={16} />
            </div>
            <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 block mt-2 leading-tight uppercase tracking-wider select-none">
                {label}
            </span>
        </>
    );

    if (isLink) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <a 
            href={href} 
            className={className}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
            {content}
        </a>
    );
}

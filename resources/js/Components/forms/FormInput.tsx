import React from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ className, icon, type = 'text', ...props }, ref) => {
        return (
            <div className="relative w-full text-left font-body">
                {icon && (
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        "w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal h-11 transition-all focus:border-[#1e88e5] focus:ring-1 focus:ring-[#1e88e5] focus:outline-none shadow-none",
                        icon ? "pl-10 pr-4" : "px-4",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
FormInput.displayName = 'FormInput';

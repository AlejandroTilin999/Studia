import React from 'react';
import { cn } from '@/lib/utils';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative w-full text-left font-body">
                <select
                    ref={ref}
                    className={cn(
                        "w-full px-3.5 pr-10 bg-white border border-slate-200 hover:border-slate-350 rounded-lg text-xs font-medium text-slate-800 h-10 transition-all focus:border-[#1e88e5] focus:ring-1 focus:ring-[#1e88e5] focus:outline-none cursor-pointer shadow-none appearance-none bg-none",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                    <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        );
    }
);
FormSelect.displayName = 'FormSelect';

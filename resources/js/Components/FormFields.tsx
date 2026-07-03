import React from 'react';
import { cn } from '@/lib/utils';

export function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="text-xs font-bold text-slate-700 block text-left mb-1.5 select-none">
            {children} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
    );
}

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

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative w-full text-left font-body">
                <select
                    ref={ref}
                    className={cn(
                        "w-full px-4 pr-10 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-bold text-slate-800 h-11 transition-all focus:border-[#1e88e5] focus:ring-1 focus:ring-[#1e88e5] focus:outline-none cursor-pointer shadow-none appearance-none bg-none",
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

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal transition-all focus:border-[#1e88e5] focus:ring-1 focus:ring-[#1e88e5] focus:outline-none shadow-none",
                    className
                )}
                {...props}
            />
        );
    }
);
FormTextarea.displayName = 'FormTextarea';

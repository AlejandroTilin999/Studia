import React from 'react';

interface FormLabelProps {
    children: React.ReactNode;
    required?: boolean;
    className?: string;
}

export function FormLabel({ children, required, className = '' }: FormLabelProps) {
    return (
        <label className={`text-[10px] font-normal text-slate-400 uppercase tracking-wider block text-left mb-1.5 select-none whitespace-nowrap ${className}`}>
            {children} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
    );
}

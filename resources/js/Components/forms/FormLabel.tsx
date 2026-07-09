import React from 'react';

interface FormLabelProps {
    children: React.ReactNode;
    required?: boolean;
    className?: string;
}

export function FormLabel({ children, required, className = '' }: FormLabelProps) {
    return (
        <label className={`text-xs font-bold text-slate-700 block text-left mb-1.5 select-none ${className}`}>
            {children} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
    );
}

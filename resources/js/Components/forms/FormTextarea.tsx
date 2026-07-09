import React from 'react';
import { cn } from '@/lib/utils';

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

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MetricItem {
  code: string; // e.g. "T1"
  label: string; // e.g. "Alumnos totales"
  value: string | number | null; // e.g. "300"
}

interface QuickSummaryWidgetProps {
  title?: string;
  metrics: MetricItem[];
  isLoading?: boolean;
}

export default function QuickSummaryWidget({ title = "Resumen rápido", metrics, isLoading }: QuickSummaryWidgetProps) {
  return (
    <div className="space-y-3 text-left font-body">
      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none">{title}</h4>
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((item, index) => {
          const isLastOdd = metrics.length % 2 !== 0 && index === metrics.length - 1;

          // Si el valor es null o isLoading es true, mostramos el cargador
          const showSkeleton = isLoading || item.value === null;

          return (
            <div
              key={index}
              className={cn(
                "border border-slate-100 shadow-none rounded-xl bg-white group transition-all duration-200 cursor-default p-6 2xl:p-8 flex flex-col gap-1.5 text-left",
                isLastOdd ? "col-span-2" : "col-span-1",
                showSkeleton ? "bg-slate-50/50 border-dashed" : "hover:bg-blue-50/50 hover:border-blue-100"
              )}
            >
              <span className={cn(
                "text-[9px] md:text-[10px] 2xl:text-[11px] font-bold uppercase tracking-widest transition-colors",
                showSkeleton ? "text-slate-200" : "text-slate-300 group-hover:text-blue-300"
              )}>
                {item.code}
              </span>
              <p className={cn(
                "text-[10px] md:text-[11px] 2xl:text-[13px] font-bold uppercase leading-none mt-1 transition-colors truncate",
                showSkeleton ? "text-slate-300" : "text-slate-400 group-hover:text-slate-500"
              )}>
                {item.label}
              </p>

              {showSkeleton ? (
                <div className="mt-4 flex items-center gap-1.5 h-8">
                   <div className="w-1.5 h-1.5 bg-[#1e88e5] rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <div className="w-1.5 h-1.5 bg-[#1e88e5] rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <div className="w-1.5 h-1.5 bg-[#1e88e5] rounded-full animate-bounce" />
                </div>
              ) : (
                <p className="text-xl md:text-2xl 2xl:text-3xl font-black text-black mt-2 tracking-tight animate-in fade-in duration-500 transition-all">{item.value}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

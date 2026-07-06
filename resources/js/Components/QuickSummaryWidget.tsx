import * as React from "react";
import { cn } from "@/lib/utils";

export interface MetricItem {
  code: string; // e.g. "T1"
  label: string; // e.g. "Alumnos totales"
  value: string | number; // e.g. "300"
}

interface QuickSummaryWidgetProps {
  title?: string;
  metrics: MetricItem[];
}

export default function QuickSummaryWidget({ title = "Resumen rápido", metrics }: QuickSummaryWidgetProps) {
  return (
    <div className="space-y-3 text-left font-body">
      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none">{title}</h4>
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((item, index) => {
          const isLastOdd = metrics.length % 2 !== 0 && index === metrics.length - 1;
          return (
            <div 
              key={index} 
              className={cn(
                "border border-slate-100 shadow-none rounded-xl bg-white group hover:bg-blue-50/50 hover:border-blue-100 transition-all duration-200 cursor-default p-6 flex flex-col gap-1.5 text-left",
                isLastOdd ? "col-span-2" : "col-span-1"
              )}
            >
              <span className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-blue-300 transition-colors">{item.code}</span>
              <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase leading-none mt-1 group-hover:text-[#1e88e5] transition-colors truncate">{item.label}</p>
              <p className="text-xl md:text-2xl font-black text-slate-800 mt-2 tracking-tight">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

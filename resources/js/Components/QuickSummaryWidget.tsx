import * as React from "react";
import { cn } from "@/lib/utils";
import StudiaSkeleton from "@/Components/ui/StudiaSkeleton";

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

export default function QuickSummaryWidget({ title = "Resumen del Sistema", metrics, isLoading }: QuickSummaryWidgetProps) {
  return (
    <div className="space-y-3 text-left font-body">
      <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider select-none ml-1">{title}</h4>
      <div className="grid grid-cols-2 gap-2.5">
        {(metrics || []).map((item, index) => {
          const isLastOdd = metrics.length % 2 !== 0 && index === metrics.length - 1;

          // Si el valor es null, undefined o isLoading es true, mostramos el cargador
          const showSkeleton = isLoading || item.value === null || item.value === undefined;

          return (
            <div
              key={index}
              className={cn(
                "border border-slate-100 shadow-none rounded-xl bg-white group transition-all duration-200 cursor-default p-6 md:p-8 2xl:p-10 flex flex-col gap-1.5 text-left min-h-[140px] justify-center",
                isLastOdd ? "col-span-2" : "col-span-1",
                showSkeleton ? "bg-slate-50/30 border-dashed" : "hover:bg-blue-50/20 hover:border-blue-100"
              )}
            >
              <p className={cn(
                "text-[10px] 2xl:text-[11px] font-semibold uppercase leading-none transition-colors truncate tracking-wider",
                showSkeleton ? "text-slate-300" : "text-slate-600 group-hover:text-[#0266E0]"
              )}>
                {item.label}
              </p>

              {showSkeleton ? (
                <StudiaSkeleton className="mt-4 h-8 w-16 rounded-md" />
              ) : (
                <p className="text-2xl md:text-3xl font-semibold text-slate-900 mt-2 tracking-tight animate-in fade-in duration-500 transition-all">{item.value}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

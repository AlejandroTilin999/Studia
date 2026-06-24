import * as React from "react";

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
    <div className="space-y-4 text-left">
      <h4 className="font-bold text-slate-800 text-base">{title}</h4>
      <div className="space-y-3">
        {metrics.map((item, index) => {
          // If there is an odd number of items, render the first one full-width (stacked), and the rest in a grid of 2 columns
          const isFullWidth = metrics.length % 2 !== 0 && index === 0;
          
          if (isFullWidth) {
            return (
              <div 
                key={index} 
                className="border border-slate-100 shadow-none rounded-xl overflow-hidden bg-slate-50/50 p-4 flex flex-col gap-0.5"
              >
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.code}</span>
                <p className="text-[10px] font-black text-slate-500 uppercase leading-none">{item.label}</p>
                <p className="text-3xl font-black text-slate-800 mt-2 tracking-tight">{item.value}</p>
              </div>
            );
          }
        })}

        {/* Render grid of 2 columns for the remaining items (T3, T4, etc.) */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((item, index) => {
            const isFullWidth = metrics.length % 2 !== 0 && index === 0;
            if (!isFullWidth) {
              return (
                <div 
                  key={index} 
                  className="border border-slate-100 shadow-none rounded-xl overflow-hidden bg-slate-50/50 p-4 flex flex-col gap-0.5"
                >
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.code}</span>
                  <p className="text-[10px] font-black text-slate-500 uppercase leading-none">{item.label}</p>
                  <p className="text-2xl font-black text-slate-800 mt-2 tracking-tight">{item.value}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

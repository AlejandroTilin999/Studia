import * as React from "react";
import { cn } from "@/lib/utils";
import StudiaSkeleton from "@/Components/ui/StudiaSkeleton";

export interface ChartSegment {
  name: string;
  count: number;
  color: string;
  bulletClass: string;
}

interface DonutChartWidgetProps {
  title?: string;
  centerLabel: string;
  segments: ChartSegment[];
  centerValue?: string | number;
  hideLegend?: boolean;
  variant?: 'card' | 'plain';
  isLoading?: boolean;
}

export default function DonutChartWidget({
  title = "Estado de Matrícula",
  centerLabel,
  segments,
  centerValue,
  hideLegend = false,
  variant = 'card',
  isLoading = false
}: DonutChartWidgetProps) {
  const total = segments.reduce((acc, curr) => acc + curr.count, 0);
  const displayValue = centerValue !== undefined ? centerValue : total;

  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32

  let accumulatedPercent = 0;

  const chartAndLegend = (
    <div className="flex flex-col items-center w-full">
      {/* Donut chart SVG with text in center */}
      <div className="relative w-32 h-32 2xl:w-40 2xl:h-40 flex items-center justify-center mb-3 transition-all duration-500">
        <svg viewBox="0 0 100 100" className={cn("w-full h-full transform -rotate-90 select-none", isLoading && "animate-pulse opacity-50")}>
          {/* Base grey track circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="11"
          />
          {total > 0 && !isLoading ? (
            segments.map((segment, idx) => {
              const percentage = segment.count / total;
              const strokeLength = percentage * circumference;
              const strokeOffset = circumference - (accumulatedPercent * circumference);

              accumulatedPercent += percentage;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="11"
                  strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-500 ease-in-out"
                />
              );
            })
          ) : (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="11"
            />
          )}
        </svg>

        {/* Inner label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {isLoading ? (
            <StudiaSkeleton className="h-8 w-10 rounded-md" />
          ) : (
            <span className="text-3xl 2xl:text-[32px] font-black text-[#0266E0] leading-none transition-all">
              {displayValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[10px] 2xl:text-[12px] font-bold text-slate-400 uppercase tracking-wider mt-1 transition-all">
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Legend container - horizontal row wrap to save space */}
      {!hideLegend && (
        <div className="flex flex-row justify-center gap-x-4 gap-y-1.5 w-full flex-wrap">
          {segments.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-1.5 select-none shrink-0">
              <div className={`w-2.5 h-2.5 rounded-full ${segment.bulletClass} ${isLoading && "animate-pulse opacity-50"}`}></div>
              {isLoading ? (
                 <div className="h-3 w-16 bg-slate-50 animate-pulse rounded" />
              ) : (
                <span className="text-[10px] font-extrabold text-slate-550">
                  {segment.name} ({segment.count})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3 text-left w-full font-body">
      {title && <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none">{title}</h4>}
      {variant === 'card' ? (
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
          {chartAndLegend}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full">
          {chartAndLegend}
        </div>
      )}
    </div>
  );
}

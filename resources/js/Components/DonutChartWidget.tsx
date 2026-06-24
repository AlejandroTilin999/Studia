import * as React from "react";

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
}

export default function DonutChartWidget({ 
  title = "Estado de Matrícula", 
  centerLabel, 
  segments,
  centerValue,
  hideLegend = false,
  variant = 'card'
}: DonutChartWidgetProps) {
  const total = segments.reduce((acc, curr) => acc + curr.count, 0);
  const displayValue = centerValue !== undefined ? centerValue : total;

  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32

  let accumulatedPercent = 0;

  const chartAndLegend = (
    <>
      {/* Legend container */}
      {!hideLegend && (
        <div className="flex flex-col gap-2 w-full mb-5">
          {segments.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${segment.bulletClass}`}></div>
              <span className="text-xs font-bold text-slate-500">
                {segment.name} ({segment.count})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Donut chart SVG with text in center */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 select-none">
          {/* Base grey track circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="11"
          />
          {total > 0 ? (
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
          <span className="text-3xl font-black text-[#1e88e5] leading-none">
            {displayValue}
          </span>
          {centerLabel && (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              {centerLabel}
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4 text-left w-full">
      {title && <h4 className="font-bold text-slate-800 text-base">{title}</h4>}
      {variant === 'card' ? (
        <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center">
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

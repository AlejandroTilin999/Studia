import * as React from "react";
import { Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<any>;
}

interface QuickActionsWidgetProps {
  title?: string;
  actions: ActionItem[];
}

export default function QuickActionsWidget({ title = "Accesos rápidos", actions }: QuickActionsWidgetProps) {
  // Categorizar automáticamente
  const reportActions = actions.filter(a =>
    a.label.toLowerCase().includes('exportar') ||
    a.label.toLowerCase().includes('pdf') ||
    a.label.toLowerCase().includes('excel')
  );

  const navActions = actions.filter(a => !reportActions.includes(a));

  return (
    <div className="space-y-6 text-left font-body">
      {/* Sección 1: Utilidades de Exportación (Diseño Horizontal Minimalista) */}
      {reportActions.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.15em] select-none ml-1">
            Herramientas de Datos
          </h4>
          <div className="flex items-center gap-2">
            {reportActions.map((action, index) => {
              const Icon = action.icon || Plus;
              const isPdf = action.label.toLowerCase().includes('pdf');
              const shortLabel = isPdf ? "Documento PDF" : "Libro Excel";

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2.5 h-11 2xl:h-14 bg-white rounded-lg shadow-sm text-[11.5px] 2xl:text-[13px] font-black text-slate-600 transition-all border border-slate-100 active:scale-[0.97]",
                    isPdf
                      ? "hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30"
                      : "hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30"
                  )}
                >
                  <Icon className={cn("w-4 h-4 2xl:w-5 2xl:h-5 shrink-0", isPdf ? "text-rose-500" : "text-emerald-500")} />
                  <span className="hidden sm:inline">{shortLabel}</span>
                  <span className="sm:hidden">{isPdf ? "PDF" : "Excel"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección 2: Navegación Relacionada (Tipo Migas de Pan / Enlaces) */}
      {navActions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.15em] select-none ml-1">
            Navegación Relacionada
          </h4>
          <div className="flex flex-col border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            {navActions.map((action, index) => {
              const Icon = action.icon || Plus;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={cn(
                    "w-full h-12 2xl:h-16 px-4 2xl:px-6 gap-3 2xl:gap-5 text-[12.5px] 2xl:text-[14px] font-bold text-slate-600 hover:text-[#0266E0] hover:bg-blue-50/30 transition-all flex items-center text-left group",
                    index !== 0 && "border-t border-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4 2xl:w-5 2xl:h-5 shrink-0 text-slate-400 group-hover:text-[#0266E0] transition-colors" />
                  <span className="flex-1 truncate">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-slate-300 group-hover:text-[#0266E0] group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

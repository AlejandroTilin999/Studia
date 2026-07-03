import * as React from "react";
import { Plus } from "lucide-react";

export interface ActionItem {
  label: string;
  onClick: () => void;
}

interface QuickActionsWidgetProps {
  title?: string;
  actions: ActionItem[];
}

export default function QuickActionsWidget({ title = "Accesos rápidos", actions }: QuickActionsWidgetProps) {
  return (
    <div className="space-y-2.5 text-left font-body">
      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none">{title}</h4>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="w-full bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-10 rounded-xl justify-start px-4 gap-2.5 text-xs transition-all flex items-center shadow-none active:scale-[0.98] focus:outline-none"
          >
            <Plus className="w-3.5 h-3.5 shrink-0 stroke-[3]" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

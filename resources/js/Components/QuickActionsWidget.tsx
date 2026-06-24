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
    <div className="space-y-4 text-left">
      <h4 className="font-bold text-slate-800 text-base">{title}</h4>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="w-full bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 rounded-xl justify-start px-6 gap-3 text-xs transition-all flex items-center shadow-none active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

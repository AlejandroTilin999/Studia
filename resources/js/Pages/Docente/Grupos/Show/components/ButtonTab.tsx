import { ReactNode } from 'react';

type TabType = 'grades' | 'tasks' | 'activities';

interface ButtonTabProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    name: string;
    tab: TabType;
    icon: ReactNode;
}

export default function ButtonTab({
    activeTab,
    setActiveTab,
    name,
    tab,
    icon,
}: ButtonTabProps) {
    const isActive = activeTab === tab;

    return (
        <button
            onClick={() => setActiveTab(tab)}
            className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
                ${isActive
                    ? 'bg-slate-100 text-slate-800'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                }
            `}
        >
            <span className="shrink-0">
                {icon}
            </span>
            <span className="whitespace-nowrap">{name}</span>
        </button>
    );
}

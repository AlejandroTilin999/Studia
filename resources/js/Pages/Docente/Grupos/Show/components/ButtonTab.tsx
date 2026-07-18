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
    return (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px ${
                activeTab === tab
                    ? 'border-[#1e88e5] text-[#1e88e5]'
                    : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
        >
            {icon}
            <span>{name}</span>
        </button>
    );
}

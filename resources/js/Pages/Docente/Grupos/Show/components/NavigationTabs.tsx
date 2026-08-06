import { FileText, ClipboardList, Stamp } from 'lucide-react';
import ButtonTab from './ButtonTab';

interface NavigationTabsProps {
    activeTab: 'grades' | 'tasks' | 'activities';
    setActiveTab: (tab: 'grades' | 'tasks' | 'activities') => void;
}

export default function NavigationTabs({
    activeTab,
    setActiveTab,
}: NavigationTabsProps) {
    return (
        <div className="flex items-center gap-1.5 p-1 bg-transparent w-full mb-6 overflow-x-auto no-scrollbar scrollbar-none">
            <ButtonTab
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tab="activities"
                name="Actividades"
                icon={<FileText size={16} />}
            />

            <ButtonTab
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tab="tasks"
                name="Calificar"
                icon={<Stamp size={16} />}
            />

            <ButtonTab
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tab="grades"
                name="Registro"
                icon={<ClipboardList size={16} />}
            />
        </div>
    );
}

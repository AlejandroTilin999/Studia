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
        <div className="flex border-b border-slate-200 mb-6 w-full">
            <ButtonTab
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tab="activities"
                name="Crear y Ver Actividades"
                icon={<FileText size={14} />}
            />

            <ButtonTab
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tab="tasks"
                name="Calificar Actividades"
                icon={<Stamp size={14} />}
            />

            <ButtonTab
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tab="grades"
                name="Registro de Calificaciones"
                icon={<ClipboardList size={14} />}
            />
        </div>
    );
}

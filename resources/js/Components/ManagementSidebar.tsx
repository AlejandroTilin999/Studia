import QuickSummaryWidget from "@/Components/QuickSummaryWidget";
import QuickActionsWidget from "@/Components/QuickActionsWidget";
import DonutChartWidget from "@/Components/DonutChartWidget";

interface Metric {
    code: string;
    label: string;
    value: number;
}

interface Action {
    label: string;
    onClick: () => void;
}

interface Segment {
    name: string;
    count: number;
    color: string;
    bulletClass: string;
}

interface ManagementSidebarProps {
    metrics: Metric[];
    actions: Action[];
    chart: {
        title: string;
        centerLabel: string;
        segments: Segment[];
    };
}

export default function ManagementSidebar({
    metrics,
    actions,
    chart,
}: ManagementSidebarProps) {
    return (
        <aside className="w-full lg:w-[320px] bg-white border-l border-slate-100 p-6 space-y-8 shrink-0">

            <QuickSummaryWidget metrics={metrics} />

            <QuickActionsWidget actions={actions} />

            <DonutChartWidget
                title={chart.title}
                centerLabel={chart.centerLabel}
                segments={chart.segments}
            />

        </aside>
    );
}
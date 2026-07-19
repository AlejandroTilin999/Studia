import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Check } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import QuickActionsWidget from '@/Components/QuickActionsWidget';
import DonutChartWidget from '@/Components/DonutChartWidget';

interface MetricItem {
    code: string;
    label: string;
    value: string | number;
}

interface ActionItem {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<any>;
}

interface SegmentItem {
    name: string;
    count: number;
    color: string;
    bulletClass: string;
}

interface AdminPageLayoutProps {
    headTitle: string;
    title: string;
    subtitle: string;
    breadcrumb: string;
    toastMessage?: string | null;
    metrics: MetricItem[];
    quickActions: ActionItem[];
    donutChartTitle?: string;
    donutChartLabel?: string;
    donutChartSegments?: SegmentItem[];
    children: React.ReactNode;
    isLoading?: boolean;
}

export default function AdminPageLayout({
    headTitle,
    title,
    subtitle,
    breadcrumb,
    toastMessage,
    metrics,
    quickActions,
    donutChartTitle,
    donutChartLabel,
    donutChartSegments,
    children,
    isLoading = false,
}: AdminPageLayoutProps) {
    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (!mainEl) return;

        const originalOverflow = mainEl.style.overflow;
        const originalPadding = mainEl.style.padding;

        mainEl.style.padding = '0';

        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                mainEl.style.overflow = 'hidden';
            } else {
                mainEl.style.overflow = originalOverflow || 'auto';
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            mainEl.style.overflow = originalOverflow;
            mainEl.style.padding = originalPadding;
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title={headTitle} />

            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none animate-in fade-in slide-in-from-bottom-5 duration-200">
                    <div className="bg-emerald-500 p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Layout split container */}
            <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden font-body">

                {/* Left Side: Banner + Workspace */}
                <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-hidden">

                    {/* Header Banner */}
                    <PageHeaderBanner
                        title={title}
                        subtitle={subtitle}
                        breadcrumb={breadcrumb}
                    />

                    {/* Workspace panel container */}
                    <div className="p-3 md:p-6 flex-1 lg:overflow-y-auto flex flex-col lg:min-h-0">
                        <div className="bg-white rounded-2xl md:rounded-xl p-4 md:p-8 shadow-sm border border-slate-100 flex flex-col flex-1">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Right Side: Sidebar Widgets */}
                <div className="w-full lg:w-[330px] xl:w-[380px] 2xl:w-[420px] bg-white border-l border-slate-50 p-5 lg:p-6 xl:p-8 2xl:p-10 shrink-0 lg:h-full lg:overflow-y-auto lg:flex lg:flex-col lg:justify-between transition-all duration-500 ease-in-out">
                    <div className="space-y-8 xl:space-y-10 2xl:space-y-12">
                        <QuickSummaryWidget metrics={metrics} isLoading={isLoading} />
                        <QuickActionsWidget actions={quickActions} />
                    </div>

                    {donutChartSegments && donutChartLabel && (
                        <div className="pt-8 border-t border-slate-50 mt-auto">
                            <DonutChartWidget
                                title={donutChartTitle}
                                centerLabel={donutChartLabel}
                                segments={donutChartSegments}
                                isLoading={isLoading}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

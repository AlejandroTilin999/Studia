import { PropsWithChildren, ReactNode } from 'react';
import Sidebar, { SidebarProvider, useSidebar } from '@/Components/Sidebar';
import { PanelLeft } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';

interface AuthenticatedProps {
    header?: ReactNode;
    noPadding?: boolean;
}

function LayoutContent({
    header,
    noPadding = false,
    children,
}: PropsWithChildren<AuthenticatedProps>) {
    const { isMobile, setOpenMobile } = useSidebar();

    useRealtime();

    return (
        <div className="h-screen w-full flex bg-white overflow-hidden relative flex-col md:flex-row text-left">
            {isMobile && (
                <div className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        aria-label="Abrir menú de navegación"
                        onClick={() => setOpenMobile(true)}
                        className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <PanelLeft size={20} />
                    </button>

                    <div className="flex-1 flex justify-center pr-8">
                        <img src="/assets/phid_logo.webp" alt="Prepa Hidalgo" className="h-7 w-auto object-contain" loading="eager" decoding="sync" />
                    </div>
                </div>
            )}

            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                {header && (
                    <header className="bg-white border-b border-slate-100 shrink-0">
                        <div className="mx-auto max-w-7xl px-6 py-5">
                            {header}
                        </div>
                    </header>
                )}

                <main className={`relative flex-1 overflow-y-auto overflow-x-hidden bg-white ${noPadding ? 'p-0' : 'p-6 md:p-8'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function Authenticated(props: PropsWithChildren<AuthenticatedProps>) {
    return (
        <SidebarProvider>
            <LayoutContent {...props} />
        </SidebarProvider>
    );
}

export const getAuthenticatedLayout = (page: ReactNode) => <Authenticated>{page}</Authenticated>;
export const getAuthenticatedNoPaddingLayout = (page: ReactNode) => <Authenticated noPadding>{page}</Authenticated>;

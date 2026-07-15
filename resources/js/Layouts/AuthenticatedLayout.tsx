import { PropsWithChildren, ReactNode } from 'react';
import Sidebar, { SidebarProvider } from '@/Components/Sidebar';

interface AuthenticatedProps {
    header?: ReactNode;
    noPadding?: boolean;
}

function LayoutContent({
    header,
    noPadding = false,
    children,
}: PropsWithChildren<AuthenticatedProps>) {
    return (
        <div className="h-screen w-full flex bg-white overflow-hidden">
            {/* Sidebar (Alto total a la izquierda) */}
            <Sidebar />

            {/* Contenedor derecho */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                {/* Header (opcional) */}
                {header && (
                    <header className="bg-white border-b border-slate-100 shrink-0">
                        <div className="mx-auto max-w-7xl px-6 py-5">
                            {header}
                        </div>
                    </header>
                )}

                {/* Contenido principal */}
                <main className={`flex-1 overflow-y-auto bg-white ${noPadding ? 'p-0' : 'p-6 md:p-8'}`}>
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
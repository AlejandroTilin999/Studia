import { PropsWithChildren, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Sidebar, { SidebarProvider, useSidebar } from '@/Components/Sidebar';
import { PanelLeft } from 'lucide-react';

function LayoutContent({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user as any;
    const { expanded, setExpanded, openMobile, setOpenMobile, isMobile } = useSidebar();

    return (
        <div className="h-screen w-full flex bg-[#f9fafb] overflow-hidden">
            {/* Sidebar (Alto total a la izquierda) */}
            <Sidebar />

            {/* Contenedor derecho (Navbar superior + Contenido principal) */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                {/* Navbar superior */}
                <nav className="border-b border-slate-100 bg-white h-16 shrink-0 flex items-center px-6">
                    <div className="flex items-center w-full justify-between">
                        <div className="flex items-center gap-3">
                            {/* Botón de Hamburguesa para Colapsar Sidebar */}
                            <button
                                onClick={() => {
                                    if (isMobile) {
                                        setOpenMobile(!openMobile);
                                    } else {
                                        setExpanded(!expanded);
                                    }
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
                                title="Alternar barra lateral"
                            >
                                <PanelLeft size={20} />
                            </button>

                            <span className="text-sm font-bold text-slate-700">
                                Sistema de Control Escolar
                            </span>
                        </div>

                        {/* Dropdown del Usuario */}
                        <div className="flex items-center">
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                                        >
                                            {user.name}
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Mi Perfil</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Header (opcional) */}
                {header && (
                    <header className="bg-white border-b border-slate-100 shrink-0">
                        <div className="mx-auto max-w-7xl px-6 py-5">
                            {header}
                        </div>
                    </header>
                )}

                {/* Contenido principal */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f9fafb]">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function Authenticated(props: PropsWithChildren<{ header?: ReactNode }>) {
    return (
        <SidebarProvider>
            <LayoutContent {...props} />
        </SidebarProvider>
    );
}
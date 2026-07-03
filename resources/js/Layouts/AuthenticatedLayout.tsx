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
        <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
            {/* Navbar superior */}
            <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white h-16 shrink-0 flex items-center pl-4 pr-4 sm:pl-5 sm:pr-6 lg:pl-6 lg:pr-8">
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

                        {/* Logo institucional */}
                        <img 
                            src="/assets/logo-ph.webp" 
                            alt="Logo Prepa Hidalgo" 
                            className="h-9 w-auto object-contain"
                        />

                        <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1"></div>
                        
                        <span className="text-sm font-bold text-slate-700 hidden sm:inline-block">
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

            {/* Contenedor inferior (Sidebar + Contenido principal) */}
            <div className="flex-1 flex min-w-0 overflow-hidden">
                {/* Sidebar debajo de la barra */}
                <Sidebar />

                {/* Contenedor derecho (Contenido principal) */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
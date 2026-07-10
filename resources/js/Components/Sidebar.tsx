import * as React from "react";
import { usePage, Link, router } from '@inertiajs/react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Home,
  FileText,
  LogOut,
  Layers,
  User,
  ClipboardList
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/Components/ui/sheet";
import { cn } from "@/lib/utils";

export type Role = 'ADMIN' | 'DOCENTE' | 'ALUMNO';

interface SidebarProps {
  role?: Role;
}

export default function Sidebar({ role: propRole }: SidebarProps) {
  const { url } = usePage();
  const pathname = url.split('?')[0]; // Limpiar query params de la URL actual

  // Determinar rol automáticamente basado en la URL
  let resolvedRole: Role = 'ADMIN';
  if (url.startsWith('/docente')) {
    resolvedRole = 'DOCENTE';
  } else if (url.startsWith('/alumno')) {
    resolvedRole = 'ALUMNO';
  }

  const role = propRole || resolvedRole;
  const { expanded, openMobile, setOpenMobile, isMobile } = useSidebar();

  // Mapeamos los items de menú de tu diseño a las rutas correspondientes en Laravel
  const menuItems = [
    {
      name: "Inicio",
      icon: Home,
      path: role === "ADMIN" ? "/admin/dashboard" : role === "DOCENTE" ? "/docente/dashboard" : "/alumno/dashboard",
      roles: ["ADMIN", "DOCENTE", "ALUMNO"]
    },
    {
      name: "Tareas",
      icon: ClipboardList,
      path: "/alumno/tareas",
      roles: ["ALUMNO"]
    },
    {
      name: "Alumnos",
      icon: GraduationCap,
      path: role === "ADMIN" ? "/admin/alumnos" : "/docente/grupos/show",
      roles: ["ADMIN", "DOCENTE"]
    },
    {
      name: "Profesores",
      icon: Users,
      path: "/admin/docentes",
      roles: ["ADMIN"]
    },
    {
      name: "Materias",
      icon: BookOpen,
      path: role === "ADMIN" ? "/admin/materias" : role === "DOCENTE" ? "/docente/dashboard" : "/alumno/calificaciones",
      roles: ["ADMIN", "ALUMNO"]
    },
    {
      name: "Grupos",
      icon: Layers,
      path: "/admin/grupos",
      roles: ["ADMIN"]
    },
    {
      name: "Asignaciones",
      icon: ClipboardList,
      path: "/admin/asignaciones",
      roles: ["ADMIN"]
    },
    {
      name: "Reportes",
      icon: FileText,
      path: role === "ADMIN" ? "/admin/reportes" : role === "DOCENTE" ? "/docente/dashboard" : "/alumno/documentos",
      roles: ["ADMIN", "ALUMNO"]
    },
    {
      name: "Usuarios",
      icon: User,
      path: "/admin/users",
      roles: ["ADMIN"]
    },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  const SidebarInner = ({ isSheet = false }) => (
    <div className="flex flex-col h-full bg-white font-body pt-2">
      {/* Logo de la Institución */}
      <div className={cn(
        "shrink-0 flex items-center mb-6 pt-4",
        (expanded || isSheet) ? "px-10 justify-start" : "justify-center px-0"
      )}>
        {(expanded || isSheet) ? (
          <img src="/assets/phid_logo.png" alt="Logo Prepa Hidalgo" className="h-[52px] w-auto object-contain" />
        ) : (
          <img src="/assets/icono-sidebar.png" alt="Icono" className="h-8 w-auto object-contain" />
        )}
      </div>

      <SidebarContent className="flex-1 overflow-y-auto scrollbar-hide py-0">
        <SidebarMenu className="px-0">
          {filteredItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const isMenuExpanded = expanded || isSheet;
            return (
              <SidebarMenuItem key={item.path} className="mb-1.5">
                <SidebarMenuButton
                  isActive={isActive}
                  expanded={isMenuExpanded}
                  onClick={() => {
                    router.visit(item.path);
                    if (isSheet) setOpenMobile(false);
                  }}
                >
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0 transition-colors", 
                    isActive ? "text-[#1e88e5]" : "text-slate-400 group-hover:text-slate-650"
                  )} />

                  {isMenuExpanded && (
                    <>
                      <span className={cn(
                        "text-[14px] ml-1 transition-all duration-300",
                        isActive ? "text-[#1e88e5] font-extrabold" : "text-slate-450 font-bold group-hover:text-slate-650"
                      )}>
                        {item.name}
                      </span>
                      
                      {/* Botón de flecha blanca para el activo */}
                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1e88e5] ml-auto shrink-0 transition-transform group-hover:translate-x-0.5">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-0 border-none shrink-0 mb-4">
        {/* Tarjeta de Soporte y Ayuda 24/7 (Estilo Rocket Plexus) */}
        {(expanded || isSheet) && (
          <div className="mx-4 mb-4 mt-4 p-5 bg-[#f4f7ff] border border-blue-50/40 rounded-3xl text-center font-body select-none flex flex-col items-center gap-3.5">
            <img 
              src="/assets/image-sidebar.png" 
              alt="Soporte" 
              className="w-24 h-auto object-contain drop-shadow-sm"
            />
            <div>
              <h4 className="font-extrabold text-[#1a2b4b] text-[13px] tracking-tight">Mi Cuenta</h4>
              <p className="text-[10px] text-slate-450 font-bold leading-normal mt-1 max-w-[140px] mx-auto">Gestiona tu contraseña, preferencias y datos de acceso.</p>
              <button 
                type="button"
                onClick={() => {
                  router.visit('/profile');
                }}
                className="mt-3.5 bg-[#1e88e5] hover:bg-blue-700 text-white font-black text-[11px] px-6 py-2 rounded-full transition-all duration-200 shadow-sm"
              >
                Configurar
              </button>
            </div>
          </div>
        )}

        {/* Simulador de Rol (Solo para desarrollo local) */}
        {(expanded || isSheet) && (
          <div className="p-4 mx-4 mb-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest text-center">Simulador de Rol</span>
            <div className="grid grid-cols-3 gap-1">
              <Link
                href="/admin/dashboard"
                className={`text-[10px] text-center py-1.5 rounded-md font-bold transition-all ${role === 'ADMIN' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                Admin
              </Link>
              <Link
                href="/docente/dashboard"
                className={`text-[10px] text-center py-1.5 rounded-md font-bold transition-all ${role === 'DOCENTE' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                Docente
              </Link>
              <Link
                href="/alumno/dashboard"
                className={`text-[10px] text-center py-1.5 rounded-md font-bold transition-all ${role === 'ALUMNO' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                Alumno
              </Link>
            </div>
          </div>
        )}

        {/* Botón Cerrar Sesión (Estilo Plexus) */}
        <div className="mx-6 border-t border-slate-100 my-4" />
        <SidebarMenu className="px-0">
          <SidebarMenuItem className="mb-2">
            <button
              onClick={() => router.post('/logout')}
              className={cn(
                "flex items-center transition-all relative group overflow-hidden whitespace-nowrap h-12 w-full",
                (expanded || isSheet) 
                  ? "mx-4 px-5 rounded-full w-[calc(100%-32px)] gap-3.5 hover:bg-slate-50" 
                  : "justify-center px-0 rounded-none w-full hover:bg-slate-50"
              )}
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 text-[#1e88e5] group-hover:bg-[#1e88e5] group-hover:text-white transition-all flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              {(expanded || isSheet) && (
                <span className="text-[14px] font-extrabold text-slate-800 ml-0.5 group-hover:text-[#1e88e5] transition-colors">
                  Cerrar sesión
                </span>
              )}
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="p-0 w-72 border-none">
          <SheetTitle className="sr-only">Navegación Principal</SheetTitle>
          <SidebarInner isSheet={true} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <SidebarUI
      className={cn(
        "h-full max-h-full overflow-hidden border-r border-slate-100 transition-all duration-300 ease-in-out bg-white shadow-none shrink-0",
        expanded ? "w-64" : "w-20"
      )}
    >
      <SidebarInner />
    </SidebarUI>
  );
}

/* ==========================================================================
   SUBCOMPONENTES DE LA BARRA LATERAL (Shadcn Mocks)
   ========================================================================== */

const SidebarContext = React.createContext<{
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
} | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultExpanded = true,
}: {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setExpanded(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, openMobile, setOpenMobile, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const SidebarUI = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <aside
      ref={ref}
      className={cn(
        "flex flex-col bg-white border-r transition-all duration-300 ease-in-out z-40 h-full max-h-full overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
});
SidebarUI.displayName = "SidebarUI";

export const SidebarHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("p-4 shrink-0", className)}>{children}</div>
);

export const SidebarContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide", className)}>{children}</div>
);

export const SidebarFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("p-4 shrink-0", className)}>{children}</div>
);

export const SidebarMenu = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <nav className={cn("space-y-1 flex flex-col", className)}>{children}</nav>
);

export const SidebarMenuItem = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("w-full", className)}>{children}</div>
);

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean;
    expanded?: boolean;
  }
>(({ className, isActive, expanded = true, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex items-center transition-all relative group overflow-hidden whitespace-nowrap h-12 w-full",
        expanded 
          ? "mx-4 px-5 rounded-full w-[calc(100%-32px)] gap-3.5" 
          : "justify-center px-0 rounded-none w-full",
        isActive
          ? "bg-[#e8f2ff] text-[#1e88e5] font-extrabold animate-none"
          : "bg-transparent text-slate-400 hover:bg-slate-50/50 hover:text-slate-700 font-bold",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { usePage, Link, router } from '@inertiajs/react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Home,
  FileText,
  LogOut,
  User,
  ClipboardList,
  BriefcaseBusiness,
  GalleryVerticalEnd,
  ChevronDown,
  ChevronRight,
  PanelLeft,
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
  const { expanded, setExpanded, openMobile, setOpenMobile, isMobile } = useSidebar();
  const user = usePage().props.auth?.user as any;

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
      path: "/admin/alumnos",
      roles: ["ADMIN"]
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
      path: role === "ADMIN" ? "/admin/materias" : "/alumno/calificaciones",
      roles: ["ADMIN", "ALUMNO"]
    },
    {
      name: "Grupos",
      icon: GalleryVerticalEnd,
      path: role === "ADMIN" ? "/admin/grupos" : "/docente/grupos/show?id=ODU0NTA3NzkzNjM5",
      roles: ["ADMIN", "DOCENTE"]
    },
    {
      name: "Asignaciones",
      icon: ClipboardList,
      path: "/admin/asignaciones",
      roles: ["ADMIN"]
    },
    {
      name: "Especialidades",
      icon: BriefcaseBusiness,
      path: "/admin/especialidades",
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
      path: "/admin/usuarios",
      roles: ["ADMIN"]
    },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  // Datos de los grupos del docente (simulados - en producción vendrían como props)
  const docenteGroups = [
    { id: 'ODU0NTA3NzkzNjM5', name: '1-A', materia: 'Matemáticas I', code: 'MAT-101' },
    { id: 'ODU0NTA5MDk2Nzgx', name: '2-B', materia: 'Física I', code: 'FIS-101' },
  ];

  const [gruposOpen, setGruposOpen] = useState(() => {
    // Mantener abierto si la ruta actual es de grupos
    return url.startsWith('/docente/grupos');
  });

  const SidebarInner = ({ isSheet = false }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
          setUserMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
    <div className="flex flex-col h-full bg-white font-body pt-2">
      {/* Fila superior: logo + botón hamburguesa (expandido) | botón solo (colapsado) */}
      {(expanded || isSheet) ? (
        <div className="shrink-0 flex items-center justify-between px-5 pt-5 pb-4 mb-2">
          <img src="/assets/phid_logo.png" alt="Logo Prepa Hidalgo" className="h-[34px] w-auto object-contain ml-3" />
          <button
            type="button"
            onClick={() => {
              if (isMobile) setOpenMobile(!openMobile);
              else setExpanded(!expanded);
            }}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all shrink-0"
            title="Colapsar barra lateral"
          >
            <PanelLeft size={18} />
          </button>
        </div>
      ) : (
        <div className="shrink-0 flex flex-col items-center pt-4 pb-2 gap-3">
          <button
            type="button"
            onClick={() => {
              if (isMobile) setOpenMobile(!openMobile);
              else setExpanded(!expanded);
            }}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
            title="Expandir barra lateral"
          >
            <PanelLeft size={18} />
          </button>
          <img src="/assets/icono-sidebar.png" alt="Icono" className="h-8 w-auto object-contain" />
        </div>
      )}

      <SidebarContent className="flex-1 overflow-y-auto scrollbar-hide py-0">
        <SidebarMenu className="px-0">
          {filteredItems.map((item) => {
            const itemPathname = item.path.split('?')[0];
            const isMenuExpanded = expanded || isSheet;

            // ─── Bloque especial: "Grupos" para DOCENTE ───────────────────
            if (role === 'DOCENTE' && item.name === 'Grupos') {
              const isAnyGroupActive = pathname.startsWith('/docente/grupos');
              return (
                <SidebarMenuItem key={item.path} className="mb-1.5">
                  {/* Cabecera colapsable de Grupos */}
                  <button
                    onClick={() => {
                      if (isMenuExpanded) {
                        setGruposOpen(prev => !prev);
                      } else {
                        router.visit('/docente/grupos/show?id=ODU0NTA3NzkzNjM5');
                        if (isSheet) setOpenMobile(false);
                      }
                    }}
                    className={cn(
                      "flex items-center transition-all relative group overflow-hidden whitespace-nowrap h-12 w-full",
                      isMenuExpanded
                        ? "mx-4 px-5 rounded-full w-[calc(100%-32px)] gap-3.5"
                        : "justify-center px-0 rounded-none w-full",
                      isAnyGroupActive
                        ? "bg-[#e8f2ff] text-[#1e88e5] font-extrabold"
                        : "bg-transparent text-slate-400 hover:bg-slate-50/50 hover:text-slate-700 font-bold"
                    )}
                  >
                    <GalleryVerticalEnd className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isAnyGroupActive ? "text-[#1e88e5]" : "text-slate-400"
                    )} />

                    {isMenuExpanded && (
                      <>
                        <span className={cn(
                          "text-[14px] ml-1 flex-1 text-left",
                          isAnyGroupActive ? "text-[#1e88e5] font-extrabold" : "text-slate-450 font-bold"
                        )}>
                          Grupos
                        </span>
                        {gruposOpen
                          ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        }
                      </>
                    )}
                  </button>

                  {/* Sub-ítems de cada grupo */}
                  {isMenuExpanded && gruposOpen && (
                    <div className="mt-0.5 ml-8 mr-4 space-y-0.5">
                      {docenteGroups.map((g) => {
                        const groupPath = `/docente/grupos/show?id=${g.id}`;
                        const isGroupActive = pathname === '/docente/grupos/show' 
                          && (url.includes(`id=${g.id}`) || (url.includes(`grupo=${g.name}`) && url.includes(encodeURIComponent(g.materia))))
                          && !url.includes('tab=tasks');
                        return (
                          <button
                            key={g.name}
                            onClick={() => {
                              router.visit(groupPath);
                              if (isSheet) setOpenMobile(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-left transition-all",
                              isGroupActive
                                ? "bg-[#e8f2ff] text-[#1e88e5]"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              isGroupActive ? "bg-[#1e88e5]" : "bg-slate-300"
                            )} />
                            <div className="min-w-0">
                              <span className={cn(
                                "block text-[13px] leading-tight",
                                isGroupActive ? "font-extrabold" : "font-bold"
                              )}>
                                Grupo {g.name}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                                {g.materia}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </SidebarMenuItem>
              );
            }
            // ──────────────────────────────────────────────────────────────

            // Determinar si el enlace está activo de forma independiente
            let isActive = false;
            if (role === 'DOCENTE') {
              if (item.name === 'Tareas') {
                isActive = pathname === '/docente/grupos/show' && url.includes('tab=tasks');
              } else {
                isActive = pathname === itemPathname || (itemPathname !== '/' && pathname.startsWith(itemPathname + '/'));
              }
            } else {
              isActive = pathname === itemPathname || (itemPathname !== '/' && pathname.startsWith(itemPathname + '/'));
            }
            return (
              <SidebarMenuItem key={item.path} className="mb-1.5">
                <SidebarMenuButton
                  isActive={isActive}
                  expanded={isMenuExpanded}
                  onClick={() => {
                    if (pathname === itemPathname && itemPathname !== '/docente/grupos/show') {
                      if (isSheet) setOpenMobile(false);
                      return;
                    }
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
        {/* Tarjeta del Usuario — clickeable con dropdown */}
        {(expanded || isSheet) && (
          <div ref={userMenuRef} className="mx-4 mb-4 mt-4 relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(prev => !prev)}
              className="w-full flex items-center gap-3 p-3.5 bg-[#f4f7ff] border border-blue-50 rounded-2xl hover:border-blue-200 hover:bg-[#eef3ff] transition-all text-left group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-extrabold text-slate-800 truncate leading-tight">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {user?.email || ''}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "shrink-0 text-slate-400 transition-transform duration-200",
                  userMenuOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50">
                <button
                  type="button"
                  onClick={() => { router.visit('/profile'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-all text-left"
                >
                  <User size={14} className="text-slate-400" />
                  Mi Perfil
                </button>
                <div className="mx-3 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => { router.post('/logout'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-bold text-rose-600 hover:bg-rose-50 transition-all text-left"
                >
                  <LogOut size={14} className="text-rose-400" />
                  Cerrar sesión
                </button>
              </div>
            )}
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

      </SidebarFooter>

    </div>
    );
  };

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
      if (mobile) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
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
import * as React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
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
  Layers,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  Bell,
  Mail,
  Loader2
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/Components/ui/sheet";
import { cn } from "@/lib/utils";
import { SwalHelper } from "@/utils/SwalHelper";
import ImageWithSkeleton from '@/Components/ui/ImageWithSkeleton';

export type Role = 'ADMIN' | 'DOCENTE' | 'ALUMNO';

interface SidebarProps {
  role?: Role;
}

export default function Sidebar({ role: propRole }: SidebarProps) {
  const { url: inertiaUrl } = usePage();
  const [currentLocationUrl, setCurrentLocationUrl] = useState(() => window.location.pathname + window.location.search);
  const [navigatingPath, setNavigatingPath] = useState<string | null>(null);

  useEffect(() => {
    const unbindStart = router.on('start', (event) => {
      const targetUrl = event.detail.visit.url.pathname;
      setNavigatingPath(targetUrl);
    });

    const unbindFinish = router.on('finish', () => {
      setNavigatingPath(null);
    });

    return () => {
      unbindStart();
      unbindFinish();
    };
  }, []);

  useEffect(() => {
    const syncCurrentLocation = (event?: Event) => {
      const localUrl = event instanceof CustomEvent ? event.detail?.url : null;
      setCurrentLocationUrl(localUrl || window.location.pathname + window.location.search);
    };
    syncCurrentLocation();
    window.addEventListener('popstate', syncCurrentLocation);
    window.addEventListener('studia:navigation', syncCurrentLocation);
    return () => {
      window.removeEventListener('popstate', syncCurrentLocation);
      window.removeEventListener('studia:navigation', syncCurrentLocation);
    };
  }, [inertiaUrl]);

  const [currentPathname, currentSearchStr] = currentLocationUrl.split('?');
  const activeSubjectId = useMemo(() => {
    const routeMatch = currentPathname.match(/^\/alumno\/materias\/([^/]+)/);
    if (routeMatch) return decodeURIComponent(routeMatch[1]);
    const params = new URLSearchParams(currentSearchStr || '');
    return params.get('c') || params.get('id');
  }, [currentPathname, currentSearchStr]);

  const {
    auth,
    alumnoGroups: deferredAlumnoGroups,
    docenteGroups: deferredDocenteGroups,
    unreadNotificationsCount: deferredUnreadCount
  } = usePage().props as any;

  const user = auth?.user;
  const userRole = (user?.rol || user?.role || '').toUpperCase();

  let resolvedRole: Role = 'ADMIN';
  if (userRole === 'DOCENTE' || currentPathname.startsWith('/docente')) {
    resolvedRole = 'DOCENTE';
  } else if (userRole === 'ALUMNO' || currentPathname.startsWith('/alumno')) {
    resolvedRole = 'ALUMNO';
  }

  const role = propRole || resolvedRole;
  const { expanded, setExpanded, openMobile, setOpenMobile, isMobile } = useSidebar();

  const menuItems = [
    {
      name: "Inicio",
      icon: Home,
      path: role === "ADMIN" ? "/admin" : role === "DOCENTE" ? "/docente" : "/alumno",
      roles: ["ADMIN", "DOCENTE", "ALUMNO"]
    },
    {
      name: "Alumnos",
      icon: GraduationCap,
      path: "/admin/alumnos",
      roles: ["ADMIN"]
    },
    {
      name: "Docentes",
      icon: Users,
      path: "/admin/docentes",
      roles: ["ADMIN"]
    },
    {
      name: "Materias",
      icon: BookOpen,
      path: role === "ADMIN" ? "/admin/materias" : "/alumno/dashboard",
      roles: ["ADMIN", "ALUMNO"]
    },
    {
      name: "Grupos",
      icon: Layers,
      path: role === "ADMIN" ? "/admin/grupos" : (deferredDocenteGroups?.length > 0 ? `/docente/clases/${deferredDocenteGroups[0].id}` : '/docente'),
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
      path: "/admin/reportes",
      roles: ["ADMIN"]
    },
    {
      name: "Usuarios",
      icon: User,
      path: "/admin/usuarios",
      roles: ["ADMIN"]
    },
    {
      name: "Notificaciones",
      icon: Bell,
      path: "/admin/notificaciones",
      roles: ["ADMIN"]
    },
    {
      name: "Correos",
      icon: Mail,
      path: "/admin/plantillas-correo",
      roles: ["ADMIN"]
    },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));
  const docenteGroups = deferredDocenteGroups || [];
  const alumnoGroups = deferredAlumnoGroups || [];
  const unreadCount = deferredUnreadCount || 0;

  const [gruposOpen, setGruposOpen] = useState(() => currentLocationUrl.startsWith('/docente/grupos') || role === 'DOCENTE');
  const [materiasOpen, setMateriasOpen] = useState(() => (currentLocationUrl.startsWith('/alumno') && currentLocationUrl.includes('tab=tasks')) || role === 'ALUMNO');

  const SidebarInner = ({ isSheet = false }) => {
    const isMenuExpanded = expanded || isSheet;
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
      {/* Logo de la Institución */}
      <div className={cn(
        "shrink-0 flex items-center mb-6 pt-4 relative",
        isMenuExpanded ? "justify-start pl-8 pr-6" : "justify-center px-0 flex-col gap-4"
      )}>
        {isMenuExpanded ? (
          <>
            <ImageWithSkeleton
              src="/assets/phid_logo.webp"
              alt="Logo Prepa Hidalgo"
              containerClassName="h-[34px] w-32"
              className="h-full w-full object-contain object-left"
            />
            <button
                type="button"
                onClick={() => isMobile ? setOpenMobile(!openMobile) : setExpanded(!expanded)}
                aria-label={isMobile ? 'Cerrar menú lateral' : 'Contraer menú lateral'}
                title={isMobile ? 'Cerrar menú lateral' : 'Contraer menú lateral'}
                className="absolute right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all shrink-0"
            >
                <PanelLeft size={18} />
            </button>
          </>
        ) : (
          <>
            <button
                type="button"
                onClick={() => isMobile ? setOpenMobile(!openMobile) : setExpanded(!expanded)}
                aria-label={isMobile ? 'Cerrar menú lateral' : 'Expandir menú lateral'}
                title={isMobile ? 'Cerrar menú lateral' : 'Expandir menú lateral'}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
            >
                <PanelLeft size={18} />
            </button>
            <ImageWithSkeleton
              src="/assets/icono-sidebar.webp"
              alt="Icono de Prepahid"
              containerClassName="h-8 w-8"
              className="h-full w-full object-contain object-center"
              skeletonClassName="rounded-lg"
            />
          </>
        )}
      </div>

      <SidebarContent className="flex-1 overflow-y-auto scrollbar-hide py-0">
        <SidebarMenu className="px-0">
          {filteredItems.map((item) => {
            const itemPathname = item.path.split('?')[0];
            const isActive = item.name === 'Inicio'
              ? (currentPathname === itemPathname && !activeSubjectId)
              : (currentPathname === itemPathname || (itemPathname !== '/' && currentPathname.startsWith(itemPathname + '/')));

            // ─── Bloque especial: "Materias" para ALUMNO ───────────────────
            if (role === 'ALUMNO' && item.name === 'Materias') {
              const isAnySubjectActive = currentPathname.startsWith('/alumno/materias') || (currentPathname === '/alumno' && !!activeSubjectId);
              return (
                <SidebarMenuItem key={item.name} className="mb-1">
                  <button
                    onClick={() => isMenuExpanded && setMateriasOpen(prev => !prev)}
                    className={cn(
                      "flex items-center transition-all relative group overflow-hidden whitespace-nowrap h-12 w-full",
                      isMenuExpanded ? "mx-4 px-5 rounded-full w-[calc(100%-32px)] gap-3.5" : "justify-center px-0 rounded-none w-full",
                      isAnySubjectActive ? "bg-[#f0f7ff] text-[#0266E0] font-bold" : "bg-transparent text-[#526985] hover:bg-slate-50 hover:text-slate-800 font-semibold"
                    )}
                  >
                    <BookOpen className={cn("w-[18px] h-[18px] shrink-0 transition-colors", isAnySubjectActive ? "text-[#0266E0]" : "text-[#6b7f99]")} />
                    {isMenuExpanded && (
                      <>
                        <span className={cn("text-[14px] ml-1 flex-1 text-left", isAnySubjectActive ? "text-[#0266E0] font-bold" : "text-[#526985] font-bold")}>Materias</span>
                        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 text-[#6b7f99] transition-transform duration-200", materiasOpen ? "rotate-0" : "-rotate-90")} />
                      </>
                    )}
                  </button>

                  {isMenuExpanded && materiasOpen && (
                    <div className="mt-1 ml-10 mr-4 space-y-1 animate-in slide-in-from-top-1 duration-200">
                      {alumnoGroups.map((s: any) => {
                        const isSubActive = !!activeSubjectId && (
                          s.id?.toString() === activeSubjectId.toString() ||
                          s.uuid?.toString() === activeSubjectId.toString()
                        );
                        return (
                          <a
                            key={s.id}
                            href={`/alumno/materias/${s.id}`}
                            onMouseEnter={() => {
                              // Si el cursor ya apunta a una materia, usamos ese
                              // instante para calentar su respuesta específica.
                              router.prefetch(
                                `/alumno/materias/${s.id}`,
                                { only: ['subjectKardex', 'taskList'] },
                                { cacheFor: '1m' },
                              );
                            }}
                            onClick={(event) => {
                              // El aula ya está montada y conoce el catálogo de
                              // materias. Cambiar el historial localmente hace
                              // que el sidebar responda al instante; los datos
                              // diferidos continúan actualizándose en segundo plano.
                              if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                                return;
                              }

                              event.preventDefault();
                              router.cancelAll({ sync: true, async: true, prefetch: false });
                              window.history.pushState({}, '', `/alumno/materias/${s.id}`);
                              window.dispatchEvent(new PopStateEvent('popstate'));
                              window.dispatchEvent(new CustomEvent('studia:navigation', {
                                detail: { url: `/alumno/materias/${s.id}` },
                              }));
                              // El cambio visual y la URL ocurren de inmediato.
                              // Después pedimos sólo el resumen de la materia
                              // seleccionada; así no esperamos el kardex global
                              // cuando la aplicación acaba de iniciar en frío.
                              window.setTimeout(() => {
                                router.get(`/alumno/materias/${s.id}`, {}, {
                                  only: ['subjectKardex', 'taskList'],
                                  preserveState: true,
                                  preserveScroll: true,
                                  replace: true,
                                });
                              }, 0);
                              setOpenMobile(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all",
                                isSubActive ? "bg-[#f0f7ff] text-[#0266E0]" : "text-[#526985] hover:bg-slate-50 hover:text-slate-800"
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isSubActive ? "bg-[#0266E0]" : "bg-slate-300")} />
                            <div className="min-w-0">
                                <span className={cn("block text-[13px] leading-tight", isSubActive ? "font-bold" : "font-semibold")}>{s.nombre}</span>
                                <span className="block text-[10px] text-[#7186a3] font-medium truncate mt-0.5">{s.docente}</span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </SidebarMenuItem>
              );
            }

            // ─── Bloque especial: "Grupos" para DOCENTE ───────────────────
            if (role === 'DOCENTE' && item.name === 'Grupos') {
                const isAnyGroupActive = currentPathname.startsWith('/docente/clases');
              return (
                <SidebarMenuItem key={item.name} className="mb-1">
                  <button onClick={() => isMenuExpanded && setGruposOpen(prev => !prev)} className={cn("flex items-center transition-all relative group overflow-hidden whitespace-nowrap h-12 w-full", isMenuExpanded ? "mx-4 px-5 rounded-full w-[calc(100%-32px)] gap-3.5" : "justify-center px-0 rounded-none w-full", isAnyGroupActive ? "bg-[#f0f7ff] text-[#0266E0] font-bold" : "bg-transparent text-[#526985] hover:bg-slate-50 hover:text-slate-800 font-bold")}>
                    <Layers className={cn("w-[18px] h-[18px] shrink-0 transition-colors", isAnyGroupActive ? "text-[#0266E0]" : "text-[#6b7f99]")} />
                    {isMenuExpanded && (
                      <>
                        <span className={cn("text-[14px] ml-1 flex-1 text-left", isAnyGroupActive ? "text-[#0266E0] font-bold" : "text-[#526985] font-bold")}>Grupos</span>
                        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 text-[#6b7f99] transition-transform duration-200", gruposOpen ? "rotate-0" : "-rotate-90")} />
                      </>
                    )}
                  </button>
                  {isMenuExpanded && gruposOpen && (
                    <div className="mt-1 ml-10 mr-4 space-y-1 animate-in slide-in-from-top-1 duration-200">
                      {docenteGroups.map((g: any) => {
                        const isSubActive = currentPathname.startsWith(`/docente/clases/${g.id}`);
                        return (
                          <Link
                            key={g.id}
                            href={`/docente/clases/${g.id}`}
                            preserveState
                            preserveScroll
                            prefetch="hover"
                            onClick={() => setOpenMobile(false)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all",
                                isSubActive ? "bg-[#f0f7ff] text-[#0266E0]" : "text-[#526985] hover:bg-slate-50 hover:text-slate-800"
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isSubActive ? "bg-[#0266E0]" : "bg-slate-300")} />
                            <div className="min-w-0">
                                <span className={cn("block text-[13px] leading-tight", isSubActive ? "font-bold" : "font-semibold")}>Grupo {g.nombre_grupo}</span>
                                <span className="block text-[10px] text-[#7186a3] font-medium truncate mt-0.5">{g.materia}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </SidebarMenuItem>
              );
            }

            const isNavigatingToThis = navigatingPath ? (
              item.name === 'Inicio'
                ? (navigatingPath === itemPathname)
                : (navigatingPath === itemPathname || (itemPathname !== '/' && navigatingPath.startsWith(itemPathname + '/')))
            ) : false;

            const isHighlighted = navigatingPath ? isNavigatingToThis : isActive;

            return (
              <SidebarMenuItem key={item.name} className="mb-1">
                <Link
                  href={item.path}
                  prefetch={['mount', 'hover']}
                  onClick={(event) => {
                    if (role === 'ALUMNO' && item.name === 'Inicio') {
                      event.preventDefault();
                      router.cancelAll({ sync: true, async: true, prefetch: false });
                      window.history.pushState({}, '', item.path);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                      window.dispatchEvent(new CustomEvent('studia:navigation', {
                        detail: { url: item.path },
                      }));
                      setOpenMobile(false);
                      return;
                    }
                    setOpenMobile(false);
                  }}
                  className={cn(
                    "flex items-center transition-all relative group overflow-hidden whitespace-nowrap h-12 w-full",
                    isMenuExpanded ? "mx-4 px-5 rounded-full w-[calc(100%-32px)] gap-3.5" : "justify-center px-0 rounded-none w-full",
                    isHighlighted ? "bg-[#f0f7ff] text-[#0266E0] font-bold" : "bg-transparent text-[#526985] hover:bg-slate-50 hover:text-slate-800 font-bold"
                  )}
                >
                  <div className="relative">
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors", isHighlighted ? "text-[#0266E0]" : "text-[#6b7f99] group-hover:text-slate-700")} />
                    {item.name === 'Notificaciones' && unreadCount > 0 && (
                      <span className={cn(
                        "absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white border-2 border-white",
                        !isMenuExpanded && "h-3 w-3 -top-0.5 -right-0.5"
                      )}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {isMenuExpanded && (
                    <>
                      <span className={cn("text-[14px] ml-1 transition-all duration-300", isHighlighted ? "text-[#0266E0] font-bold" : "text-[#526985] font-bold group-hover:text-slate-800")}>{item.name}</span>
                      {isHighlighted && (
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#0266E0] ml-auto shrink-0 shadow-sm">
                          {isNavigatingToThis ? (
                            <Loader2 size={13} className="animate-spin text-[#0266E0]" />
                          ) : (
                            <ChevronRight size={14} strokeWidth={4} />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-0 border-none shrink-0 mb-4">
        {isMenuExpanded && (
            <div ref={userMenuRef} className="mx-4 mb-4 mt-4 relative">
                <button
                    type="button"
                    onClick={() => setUserMenuOpen(prev => !prev)}
                    className="w-full flex items-center gap-3 p-3 bg-[#f4f7ff] border border-blue-50 rounded-2xl hover:border-blue-200 hover:bg-[#eef3ff] transition-all text-left group"
                >
                    <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-extrabold text-slate-800 truncate leading-tight">
                            {user?.nombre_completo || 'Usuario'}
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

                {/* Dropdown Menu */}
                {userMenuOpen && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <button
                            type="button"
                            onClick={() => { router.visit('/perfil'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-all text-left"
                        >
                            <User size={14} className="text-slate-400" />
                            Mi Perfil
                        </button>
                        <div className="mx-3 border-t border-slate-100" />
                        <button
                            type="button"
                            onClick={() => {
                                setUserMenuOpen(false);
                                SwalHelper.confirm('¿Cerrar sesión?', '¿Estás seguro de que deseas salir?', 'Sí, salir', 'Cancelar', 'warning')
                                    .then(res => res.isConfirmed && router.post('/logout'));
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-bold text-rose-600 hover:bg-rose-50 transition-all text-left"
                        >
                            <LogOut size={14} className="text-rose-400" />
                            Cerrar sesión
                        </button>
                    </div>
                )}
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

const SidebarContext = React.createContext<{ expanded: boolean; setExpanded: (e: boolean) => void; openMobile: boolean; setOpenMobile: (o: boolean) => void; isMobile: boolean; } | null>(null);
export const useSidebar = () => { const c = React.useContext(SidebarContext); if (!c) throw new Error("useSidebar error"); return c; };
export const SidebarProvider = ({ children, defaultExpanded = true }: { children: React.ReactNode; defaultExpanded?: boolean; }) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => { const m = window.innerWidth < 768; setIsMobile(m); setExpanded(!m); };
    check(); window.addEventListener("resize", check); return () => window.removeEventListener("resize", check);
  }, []);
  return <SidebarContext.Provider value={{ expanded, setExpanded, openMobile, setOpenMobile, isMobile }}>{children}</SidebarContext.Provider>;
};

export const SidebarUI = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <aside ref={ref} className={cn("flex flex-col bg-white border-r transition-all duration-300 ease-in-out z-40 h-full max-h-full overflow-hidden", className)} {...props}>{children}</aside>
));
export const SidebarContent = ({ className, children }: { className?: string; children: React.ReactNode }) => <div className={cn("flex-1 overflow-y-auto py-4 scrollbar-hide", className)}>{children}</div>;
export const SidebarFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => <div className={cn("p-4 shrink-0", className)}>{children}</div>;
export const SidebarMenu = ({ className, children }: { className?: string; children: React.ReactNode }) => <nav className={cn("space-y-1 flex flex-col", className)}>{children}</nav>;
export const SidebarMenuItem = ({ className, children }: { className?: string; children: React.ReactNode }) => <div className={cn("w-full", className)}>{children}</div>;

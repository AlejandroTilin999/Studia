import * as React from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, router, usePage } from "@inertiajs/react";

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
} from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/Components/ui/sheet";

import { cn } from "@/lib/utils";
import { SwalHelper } from "@/utils/SwalHelper";

export type Role = "ADMIN" | "DOCENTE" | "ALUMNO";

interface SidebarProps {
    role?: Role;
}

interface MenuItemConfig {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    roles: Role[];
}

/*
|--------------------------------------------------------------------------
| Menú Base Estático
|--------------------------------------------------------------------------
*/

const BASE_MENU_ITEMS: MenuItemConfig[] = [
    {
        name: "Inicio",
        icon: Home,
        path: "",
        roles: ["ADMIN", "DOCENTE", "ALUMNO"],
    },
    {
        name: "Alumnos",
        icon: GraduationCap,
        path: "/admin/alumnos",
        roles: ["ADMIN"],
    },
    {
        name: "Docentes",
        icon: Users,
        path: "/admin/docentes",
        roles: ["ADMIN"],
    },
    {
        name: "Materias",
        icon: BookOpen,
        path: "",
        roles: ["ADMIN", "ALUMNO"],
    },
    {
        name: "Historial Académico",
        icon: FileText,
        path: "/alumno/historial",
        roles: ["ALUMNO"],
    },
    {
        name: "Grupos",
        icon: Layers,
        path: "",
        roles: ["ADMIN", "DOCENTE"],
    },
    {
        name: "Asignaciones",
        icon: ClipboardList,
        path: "/admin/asignaciones",
        roles: ["ADMIN"],
    },
    {
        name: "Especialidades",
        icon: BriefcaseBusiness,
        path: "/admin/especialidades",
        roles: ["ADMIN"],
    },
    {
        name: "Reportes",
        icon: FileText,
        path: "/admin/reportes",
        roles: ["ADMIN"],
    },
    {
        name: "Usuarios",
        icon: User,
        path: "/admin/usuarios",
        roles: ["ADMIN"],
    },
    {
        name: "Correos",
        icon: Mail,
        path: "/admin/plantillas-correo",
        roles: ["ADMIN"],
    },
];

/*
|--------------------------------------------------------------------------
| Componente Principal Sidebar
|--------------------------------------------------------------------------
*/

export default function Sidebar({ role: propRole }: SidebarProps) {
    const page = usePage();
    const inertiaUrl = page.url;

    const {
        auth,
        alumnoGroups: deferredAlumnoGroups,
        docenteGroups: deferredDocenteGroups,
        unreadNotificationsCount: deferredUnreadCount,
    } = page.props as any;

    /*
    |--------------------------------------------------------------------------
    | Navegación optimista (0ms latency al hacer clic)
    |--------------------------------------------------------------------------
    */
    const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

    useEffect(() => {
        const unbindStart = router.on("start", (event) => {
            try {
                const targetUrl = event.detail.visit.url;
                const pathname =
                    typeof targetUrl === "string"
                        ? new URL(targetUrl, window.location.origin).pathname
                        : targetUrl.pathname;
                setOptimisticPath(pathname);
            } catch {
                setOptimisticPath(null);
            }
        });

        const unbindFinish = router.on("finish", () => {
            setOptimisticPath(null);
        });

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    const currentLocationUrl =
        inertiaUrl ||
        (typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "");

    const [realPathname, currentSearchStr = ""] =
        currentLocationUrl.split("?");

    const currentPathname = optimisticPath ?? realPathname;

    /*
    |--------------------------------------------------------------------------
    | Materia activa
    |--------------------------------------------------------------------------
    */
    const activeSubjectId = useMemo(() => {
        const routeMatch = currentPathname.match(
            /^\/alumno\/materias\/([^/]+)/
        );
        if (routeMatch) {
            return decodeURIComponent(routeMatch[1]);
        }
        if (!currentSearchStr) return null;
        const params = new URLSearchParams(currentSearchStr);
        return params.get("c") || params.get("id");
    }, [currentPathname, currentSearchStr]);

    /*
    |--------------------------------------------------------------------------
    | Rol de Usuario
    |--------------------------------------------------------------------------
    */
    const user = auth?.user;
    const userRole = (user?.rol || user?.role || "").toUpperCase();

    let resolvedRole: Role = "ADMIN";
    if (userRole === "DOCENTE" || currentPathname.startsWith("/docente")) {
        resolvedRole = "DOCENTE";
    } else if (userRole === "ALUMNO" || currentPathname.startsWith("/alumno")) {
        resolvedRole = "ALUMNO";
    }

    const role = propRole || resolvedRole;
    const { expanded, setExpanded, openMobile, setOpenMobile, isMobile } =
        useSidebar();

    const docenteGroups = deferredDocenteGroups || [];
    const alumnoGroups = deferredAlumnoGroups || [];
    const unreadCount = deferredUnreadCount || 0;

    /*
    |--------------------------------------------------------------------------
    | Menú Filtrado
    |--------------------------------------------------------------------------
    */
    const filteredItems = useMemo(() => {
        const firstDocenteGroupId = docenteGroups?.[0]?.id;
        return BASE_MENU_ITEMS.filter((item) =>
            item.roles.includes(role)
        ).map((item) => {
            if (item.name === "Inicio") {
                return {
                    ...item,
                    path:
                        role === "ADMIN"
                            ? "/admin"
                            : role === "DOCENTE"
                              ? "/docente"
                              : "/alumno",
                };
            }
            if (item.name === "Materias") {
                return {
                    ...item,
                    path:
                        role === "ADMIN"
                            ? "/admin/materias"
                            : "/alumno/dashboard",
                };
            }
            if (item.name === "Grupos") {
                return {
                    ...item,
                    path:
                        role === "ADMIN"
                            ? "/admin/grupos"
                            : firstDocenteGroupId
                              ? `/docente/clases/${firstDocenteGroupId}`
                              : "/docente",
                };
            }
            return item;
        });
    }, [role, docenteGroups]);

    /*
    |--------------------------------------------------------------------------
    | Estado de Submenús
    |--------------------------------------------------------------------------
    */
    const [gruposOpen, setGruposOpen] = useState(
        () =>
            currentLocationUrl.startsWith("/docente/clases") ||
            role === "DOCENTE"
    );

    const [materiasOpen, setMateriasOpen] = useState(
        () =>
            currentLocationUrl.startsWith("/alumno/materias") ||
            role === "ALUMNO"
    );

    const handleLinkClick = useCallback(
        (path: string) => {
            setOptimisticPath(path.split("?")[0]);
            if (isMobile) {
                setOpenMobile(false);
            }
        },
        [isMobile, setOpenMobile]
    );

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                <SheetContent side="left" className="w-72 border-none p-0">
                    <SheetTitle className="sr-only">
                        Navegación Principal
                    </SheetTitle>
                    <SidebarInner
                        isSheet={true}
                        expanded={expanded}
                        isMobile={isMobile}
                        setExpanded={setExpanded}
                        openMobile={openMobile}
                        setOpenMobile={setOpenMobile}
                        role={role}
                        filteredItems={filteredItems}
                        currentPathname={currentPathname}
                        activeSubjectId={activeSubjectId}
                        materiasOpen={materiasOpen}
                        setMateriasOpen={setMateriasOpen}
                        gruposOpen={gruposOpen}
                        setGruposOpen={setGruposOpen}
                        alumnoGroups={alumnoGroups}
                        docenteGroups={docenteGroups}
                        unreadCount={unreadCount}
                        user={user}
                        handleLinkClick={handleLinkClick}
                    />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <SidebarUI
            className={cn(
                "h-full max-h-full shrink-0 overflow-hidden border-r border-slate-200 bg-white shadow-none transition-all duration-300 ease-in-out",
                expanded ? "w-[275px]" : "w-20"
            )}
        >
            <SidebarInner
                isSheet={false}
                expanded={expanded}
                isMobile={isMobile}
                setExpanded={setExpanded}
                openMobile={openMobile}
                setOpenMobile={setOpenMobile}
                role={role}
                filteredItems={filteredItems}
                currentPathname={currentPathname}
                activeSubjectId={activeSubjectId}
                materiasOpen={materiasOpen}
                setMateriasOpen={setMateriasOpen}
                gruposOpen={gruposOpen}
                setGruposOpen={setGruposOpen}
                alumnoGroups={alumnoGroups}
                docenteGroups={docenteGroups}
                unreadCount={unreadCount}
                user={user}
                handleLinkClick={handleLinkClick}
            />
        </SidebarUI>
    );
}

/*
|--------------------------------------------------------------------------
| SidebarInner (Componente Memoizado Externo)
|--------------------------------------------------------------------------
*/

interface SidebarInnerProps {
    isSheet?: boolean;
    expanded: boolean;
    isMobile: boolean;
    setExpanded: (expanded: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    role: Role;
    filteredItems: MenuItemConfig[];
    currentPathname: string;
    activeSubjectId: string | null;
    materiasOpen: boolean;
    setMateriasOpen: React.Dispatch<React.SetStateAction<boolean>>;
    gruposOpen: boolean;
    setGruposOpen: React.Dispatch<React.SetStateAction<boolean>>;
    alumnoGroups: any[];
    docenteGroups: any[];
    unreadCount: number;
    user: any;
    handleLinkClick: (path: string) => void;
}

const SidebarInner = React.memo(({
    isSheet = false,
    expanded,
    isMobile,
    setExpanded,
    openMobile,
    setOpenMobile,
    role,
    filteredItems,
    currentPathname,
    activeSubjectId,
    materiasOpen,
    setMateriasOpen,
    gruposOpen,
    setGruposOpen,
    alumnoGroups,
    docenteGroups,
    unreadCount,
    user,
    handleLinkClick,
}: SidebarInnerProps) => {
    const isMenuExpanded = expanded || isSheet;
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(e.target as Node)
            ) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex h-full flex-col bg-white pt-2 font-body">
            {/* LOGO */}
            <div
                className={cn(
                    "relative mb-6 flex shrink-0 items-center pt-4",
                    isMenuExpanded
                        ? "justify-start pl-8 pr-6"
                        : "flex-col justify-center gap-4 px-0"
                )}
            >
                {isMenuExpanded ? (
                    <>
                        <img
                            src="/assets/phid_logo.webp"
                            alt="Logo Prepa Hidalgo"
                            loading="eager"
                            decoding="async"
                            className="h-[34px] w-32 object-contain object-left"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                isMobile
                                    ? setOpenMobile(!openMobile)
                                    : setExpanded(!expanded)
                            }
                            aria-label={
                                isMobile
                                    ? "Cerrar menú lateral"
                                    : "Contraer menú lateral"
                            }
                            title={
                                isMobile
                                    ? "Cerrar menú lateral"
                                    : "Contraer menú lateral"
                            }
                            className="absolute right-4 shrink-0 rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                        >
                            <PanelLeft size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                isMobile
                                    ? setOpenMobile(!openMobile)
                                    : setExpanded(!expanded)
                            }
                            aria-label="Expandir menú lateral"
                            title="Expandir menú lateral"
                            className="mb-1 rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                        >
                            <PanelLeft size={18} />
                        </button>
                        <img
                            src="/assets/icono-sidebar.webp"
                            alt="Icono de Prepahid"
                            loading="eager"
                            decoding="async"
                            className="h-10 w-10 shrink-0 object-contain object-center"
                        />
                    </>
                )}
            </div>

            {/* CONTENIDO */}
            <SidebarContent className="scrollbar-hide flex-1 overflow-y-auto py-0">
                <SidebarMenu className="px-0">
                    {filteredItems.map((item) => {
                        const itemPathname = item.path.split("?")[0];
                        const isRootItem =
                            item.name === "Inicio" ||
                            itemPathname === "/admin" ||
                            itemPathname === "/docente" ||
                            itemPathname === "/alumno";

                        const isActive = isRootItem
                            ? currentPathname === itemPathname && !activeSubjectId
                            : currentPathname === itemPathname ||
                              (itemPathname !== "/" &&
                                  currentPathname.startsWith(itemPathname + "/"));

                        /* MATERIAS - ALUMNO */
                        if (role === "ALUMNO" && item.name === "Materias") {
                            const isAnySubjectActive =
                                currentPathname.startsWith("/alumno/materias");

                            return (
                                <SidebarMenuItem key={item.name} className="mb-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isMenuExpanded) {
                                                setMateriasOpen((prev) => !prev);
                                            }
                                        }}
                                        className={cn(
                                            "group relative flex h-12 w-full items-center overflow-hidden whitespace-nowrap transition-all",
                                            isMenuExpanded
                                                ? "mx-4 w-[calc(100%-32px)] gap-3.5 rounded-full px-5"
                                                : "w-full justify-center rounded-none px-0",
                                            isAnySubjectActive
                                                ? "bg-[#f0f7ff] font-bold text-[#0266E0]"
                                                : "bg-transparent font-semibold text-[#526985] hover:bg-slate-50 hover:text-slate-800"
                                        )}
                                    >
                                        <BookOpen
                                            className={cn(
                                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                                isAnySubjectActive
                                                    ? "text-[#0266E0]"
                                                    : "text-[#6b7f99]"
                                            )}
                                        />
                                        {isMenuExpanded && (
                                            <>
                                                <span
                                                    className={cn(
                                                        "ml-1 flex-1 text-left text-[14px] font-bold",
                                                        isAnySubjectActive
                                                            ? "text-[#0266E0]"
                                                            : "text-[#526985]"
                                                    )}
                                                >
                                                    Materias
                                                </span>
                                                <ChevronDown
                                                    className={cn(
                                                        "h-3.5 w-3.5 shrink-0 text-[#6b7f99] transition-transform duration-200",
                                                        materiasOpen
                                                            ? "rotate-0"
                                                            : "-rotate-90"
                                                    )}
                                                />
                                            </>
                                        )}
                                    </button>

                                    {isMenuExpanded && materiasOpen && (
                                        <div className="animate-in slide-in-from-top-1 ml-10 mr-4 mt-1 space-y-1 duration-200">
                                            {alumnoGroups.map((s: any) => {
                                                const isSubActive =
                                                    !!activeSubjectId &&
                                                    (s.id?.toString() ===
                                                        activeSubjectId.toString() ||
                                                        s.uuid?.toString() ===
                                                            activeSubjectId.toString());

                                                const subPath = `/alumno/materias/${s.id}`;

                                                return (
                                                    <Link
                                                        key={s.id}
                                                        href={subPath}
                                                        preserveScroll
                                                        onClick={() =>
                                                            handleLinkClick(subPath)
                                                        }
                                                        className={cn(
                                                            "flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-all",
                                                            isSubActive
                                                                ? "bg-[#f0f7ff] text-[#0266E0]"
                                                                : "text-[#526985] hover:bg-slate-50 hover:text-slate-800"
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                                                isSubActive
                                                                    ? "bg-[#0266E0]"
                                                                    : "bg-slate-300"
                                                            )}
                                                        />
                                                        <div className="min-w-0">
                                                            <span
                                                                className={cn(
                                                                    "block text-[13px] leading-tight",
                                                                    isSubActive
                                                                        ? "font-bold"
                                                                        : "font-semibold"
                                                                )}
                                                            >
                                                                {s.nombre}
                                                            </span>
                                                            <span className="mt-0.5 block truncate text-[10px] font-medium text-[#7186a3]">
                                                                {s.docente}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </SidebarMenuItem>
                            );
                        }

                        /* GRUPOS - DOCENTE */
                        if (role === "DOCENTE" && item.name === "Grupos") {
                            const isAnyGroupActive =
                                currentPathname.startsWith("/docente/clases");

                            return (
                                <SidebarMenuItem key={item.name} className="mb-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isMenuExpanded) {
                                                setGruposOpen((prev) => !prev);
                                            }
                                        }}
                                        className={cn(
                                            "group relative flex h-12 w-full items-center overflow-hidden whitespace-nowrap transition-all",
                                            isMenuExpanded
                                                ? "mx-4 w-[calc(100%-32px)] gap-3.5 rounded-full px-5"
                                                : "w-full justify-center rounded-none px-0",
                                            isAnyGroupActive
                                                ? "bg-[#f0f7ff] font-bold text-[#0266E0]"
                                                : "bg-transparent font-bold text-[#526985] hover:bg-slate-50 hover:text-slate-800"
                                        )}
                                    >
                                        <Layers
                                            className={cn(
                                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                                isAnyGroupActive
                                                    ? "text-[#0266E0]"
                                                    : "text-[#6b7f99]"
                                            )}
                                        />
                                        {isMenuExpanded && (
                                            <>
                                                <span
                                                    className={cn(
                                                        "ml-1 flex-1 text-left text-[14px] font-bold",
                                                        isAnyGroupActive
                                                            ? "text-[#0266E0]"
                                                            : "text-[#526985]"
                                                    )}
                                                >
                                                    Grupos
                                                </span>
                                                <ChevronDown
                                                    className={cn(
                                                        "h-3.5 w-3.5 shrink-0 text-[#6b7f99] transition-transform duration-200",
                                                        gruposOpen
                                                            ? "rotate-0"
                                                            : "-rotate-90"
                                                    )}
                                                />
                                            </>
                                        )}
                                    </button>

                                    {isMenuExpanded && gruposOpen && (
                                        <div className="animate-in slide-in-from-top-1 ml-10 mr-4 mt-1 space-y-1 duration-200">
                                            {docenteGroups.map((g: any) => {
                                                const subPath = `/docente/clases/${g.id}`;
                                                const isSubActive =
                                                    currentPathname.startsWith(subPath);

                                                return (
                                                    <Link
                                                        key={g.id}
                                                        href={subPath}
                                                        preserveScroll
                                                        onClick={() =>
                                                            handleLinkClick(subPath)
                                                        }
                                                        className={cn(
                                                            "flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-all",
                                                            isSubActive
                                                                ? "bg-[#f0f7ff] text-[#0266E0]"
                                                                : "text-[#526985] hover:bg-slate-50 hover:text-slate-800"
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                                                isSubActive
                                                                    ? "bg-[#0266E0]"
                                                                    : "bg-slate-300"
                                                            )}
                                                        />
                                                        <div className="min-w-0">
                                                            <span
                                                                className={cn(
                                                                    "block text-[13px] leading-tight",
                                                                    isSubActive
                                                                        ? "font-bold"
                                                                        : "font-semibold"
                                                                )}
                                                            >
                                                                Grupo {g.nombre_grupo}
                                                            </span>
                                                            <span className="mt-0.5 block truncate text-[10px] font-medium text-[#7186a3]">
                                                                {g.materia}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </SidebarMenuItem>
                            );
                        }

                        /* ITEMS NORMALES */
                        return (
                            <SidebarMenuItem key={item.name} className="mb-1">
                                <Link
                                    href={item.path}
                                    onClick={() => handleLinkClick(item.path)}
                                    className={cn(
                                        "group relative flex h-12 items-center overflow-hidden whitespace-nowrap transition-all",
                                        isMenuExpanded
                                            ? "mx-4 w-[calc(100%-32px)] gap-3.5 rounded-full px-5"
                                            : "mx-auto h-12 w-12 justify-center rounded-2xl px-0",
                                        isActive
                                            ? "bg-[#f0f7ff] font-bold text-[#0266E0]"
                                            : "bg-transparent font-bold text-[#526985] hover:bg-slate-50 hover:text-slate-800"
                                    )}
                                >
                                    <div className="relative">
                                        <item.icon
                                            className={cn(
                                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                                isActive
                                                    ? "text-[#0266E0]"
                                                    : "text-[#6b7f99] group-hover:text-slate-700"
                                            )}
                                        />
                                        {item.name === "Notificaciones" &&
                                            unreadCount > 0 && (
                                                <span
                                                    className={cn(
                                                        "absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[8px] font-bold text-white",
                                                        !isMenuExpanded &&
                                                            "-right-0.5 -top-0.5 h-3 w-3"
                                                    )}
                                                >
                                                    {unreadCount > 9
                                                        ? "9+"
                                                        : unreadCount}
                                                </span>
                                            )}
                                    </div>

                                    {isMenuExpanded && (
                                        <>
                                            <span
                                                className={cn(
                                                    "ml-1 text-[14px] font-bold transition-all duration-300",
                                                    isActive
                                                        ? "text-[#0266E0]"
                                                        : "text-[#526985] group-hover:text-slate-800"
                                                )}
                                            >
                                                {item.name}
                                            </span>
                                            {isActive && (
                                                <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#0266E0] shadow-sm">
                                                    <ChevronRight
                                                        size={14}
                                                        strokeWidth={4}
                                                    />
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

            {/* FOOTER */}
            <SidebarFooter className="mb-4 shrink-0 border-none p-0">
                {isMenuExpanded ? (
                    <div
                        ref={userMenuRef}
                        className="relative mx-4 mb-4 mt-4 flex items-center gap-2"
                    >
                        <div className="relative min-w-0 flex-1">
                            <button
                                type="button"
                                aria-label="Menú de perfil de usuario"
                                onClick={() => setUserMenuOpen((prev) => !prev)}
                                className="group flex w-full items-center gap-2 rounded-2xl border border-blue-50 bg-[#f4f7ff] p-3 text-left transition-all hover:border-blue-200 hover:bg-[#eef3ff]"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12.5px] font-extrabold leading-tight text-slate-800">
                                        {user?.nombre_completo || "Usuario"}
                                    </p>
                                    <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-600">
                                        {user?.email || ""}
                                    </p>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={cn(
                                        "shrink-0 text-slate-500 transition-transform duration-200",
                                        userMenuOpen ? "rotate-180" : ""
                                    )}
                                />
                            </button>

                            {userMenuOpen && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg duration-200">
                                    <button
                                        type="button"
                                        aria-label="Ir a mi perfil"
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            handleLinkClick("/perfil");
                                            router.visit("/perfil");
                                        }}
                                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[12px] font-bold text-slate-700 transition-all hover:bg-slate-50"
                                    >
                                        <User
                                            size={14}
                                            className="text-slate-400"
                                        />
                                        Mi Perfil
                                    </button>
                                    <div className="mx-3 border-t border-slate-100" />
                                    <button
                                        type="button"
                                        aria-label="Cerrar sesión"
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            SwalHelper.confirm(
                                                "¿Cerrar sesión?",
                                                "¿Estás seguro de que deseas salir?",
                                                "Sí, salir",
                                                "Cancelar",
                                                "warning"
                                            ).then((res) => {
                                                if (res.isConfirmed) {
                                                    SwalHelper.toastLoading("Cerrando sesión...");
                                                    router.post("/logout");
                                                }
                                            });
                                        }}
                                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[12px] font-bold text-rose-600 transition-all hover:bg-rose-50"
                                    >
                                        <LogOut
                                            size={14}
                                            className="text-rose-400"
                                        />
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>

                        {role === "ADMIN" && (
                            <Link
                                href="/admin/notificaciones"
                                aria-label="Ver notificaciones"
                                onClick={() =>
                                    handleLinkClick("/admin/notificaciones")
                                }
                                title="Notificaciones"
                                className={cn(
                                    "relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border transition-all",
                                    currentPathname.startsWith(
                                        "/admin/notificaciones"
                                    )
                                        ? "border-blue-200 bg-[#f0f7ff] font-bold text-[#0266E0]"
                                        : "border-blue-50 bg-[#f4f4ff] text-slate-600 hover:bg-[#eef3ff] hover:text-[#0266E0]"
                                )}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[9px] font-bold text-white">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                ) : (
                    role === "ADMIN" && (
                        <div className="mb-2 flex flex-col items-center gap-2">
                            <Link
                                href="/admin/notificaciones"
                                aria-label="Ver notificaciones"
                                onClick={() =>
                                    handleLinkClick("/admin/notificaciones")
                                }
                                title="Notificaciones"
                                className={cn(
                                    "relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                                    currentPathname.startsWith(
                                        "/admin/notificaciones"
                                    )
                                        ? "border-blue-200 bg-[#f0f7ff] text-[#0266E0]"
                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#0266E0]"
                                )}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[8px] font-bold text-white">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    )
                )}
            </SidebarFooter>
        </div>
    );
});
SidebarInner.displayName = "SidebarInner";

/*
|--------------------------------------------------------------------------
| CONTEXT & PROVIDER
|--------------------------------------------------------------------------
*/

const SidebarContext = React.createContext<{
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
} | null>(null);

export const useSidebar = () => {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar debe utilizarse dentro de SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    defaultExpanded = true,
}: {
    children: React.ReactNode;
    defaultExpanded?: boolean;
}) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    const [openMobile, setOpenMobile] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setExpanded(false);
            }
        };

        check();
        window.addEventListener("resize", check);
        return () => {
            window.removeEventListener("resize", check);
        };
    }, []);

    return (
        <SidebarContext.Provider
            value={{
                expanded,
                setExpanded,
                openMobile,
                setOpenMobile,
                isMobile,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

/*
|--------------------------------------------------------------------------
| AUXILIARY COMPONENTS
|--------------------------------------------------------------------------
*/

export const SidebarUI = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    return (
        <aside
            ref={ref}
            className={cn(
                "z-40 flex h-full max-h-full flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out",
                className
            )}
            {...props}
        >
            {children}
        </aside>
    );
});
SidebarUI.displayName = "SidebarUI";

let globalSidebarScrollTop = 0;

export const SidebarContent = React.memo(
    ({
        className,
        children,
    }: {
        className?: string;
        children: React.ReactNode;
    }) => {
        const containerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const saved = sessionStorage.getItem("studia_sidebar_scroll");
            const target =
                saved !== null ? parseInt(saved, 10) : globalSidebarScrollTop;

            if (containerRef.current && target > 0) {
                containerRef.current.scrollTop = target;
            }
        }, []);

        const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
            const top = e.currentTarget.scrollTop;
            globalSidebarScrollTop = top;
            sessionStorage.setItem("studia_sidebar_scroll", String(top));
        };

        return (
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className={cn(
                    "scrollbar-hide flex-1 overflow-y-auto py-4",
                    className
                )}
            >
                {children}
            </div>
        );
    }
);
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.memo(
    ({
        className,
        children,
    }: {
        className?: string;
        children: React.ReactNode;
    }) => (
        <div className={cn("shrink-0 p-4", className)}>{children}</div>
    )
);
SidebarFooter.displayName = "SidebarFooter";

export const SidebarMenu = React.memo(
    ({
        className,
        children,
    }: {
        className?: string;
        children: React.ReactNode;
    }) => <nav className={cn("flex flex-col space-y-1", className)}>{children}</nav>
);
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.memo(
    ({
        className,
        children,
    }: {
        className?: string;
        children: React.ReactNode;
    }) => <div className={cn("w-full", className)}>{children}</div>
);
SidebarMenuItem.displayName = "SidebarMenuItem";
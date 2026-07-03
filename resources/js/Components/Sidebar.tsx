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
  User
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
      <SidebarContent className="flex-1 overflow-y-auto scrollbar-hide py-0">
        <SidebarMenu className="px-0">
          {filteredItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const isMenuExpanded = expanded || isSheet;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isActive}
                  expanded={isMenuExpanded}
                  onClick={() => {
                    router.visit(item.path);
                    if (isSheet) setOpenMobile(false);
                  }}
                  className="rounded-none h-14"
                >
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-[#1e88e5]" : "text-slate-500 group-hover:text-[#1e88e5]")} />
                  
                  {isMenuExpanded && (
                    <span className={cn(
                      "text-[15px] font-medium ml-1 transition-all duration-300", 
                      isActive ? "text-[#1e88e5]" : "text-slate-600 group-hover:text-[#1e88e5]"
                    )}>
                      {item.name}
                    </span>
                  )}
                  
                  {/* Línea azul al final (extremo derecho de la barra) */}
                  {isActive && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#1e88e5]" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-0 border-none shrink-0 mb-4">
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

        {/* Botón Cerrar Sesión */}
        <SidebarMenu className="px-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              expanded={expanded || isSheet}
              onClick={() => router.post('/logout')}
              className="text-slate-600 hover:bg-red-50 hover:text-red-600 font-medium h-14 rounded-none border-none transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {(expanded || isSheet) && (
                <span className="text-[15px] font-medium ml-1">
                  Cerrar sesión
                </span>
              )}
            </SidebarMenuButton>
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
        "flex items-center transition-all relative group overflow-hidden whitespace-nowrap h-14 rounded-none w-full",
        expanded ? "px-6 gap-3" : "justify-center px-0",
        isActive 
          ? "bg-[#e8f2ff] text-[#1e88e5] font-semibold animate-none" 
          : "text-slate-500 hover:bg-blue-50/50 hover:text-[#1e88e5] font-medium",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";
import { 
    Home, 
    Users, 
    GraduationCap, 
    BookOpen, 
    Calendar, 
    Layers, 
    FileText 
} from 'lucide-react';

export const ADMIN_NAVIGATION = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Alumnos', href: '/admin/alumnos', icon: GraduationCap },
    { name: 'Docentes', href: '/admin/docentes', icon: Users },
    { name: 'Materias', href: '/admin/materias', icon: BookOpen },
    { name: 'Grupos', href: '/admin/grupos', icon: Layers },
    { name: 'Asignaciones', href: '/admin/cargas', icon: Calendar },
    { name: 'Reportes', href: '/admin/reportes', icon: FileText },
];

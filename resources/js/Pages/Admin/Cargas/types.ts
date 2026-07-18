export interface CatalogItem {
    id: number;
    nombre: string;
    activo?: boolean;
}

export interface GroupCatalogItem {
    id: number;
    nombre: string;
    codigo: string;
    especialidad: string;
}

export interface CourseCatalogItem {
    id: number;
    nombre: string;
    codigo: string;
    tipo: 'General' | 'Especialidad';
    semestre: number;
    especialidades?: string[];
}

export interface TeacherCatalogItem {
    id: number;
    nombre_completo: string;
    especialidad: string;
}

export interface AcademicLoadItem {
    id: number;
    ciclo_id: number;
    nombre_ciclo: string;
    grupo_id: number;
    nombre_grupo: string;
    codigo_grupo: string;
    materia_id: number;
    nombre_materia: string;
    codigo_materia: string;
    docente_id: number;
    nombre_docente: string;
}

export interface CargasIndexProps {
    loads?: AcademicLoadItem[];
    periods?: CatalogItem[];
    groups?: GroupCatalogItem[];
    courses?: CourseCatalogItem[];
    teachers?: TeacherCatalogItem[];
}

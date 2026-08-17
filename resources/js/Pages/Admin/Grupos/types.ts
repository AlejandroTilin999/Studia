export interface GrupoBackend {
    id: number;
    codigo: string;
    nombre: string;
    semestre: number;
    seccion: string;
    generacion: string;
    turno: string;
    especialidad: string;
    tutor_teacher_id: number | null;
    profesor: string;
    linked_courses?: number[];
    activo?: boolean;
}

export interface ProfesorSelect {
    id: number;
    nombre_completo: string;
}

export interface MateriaSelect {
    id: number;
    name: string;
    code: string;
}

export interface SpecialtySelect {
    id: number;
    nombre: string;
    codigo: string;
}

export interface CycleItem {
    id: number;
    nombre: string;
    activo: boolean;
}

export interface GruposIndexProps {
    grupos?: GrupoBackend[];
    profesores?: ProfesorSelect[];
    materias?: MateriaSelect[];
    especialidades?: SpecialtySelect[];
    cycles?: CycleItem[];
}

export interface GroupFormatted {
    id: number;
    code: string;
    name: string;
    semestre: number;
    seccion: string;
    generacion: string;
    shift: string;
    teacherName: string;
    teacher_id: number | null;
    specialty: string;
    activo?: boolean;
}

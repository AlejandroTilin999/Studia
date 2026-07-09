export interface GrupoBackend {
    id: number;
    codigo: string;
    nombre: string;
    turno: string;
    especialidad: string;
    teacher_id: number | null;
    profesor: string;
    linked_courses?: number[];
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

export interface GruposIndexProps {
    grupos?: GrupoBackend[];
    profesores?: ProfesorSelect[];
    materias?: MateriaSelect[];
}

export interface GroupFormatted {
    id: number;
    code: string;
    name: string;
    shift: string;
    teacherName: string;
    teacher_id: number | null;
    specialty: string;
}

export interface PlanSelect {
    id: number;
    nombre: string;
}

export interface TurnoSelect {
    id: number;
    nombre: string;
}

export interface GrupoBackend {
    id: number;
    codigo: string;
    nombre: string;
    turno: string;
    especialidad: string;
    tutor_teacher_id: number | null;
    profesor: string;
    linked_courses?: number[];
    plan_id?: number | string;
    plan_nombre?: string;
    turno_id?: number | string;
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
    name: string;
    code: string;
}

export interface GruposIndexProps {
    grupos?: GrupoBackend[];
    profesores?: ProfesorSelect[];
    materias?: MateriaSelect[];
    especialidades?: SpecialtySelect[];
    planes?: PlanSelect[];
    turnos?: TurnoSelect[];
}

export interface GroupFormatted {
    id: number;
    code: string;
    name: string;
    shift: string;
    teacherName: string;
    teacher_id: number | null;
    specialty: string;
    plan_id?: number | string;
    plan_nombre?: string;
    turno_id?: number | string;
    activo?: boolean;
}

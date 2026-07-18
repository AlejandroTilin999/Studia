export interface BackendGrade {
    id: number;
    score: number;
    period: string;
    course?: {
        id: number;
        nombre: string;
    };
}

export interface BackendStudent {
    id: number;
    matricula: string;
    nombre: string;
    email: string;
    curp?: string;
    estatus?: 'active' | 'suspended';
    grupo?: {
        id: number;
        nombre: string;
    };
    calificaciones?: BackendGrade[];
    telefono?: string;
    fecha_nacimiento?: string;
    rawNombre?: string;
    rawPaterno?: string;
    rawMaterno?: string;
}

export interface AcademicGroupProp {
    id: number;
    nombre: string;
    codigo: string;
}

export interface StudentFormatted {
    id: number;
    matricula: string;
    name: string;
    email: string;
    curp?: string;
    groupId: number;
    groupName: string;
    status: 'active' | 'suspended';
    telefono?: string;
    fecha_nacimiento?: string;
    rawNombre?: string;
    rawPaterno?: string;
    rawMaterno?: string;
    grades: {
        subject: string;
        code: string;
        score: number;
        period: string;
    }[];
}

export interface AlumnosIndexProps {
    alumnos: BackendStudent[];
    groups: AcademicGroupProp[];
}

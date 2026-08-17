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
}

export interface TeacherFromBackend {
    id: number;
    codigo_empleado: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    especialidad: string;
    areas: string[] | null;
    telefono: string | null;
    email?: string;
    usuario?: {
        email: string;
    };
    materias?: {
        id: number;
        nombre: string;
        codigo: string;
        nombre_grupo?: string;
    }[];
}

export interface DocentesIndexProps {
    teachers?: TeacherFromBackend[];
}

export interface TeacherFormatted {
    id: number;
    matricula: string;
    name: string;
    rawNombre: string;
    rawPaterno: string;
    rawMaterno: string | null;
    email: string;
    phone: string;
    specialty: string;
    areas: string[];
    assignments: {
        subject: string;
        groupName: string;
    }[];
}

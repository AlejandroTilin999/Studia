export interface TeacherFromBackend {
    id: number;
    employee_code: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    specialty: string;
    phone: string | null;
    email?: string;
    courses?: {
        id: number;
        name: string;
        code: string;
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
    assignments: {
        subject: string;
        groupName: string;
    }[];
}

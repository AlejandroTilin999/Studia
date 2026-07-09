export interface BackendGrade {
    id: number;
    score: number;
    period: string;
    course?: {
        id: number;
        name: string;
    };
}

export interface BackendStudent {
    id: number;
    matricula: string;
    name: string;
    email: string;
    status?: 'active' | 'suspended';
    academic_group?: {
        id: number;
        name: string;
    };
    grades?: BackendGrade[];
}

export interface AcademicGroupProp {
    id: number;
    name: string;
    code: string;
}

export interface StudentFormatted {
    id: number;
    matricula: string;
    name: string;
    email: string;
    groupId: number;
    groupName: string;
    status: 'active' | 'suspended';
    grades: {
        subject: string;
        score: number;
        period: string;
    }[];
}

export interface AlumnosIndexProps {
    alumnos: BackendStudent[];
    groups: AcademicGroupProp[];
}

export interface SpecialtySelect {
    id: number;
    name: string;
    code: string;
}

export interface MateriaBackend {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    tipo: 'General' | 'Especialidad';
    profesor: string;
    grupos: string[];
    especialidades: { id: number; name: string }[];
}

export interface ProfesorSelect {
    id: number;
    nombre_completo: string;
}

export interface GroupSelect {
    id: number;
    code: string;
    name: string;
}

export interface MateriasIndexProps {
    materias?: MateriaBackend[];
    profesores?: ProfesorSelect[];
    grupos?: GroupSelect[];
    specialties?: SpecialtySelect[];
}

export interface SubjectFormatted {
    id: number;
    code: string;
    name: string;
    semestre: number;
    tipo: 'General' | 'Especialidad';
    teacherName: string;
    teacher_id?: number | null;
    linkedGroups: string[];
    description: string;
    specialties: { id: number; name: string }[];
}

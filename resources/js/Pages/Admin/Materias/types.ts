export interface SpecialtySelect {
    id: number;
    nombre: string;
    codigo: string;
}

export interface MateriaBackend {
    id: number;
    codigo: string;
    nombre: string;
    semestre: number;
    descripcion: string;
    tipo: 'General' | 'Especialidad';
    profesor: string;
    grupos: string[];
    especialidades: { id: number; nombre: string }[];
    docente_id?: number | null;
}

export interface ProfesorSelect {
    id: number;
    nombre_completo: string;
}

export interface GroupSelect {
    id: number;
    codigo: string;
    nombre: string;
}

export interface MateriasIndexProps {
    materias?: MateriaBackend[];
    profesores?: ProfesorSelect[];
    grupos?: GroupSelect[];
    especialidades?: SpecialtySelect[];
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

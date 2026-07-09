export interface MateriaBackend {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    profesor: string;
    grupos: string[];
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
}

export interface SubjectFormatted {
    id: number;
    code: string;
    name: string;
    teacherName: string;
    linkedGroups: string[];
    description: string;
}

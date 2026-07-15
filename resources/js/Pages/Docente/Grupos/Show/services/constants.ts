export interface Criterion {
    id: number;
    name: string;
    percentage: number;
    syncTasks?: boolean;
}

export interface Task {
    id: number;
    name: string;
    description?: string;
    deadline?: string;
    dueTime?: string;
    points?: number;
    type?: 'task' | 'material';
    attachments?: { name: string; size: string; type: string }[];
    grades: Record<number, string>; // studentId → score
}

export interface ParcialConfig {
    configured: boolean;
    criteria: Criterion[];
}

export interface StudentGrade {
    id: number;
    matricula: string;
    name: string;
    scores: Record<number, string>; // criterionId → score
}

export const MOCK_STUDENTS: Omit<StudentGrade, 'scores'>[] = [
    { id: 1, matricula: 'PC001001', name: 'Ana García López' },
    { id: 2, matricula: 'PC001002', name: 'Carlos Martínez Ruiz' },
    { id: 3, matricula: 'PC001003', name: 'María Fernández Torres' },
    { id: 4, matricula: 'PC001004', name: 'José Hernández Soto' },
    { id: 5, matricula: 'PC001005', name: 'Laura Gómez Díaz' },
];

export const DEFAULT_CRITERIA: Criterion[] = [
    { id: 1, name: 'Examen', percentage: 60 },
    { id: 2, name: 'Tareas', percentage: 40 },
];

export const PARCIALES = [
    { num: 1, label: 'Primer Parcial' },
    { num: 2, label: 'Segundo Parcial' },
    { num: 3, label: 'Tercer Parcial' },
];

export const MINIMUM_PASSING_GRADE = 7;


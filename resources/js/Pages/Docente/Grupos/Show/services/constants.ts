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
    consolidado?: {
        p1: number | null;
        p2: number | null;
        p3: number | null;
        final: number | null;
        estatus: string;
    } | null;
}

export const MOCK_STUDENTS: Omit<StudentGrade, 'scores'>[] = [];

export const DEFAULT_CRITERIA: Criterion[] = [];

export const PARCIALES = [
    { num: 1, label: 'Primer Parcial' },
    { num: 2, label: 'Segundo Parcial' },
    { num: 3, label: 'Tercer Parcial' },
];

export const MINIMUM_PASSING_GRADE = 7;


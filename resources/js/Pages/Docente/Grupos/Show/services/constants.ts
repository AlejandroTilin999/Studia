export interface Criterion {
    id: number;
    nombre: string;
    porcentaje: number;
    sincronizar_tareas?: boolean;
}

export interface Task {
    id: number;
    nombre: string;
    descripcion?: string;
    fecha_entrega?: string;
    puntos?: number;
    type?: 'task' | 'material';
    attachments?: { name: string; size: string; type: string }[];
    calificaciones: Record<number, string>; // studentId → score
}

export interface ParcialConfig {
    configured: boolean;
    criteria: Criterion[];
}

export interface StudentGrade {
    id: number;
    matricula: string;
    nombre: string;
    calificaciones: Record<number, string>; // criterionId → score
    consolidado?: {
        p1: number | null;
        p2: number | null;
        p3: number | null;
        final: number | null;
        estatus: string;
    } | null;
}

export const MOCK_STUDENTS: StudentGrade[] = [];

export const DEFAULT_CRITERIA: Criterion[] = [];

export const PARCIALES = [
    { num: 1, label: 'Primer Parcial' },
    { num: 2, label: 'Segundo Parcial' },
    { num: 3, label: 'Tercer Parcial' },
];

export const MINIMUM_PASSING_GRADE = 7;

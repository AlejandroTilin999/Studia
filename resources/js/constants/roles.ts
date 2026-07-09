export const ROLES = {
    ADMIN: 'admin',
    TEACHER: 'docente',
    STUDENT: 'alumno',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

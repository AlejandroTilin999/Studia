export const MATRICULA_STATUS = {
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
} as const;

export type MatriculaStatus = typeof MATRICULA_STATUS[keyof typeof MATRICULA_STATUS];

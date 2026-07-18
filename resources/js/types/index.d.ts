export interface User {
    id: number;
    nombre: string;
    nombre_completo: string;
    email: string;
    rol: string;
    activo: boolean;
    telefono?: string;
    email_verified_at?: string;
    docenteGroups?: any[];
    alumnoGroups?: any[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

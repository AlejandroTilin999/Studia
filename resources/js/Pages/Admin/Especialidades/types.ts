export interface Specialty {
    id: number;
    nombre: string;
    codigo: string;
    sub_areas?: string[];
}

export interface SpecialtiesIndexProps {
    especialidades?: Specialty[];
}

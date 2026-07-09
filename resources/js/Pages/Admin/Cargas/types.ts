export interface CatalogItem {
    id: number;
    name: string;
    is_active?: boolean;
}

export interface GroupCatalogItem {
    id: number;
    name: string;
    code: string;
    major: string;
}

export interface CourseCatalogItem {
    id: number;
    name: string;
    code: string;
}

export interface TeacherCatalogItem {
    id: number;
    nombre_completo: string;
}

export interface AcademicLoadItem {
    id: number;
    academic_period_id: number;
    period_name: string;
    academic_group_id: number;
    group_name: string;
    group_code: string;
    course_id: number;
    course_name: string;
    course_code: string;
    teacher_id: number;
    teacher_name: string;
}

export interface CargasIndexProps {
    loads?: AcademicLoadItem[];
    periods?: CatalogItem[];
    groups?: GroupCatalogItem[];
    courses?: CourseCatalogItem[];
    teachers?: TeacherCatalogItem[];
}

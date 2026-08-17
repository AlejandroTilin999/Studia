export type GradeValue = string | number | null;

export interface DriveFile {
    name: string;
    nombre?: string;
    url?: string;
    google_drive_file_id?: string;
    google_drive_url?: string;
}

export interface StudentTask {
    id: number;
    hash?: string;
    carga_id?: string | number;
    subjectName?: string;
    parcial?: number;
    title: string;
    status: string;
    desc: string;
    points?: string;
    grade?: GradeValue;
    deadline?: string;
    deadlineAt?: string | null;
    isOverdue?: boolean;
    type?: string;
    archivo?: DriveFile[] | DriveFile | string | null;
    attachments?: DriveFile[];
}

export interface StudentSubject {
    id: string | number;
    uuid?: string;
    name: string;
    iconName?: string;
    teacher: string;
    description: string;
    color_tema?: string;
    group_name?: string | null;
    nombre_grupo?: string | null;
    specialty?: string | null;
}

export interface PartialLockInfo { allowed: boolean; reason: string; }
export interface PartialCriterion { name: string; percentage: number; score: GradeValue; }
export interface StudentPartialDetail { configured: boolean; criteria: PartialCriterion[]; average: GradeValue; lock_info: PartialLockInfo; }
export interface StudentSubjectKardex { id: string | number; uuid?: string; subject: string; score: GradeValue; color_tema?: string; details: Record<number, StudentPartialDetail>; }

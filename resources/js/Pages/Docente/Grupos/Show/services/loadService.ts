import { COLOR_THEMES } from '../../ColorThemes';

export interface AcademicLoad {
    id: string;
    code: string;
    subject: string;
    groupName: string;
    studentsCount: number;
    schedule: string;
    status: string;
    themeKey: string;
}

export const ACADEMIC_LOADS: AcademicLoad[] = [];

export function getLoadById(id: string | null): AcademicLoad | null {
    if (!id) return null;
    return ACADEMIC_LOADS.find(load => load.id === id) || null;
}

export function getLoadByParams(groupName: string | null, subjectName: string | null): AcademicLoad | null {
    if (!groupName || !subjectName) return null;
    const cleanGroup = groupName.trim().toLowerCase();
    const cleanSubject = subjectName.trim().toLowerCase();

    return ACADEMIC_LOADS.find(load =>
        load.groupName.trim().toLowerCase() === cleanGroup &&
        load.subject.trim().toLowerCase() === cleanSubject
    ) || null;
}

export function getGroupDefaultThemeKey(groupName: string): string {
    const name = (groupName || '').trim().toUpperCase();
    for (const [key] of Object.entries(COLOR_THEMES)) {
        if (name.includes(key.toUpperCase())) {
            return key;
        }
    }
    return 'blue';
}

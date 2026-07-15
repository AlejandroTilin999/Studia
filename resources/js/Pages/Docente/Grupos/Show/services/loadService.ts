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

export const ACADEMIC_LOADS: AcademicLoad[] = [
    {
        id: 'ODU0NTA3NzkzNjM5',
        code: 'MAT-101',
        subject: 'Matemáticas I',
        groupName: '1-A',
        studentsCount: 22,
        schedule: 'Lunes y Miércoles 07:00 - 08:40',
        status: 'completed',
        themeKey: 'blue'
    },
    {
        id: 'ODU0NTA5MDk2Nzgx',
        code: 'FIS-101',
        subject: 'Física I',
        groupName: '2-B',
        studentsCount: 18,
        schedule: 'Martes y Jueves 08:40 - 10:20',
        status: 'pending',
        themeKey: 'indigo'
    }
];

export function getLoadById(id: string | null): AcademicLoad | null {
    if (!id) return null;
    if (id === '1') return ACADEMIC_LOADS[0];
    if (id === '2') return ACADEMIC_LOADS[1];
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

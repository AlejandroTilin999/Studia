export const PERMISSIONS = {
    MANAGE_STUDENTS: 'manage_students',
    MANAGE_TEACHERS: 'manage_teachers',
    MANAGE_COURSES: 'manage_courses',
    MANAGE_GROUPS: 'manage_groups',
    MANAGE_LOADS: 'manage_loads',
    UPLOAD_GRADES: 'upload_grades',
    VIEW_KARDEX: 'view_kardex',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

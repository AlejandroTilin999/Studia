import { ROLES, UserRole } from '@/constants/roles';
import { PERMISSIONS, Permission } from '@/constants/permissions';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [ROLES.ADMIN]: [
        PERMISSIONS.MANAGE_STUDENTS,
        PERMISSIONS.MANAGE_TEACHERS,
        PERMISSIONS.MANAGE_COURSES,
        PERMISSIONS.MANAGE_GROUPS,
        PERMISSIONS.MANAGE_LOADS,
        PERMISSIONS.VIEW_KARDEX,
    ],
    [ROLES.TEACHER]: [
        PERMISSIONS.UPLOAD_GRADES,
    ],
    [ROLES.STUDENT]: [
        PERMISSIONS.VIEW_KARDEX,
    ],
};

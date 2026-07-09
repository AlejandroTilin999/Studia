import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { ROLES, UserRole } from '@/constants/roles';

interface PermissionContextType {
    hasRole: (role: UserRole) => boolean;
    isAdmin: boolean;
    isTeacher: boolean;
    isStudent: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const hasRole = (role: UserRole) => user?.role === role;
    const isAdmin = user?.role === ROLES.ADMIN;
    const isTeacher = user?.role === ROLES.TEACHER;
    const isStudent = user?.role === ROLES.STUDENT;

    return (
        <PermissionContext.Provider value={{ hasRole, isAdmin, isTeacher, isStudent }}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
}

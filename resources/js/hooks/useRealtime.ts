import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

/**
 * Global set of active Echo subscriptions across component lifecycles.
 * Prevents redundant HTTP POST /broadcasting/auth requests on every render or navigation.
 */
const activeSubscribedChannels = new Set<string>();

/**
 * Hook for handling real-time events via Laravel Echo and Reverb.
 */
export function useRealtime(options: { onAcademicPeriodChanged?: (event: any) => void } = {}) {
    const { onAcademicPeriodChanged } = options;
    const { auth, alumnoGroups: pageAlumnoGroups } = usePage().props as any;
    const user = auth?.user;
    const isStudent = (user?.rol || user?.role || '').toUpperCase() === 'ALUMNO';
    const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isRealtimeReady, setIsRealtimeReady] = useState(false);

    // La conexión a Reverb no debe competir con el contenido visible inicial.
    useEffect(() => {
        const timer = window.setTimeout(() => setIsRealtimeReady(true), 1200);
        return () => window.clearTimeout(timer);
    }, []);

    /**
     * Executes a debounced reload to prevent "reload storms"
     * when multiple events arrive simultaneously.
     */
    const debouncedReload = (options?: any) => {
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }

        reloadTimeoutRef.current = setTimeout(() => {
            router.visit(window.location.pathname + window.location.search, {
                method: 'get',
                preserveScroll: true,
                preserveState: true,
                replace: true,
                ...options
            });
            reloadTimeoutRef.current = null;
        }, 75);
    };

    useEffect(() => {
        if (!isRealtimeReady || !user || !window.Echo) return;

        // 1. Private User Channel (Notifications, Personal academic updates)
        const userChannelName = `App.Models.User.${user.id}`;
        if (!activeSubscribedChannels.has(userChannelName)) {
            activeSubscribedChannels.add(userChannelName);
            const userChannel = window.Echo.private(userChannelName);

            if (user.rol === 'ADMIN') {
                userChannel.listen('.NotificationCreated', () => {
                    debouncedReload({ only: ['unreadNotificationsCount', 'recentActivities'] });
                });
            }

            userChannel.listen('.GradeUpdated', (e: any) => {
                if (isStudent) {
                    window.dispatchEvent(new CustomEvent('studia:grade-updated', { detail: e }));
                    debouncedReload({ only: ['subjectKardex', 'kardex', 'taskList', 'initialTask'] });
                    return;
                }

                debouncedReload({ only: ['kardex', 'alumnos', 'calificaciones'] });
            });
        }

        // 2. Admin Channel (Global auditing)
        if (user.rol === 'ADMIN' && !activeSubscribedChannels.has('Admin.Dashboard')) {
            activeSubscribedChannels.add('Admin.Dashboard');
            const adminChannel = window.Echo.private('Admin.Dashboard');

            adminChannel.listen('.AuditLogCreated', () => {
                debouncedReload({ only: ['recentActivities'] });
            });

            adminChannel.listen('.AcademicPeriodChanged', () => {
                debouncedReload({ only: ['cycles'] });
            });

            adminChannel.listen('.EnrollmentChanged', () => {
                debouncedReload({ only: ['studentsCount', 'usersCount', 'alumnos'] });
            });
        }

        // 3. Canal privado compartido por usuarios autenticados.
        if (!activeSubscribedChannels.has('Academic.Cycle')) {
            activeSubscribedChannels.add('Academic.Cycle');
            window.Echo.private('Academic.Cycle')
                .listen('.AcademicPeriodChanged', (e: any) => {
                    if (isStudent) {
                        debouncedReload({ only: ['alumnoGroups', 'kardex', 'periods', 'summary'] });
                        if (onAcademicPeriodChanged) onAcademicPeriodChanged(e);
                        return;
                    }
                    debouncedReload();
                })
                .listen('.GroupDataUpdated', () => {
                    if (isStudent) {
                        debouncedReload({ only: ['alumnoGroups', 'kardex', 'periods', 'summary'] });
                    }
                })
                .listen('.TaskCreated', () => {
                    if (isStudent) return;
                    debouncedReload({ only: ['taskList'] });
                })
                .listen('.TaskUpdated', () => {
                    if (isStudent) return;
                    debouncedReload({ only: ['taskList'] });
                })
                .listen('.TaskDeleted', () => {
                    if (isStudent) return;
                    debouncedReload({ only: ['taskList'] });
                })
                .listen('.CriteriaUpdated', () => {
                    debouncedReload();
                });
        }
    }, [isRealtimeReady, user?.id, isStudent, onAcademicPeriodChanged]);

    const alumnoGroups = pageAlumnoGroups || [];

    useEffect(() => {
        if (!isRealtimeReady || !isStudent || !window.Echo || !Array.isArray(alumnoGroups)) return;

        alumnoGroups.forEach((g: any) => {
            if (!g.id) return;
            const channelName = `AcademicGroup.${g.id}`;
            if (!activeSubscribedChannels.has(channelName)) {
                activeSubscribedChannels.add(channelName);
                window.Echo.private(channelName)
                    .listen('.GroupDataUpdated', () => {
                        debouncedReload({ only: ['alumnoGroups', 'kardex', 'periods', 'summary'] });
                    });
            }
        });
    }, [isRealtimeReady, isStudent, JSON.stringify(alumnoGroups)]);

    /**
     * Subscribe to a specific academic group channel.
     */
    const useGroupSubscription = (
        groupId: number | string,
        onGroupUpdate?: (e: any) => void,
        onTasksUpdate?: (e: any) => void,
    ) => {
        useEffect(() => {
            if (!isRealtimeReady || !groupId || !window.Echo) return;
            const channelName = `AcademicGroup.${groupId}`;

            if (!activeSubscribedChannels.has(channelName)) {
                activeSubscribedChannels.add(channelName);
                const groupChannel = window.Echo.private(channelName);

                groupChannel.listen('.TaskCreated', () => {
                    if (isStudent) return;
                    debouncedReload({ only: ['taskList'] });
                });

                groupChannel.listen('.TaskUpdated', () => {
                    if (isStudent) return;
                    debouncedReload({ only: ['taskList'] });
                });

                groupChannel.listen('.TaskDeleted', () => {
                    if (isStudent) return;
                    debouncedReload({ only: ['taskList'] });
                });

                groupChannel.listen('.CriteriaUpdated', (e: any) => {
                    if (onGroupUpdate) onGroupUpdate(e);
                    debouncedReload({ only: ['classInfo', 'kardex', 'alumnos', 'taskList'] });
                });

                groupChannel.listen('.GroupDataUpdated', (e: any) => {
                    if (e?.type === 'tasks' && Array.isArray(e?.tasks) && onTasksUpdate) {
                        onTasksUpdate(e);
                        return;
                    }
                    if (e?.type === 'theme') {
                        onGroupUpdate?.(e);
                        return;
                    }
                    if (e?.type === 'submission') {
                        onGroupUpdate?.(e);
                        return;
                    }
                    if (onGroupUpdate && !['tasks', 'submission'].includes(e?.type)) onGroupUpdate(e);
                    const only = ['tasks', 'submission'].includes(e?.type)
                        ? ['taskList']
                        : ['alumnoGroups', 'kardex', 'taskList'];
                    debouncedReload({ only });
                });

                groupChannel.listen('.AcademicPeriodChanged', (e: any) => {
                    if (onGroupUpdate) onGroupUpdate(e);
                    debouncedReload({ only: ['classInfo', 'kardex', 'alumnoGroups'] });
                });
            }
        }, [groupId, isStudent, isRealtimeReady]);
    };

    return { useGroupSubscription };
}

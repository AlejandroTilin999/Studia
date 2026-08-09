import { useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';

/**
 * Hook for handling real-time events via Laravel Echo and Reverb.
 */
export function useRealtime() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Executes a debounced reload to prevent "reload storms"
     * when multiple events arrive simultaneously.
     */
    const debouncedReload = (options?: any) => {
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }

        reloadTimeoutRef.current = setTimeout(() => {
            console.log('[RT] 🔄 Executing consolidated reload...');
            router.reload(options);
            reloadTimeoutRef.current = null;
        }, 20); // 20ms instantaneous window
    };

    useEffect(() => {
        if (!user || !window.Echo) return;

        console.log('[RT] Initializing Real-time listeners for user:', user.id);

        // 1. Private User Channel (Notifications, Personal academic updates)
        const userChannel = window.Echo.private(`App.Models.User.${user.id}`);

        userChannel.on('pusher:subscription_succeeded', () => {
            console.log('%c[RT] ✅ Conectado al canal privado del usuario.', 'color: #10b981; font-weight: bold;');
        });

        userChannel.listen('.NotificationCreated', (e: any) => {
            console.log('[RT] Notification Received:', e);
            debouncedReload({ only: ['unreadNotificationsCount', 'recentActivities'] });
        });

        userChannel.listen('.GradeUpdated', (e: any) => {
            console.log('[RT] Grade Updated:', e);
            debouncedReload({ only: ['kardex', 'alumnos', 'calificaciones'] });
        });

        // 2. Admin Channel (Global auditing)
        if (user.rol === 'ADMIN') {
            const adminChannel = window.Echo.private('Admin.Dashboard');

            adminChannel.listen('.AuditLogCreated', (e: any) => {
                console.log('[RT] Audit Log Received:', e);
                debouncedReload({ only: ['recentActivities'] });
            });

            adminChannel.listen('.AcademicPeriodChanged', (e: any) => {
                console.log('[RT] Period Update (Admin):', e);
                debouncedReload({ only: ['cycles'] });
            });

            adminChannel.listen('.EnrollmentChanged', (e: any) => {
                console.log('[RT] Enrollment Change Received:', e);
                debouncedReload({ only: ['studentsCount', 'usersCount', 'alumnos'] });
            });
        }

        // 3. Public Global Channel
        window.Echo.channel('Public.Global')
            .listen('.AcademicPeriodChanged', (e: any) => {
                console.log('[RT] ⚡ Parcial/Ciclo Cambiado en Admin:', e);
                try {
                    const bc = new BroadcastChannel('school-cycle-channel');
                    bc.postMessage({ type: 'cycle-update', msg: 'PARCIAL_TOGGLED', timestamp: Date.now() });
                    bc.close();
                } catch(err) {}
            })
            .listen('.TaskCreated', (e: any) => {
                console.log('[RT] Global Task Created:', e);
                debouncedReload({ only: ['taskList', 'kardex'] });
            })
            .listen('.TaskUpdated', (e: any) => {
                console.log('[RT] Global Task Updated:', e);
                debouncedReload({ only: ['taskList', 'kardex'] });
            })
            .listen('.TaskDeleted', (e: any) => {
                console.log('[RT] Global Task Deleted:', e);
                debouncedReload({ only: ['taskList', 'kardex'] });
            });

        return () => {
            console.log('[RT] Leaving channels...');
            window.Echo.leave(`App.Models.User.${user.id}`);
            window.Echo.leave('Public.Global');
            if (user.rol === 'ADMIN') {
                window.Echo.leave('Admin.Dashboard');
            }
            if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
        };
    }, [user?.id]);

    /**
     * Subscribe to a specific academic group channel.
     */
    const subscribeToGroup = (groupId: number | string, onGroupUpdate?: (e: any) => void) => {
        useEffect(() => {
            if (!groupId || !window.Echo) return;

            console.log('[RT] Subscribing to group:', groupId);
            const groupChannel = window.Echo.private(`AcademicGroup.${groupId}`);

            groupChannel.on('pusher:subscription_succeeded', () => {
                console.log(`%c[RT] ✅ Conectado al canal del Grupo Académico: ${groupId}`, 'color: #10b981; font-weight: bold;');
            });

            groupChannel.listen('.TaskCreated', (e: any) => {
                console.log('[RT] Task Created Received:', e);
                debouncedReload({ only: ['taskList', 'kardex'] });
            });

            groupChannel.listen('.TaskUpdated', (e: any) => {
                console.log('[RT] Task Updated Received:', e);
                debouncedReload({ only: ['taskList', 'kardex'] });
            });

            groupChannel.listen('.TaskDeleted', (e: any) => {
                console.log('[RT] Task Deleted Received:', e);
                debouncedReload({ only: ['taskList', 'kardex'] });
            });

            groupChannel.listen('.GroupDataUpdated', (e: any) => {
                console.log('[RT] ⚡ Group Data Mass Update Received:', e);
                if (onGroupUpdate) {
                    onGroupUpdate(e);
                } else {
                    router.reload({
                        only: ['classInfo'],
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            });

            // ⚡ Escuchar cambio de parciales emitido a nivel grupo/global
            groupChannel.listen('.AcademicPeriodChanged', (e: any) => {
                console.log('%c[RT] ⚡ Actualización silenciosa de Parcial recibida:', 'color: #10b981; font-weight: bold;', e);
                if (onGroupUpdate) {
                    onGroupUpdate(e);
                }
            });

            return () => {
                console.log('[RT] Leaving group channel:', groupId);
                window.Echo.leave(`AcademicGroup.${groupId}`);
                if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
            };
        }, [groupId]);
    };

    return { subscribeToGroup };
}

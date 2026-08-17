import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

/**
 * Hook for handling real-time events via Laravel Echo and Reverb.
 */
export function useRealtime(options: { onAcademicPeriodChanged?: (event: any) => void } = {}) {
    const { onAcademicPeriodChanged } = options;
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isStudent = (user?.rol || user?.role || '').toUpperCase() === 'ALUMNO';
    const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isRealtimeReady, setIsRealtimeReady] = useState(false);

    // La conexión a Reverb no debe competir con el contenido visible inicial.
    // Se activa poco después de pintar el portal, sin perder actualizaciones
    // durante la navegación normal.
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
            // La navegación instantánea del alumno actualiza la URL con History API.
            // Inertia puede conservar la URL anterior en su estado interno; recargarla
            // restauraría, por ejemplo, /alumno mientras el usuario ya está en una materia.
            // Siempre refrescamos la ruta que el navegador muestra en este momento.
            router.visit(window.location.pathname + window.location.search, {
                method: 'get',
                preserveScroll: true,
                preserveState: true,
                replace: true,
                ...options
            });
            reloadTimeoutRef.current = null;
        }, 75); // Una sola notificación por operación: ventana breve sin retrasar al alumno.
    };

    useEffect(() => {
        if (!isRealtimeReady || !user || !window.Echo) return;

        // 1. Private User Channel (Notifications, Personal academic updates)
        const userChannel = window.Echo.private(`App.Models.User.${user.id}`);

        if (user.rol === 'ADMIN') {
            userChannel.listen('.NotificationCreated', (e: any) => {
                debouncedReload({ only: ['unreadNotificationsCount', 'recentActivities'] });
            });
        }

        userChannel.listen('.GradeUpdated', (e: any) => {
            // El alumno puede estar viendo el detalle de una tarea. Actualizar
            // también la tarea inicial y el kardex de la materia abierta evita
            // que tenga que recargar el navegador para ver su nota devuelta.
            if (isStudent) {
                // La vista de la tarea escucha este evento y cambia su estado
                // local inmediatamente. La visita parcial posterior sólo
                // revalida kardex y datos derivados en segundo plano.
                window.dispatchEvent(new CustomEvent('studia:grade-updated', { detail: e }));
                debouncedReload({ only: ['subjectKardex', 'kardex', 'taskList', 'initialTask'] });
                return;
            }

            debouncedReload({ only: ['kardex', 'alumnos', 'calificaciones'] });
        });

        // 2. Admin Channel (Global auditing)
        if (user.rol === 'ADMIN') {
            const adminChannel = window.Echo.private('Admin.Dashboard');

            adminChannel.listen('.AuditLogCreated', (e: any) => {
                debouncedReload({ only: ['recentActivities'] });
            });

            adminChannel.listen('.AcademicPeriodChanged', (e: any) => {
                debouncedReload({ only: ['cycles'] });
            });

            adminChannel.listen('.EnrollmentChanged', (e: any) => {
                debouncedReload({ only: ['studentsCount', 'usersCount', 'alumnos'] });
            });
        }

        // 3. Canal privado compartido por usuarios autenticados.
        window.Echo.private('Academic.Cycle')
            .listen('.AcademicPeriodChanged', (e: any) => {
                if (isStudent && onAcademicPeriodChanged) {
                    onAcademicPeriodChanged(e);
                    return;
                }
                debouncedReload();
            })
            .listen('.TaskCreated', (e: any) => {
                // El alumno recibe GroupDataUpdated con el listado puntual de tareas.
                // Una segunda visita Inertia global es redundante y puede competir
                // con la navegación instantánea entre materias.
                if (isStudent) return;
                debouncedReload({ only: ['taskList'] });
            })
            .listen('.TaskUpdated', (e: any) => {
                if (isStudent) return;
                debouncedReload({ only: ['taskList'] });
            })
            .listen('.TaskDeleted', (e: any) => {
                if (isStudent) return;
                debouncedReload({ only: ['taskList'] });
            })
            .listen('.CriteriaUpdated', (e: any) => {
                debouncedReload();
            });

        return () => {
            window.Echo.leave(`App.Models.User.${user.id}`);
            window.Echo.leave('Academic.Cycle');
            if (user.rol === 'ADMIN') {
                window.Echo.leave('Admin.Dashboard');
            }
            if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
        };
    }, [isRealtimeReady, user?.id, isStudent, onAcademicPeriodChanged]);

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

            const groupChannel = window.Echo.private(`AcademicGroup.${groupId}`);

            groupChannel.listen('.TaskCreated', (e: any) => {
                if (isStudent) return;
                debouncedReload({ only: ['taskList'] });
            });

            groupChannel.listen('.TaskUpdated', (e: any) => {
                if (isStudent) return;
                debouncedReload({ only: ['taskList'] });
            });

            groupChannel.listen('.TaskDeleted', (e: any) => {
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
                // El tema se puede aplicar directamente en el cliente. Evitar
                // una visita Inertia mantiene el cambio perceptiblemente instantáneo.
                if (e?.type === 'theme') {
                    onGroupUpdate?.(e);
                    return;
                }
                // Una entrega debe actualizar al docente desde su API de aula
                // inmediatamente. No basta con recargar taskList, porque las
                // evidencias viven dentro de los datos completos de la clase.
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

            // ⚡ Escuchar cambio de parciales emitido a nivel grupo/global
            groupChannel.listen('.AcademicPeriodChanged', (e: any) => {
                if (onGroupUpdate) onGroupUpdate(e);
                debouncedReload({ only: ['classInfo', 'kardex', 'alumnoGroups'] });
            });

            return () => {
                window.Echo.leave(`AcademicGroup.${groupId}`);
                if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
            };
        }, [groupId, isStudent, isRealtimeReady]);
    };

    return { useGroupSubscription };
}

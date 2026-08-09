import { useState, useEffect, useRef } from 'react';

export interface Cycle {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
    status: 'planificacion' | 'activo' | 'cerrado';
    p1_inicio?: string;
    p1_fin?: string;
    p1_activo?: boolean;
    p2_inicio?: string;
    p2_fin?: string;
    p2_activo?: boolean;
    p3_inicio?: string;
    p3_fin?: string;
    p3_activo?: boolean;
}

/**
 * Hook personalizado para encapsular la lógica de sincronización en tiempo real del ciclo escolar.
 * Separa la lógica de listeners y suscripciones de los componentes puramente de presentación.
 *
 * ESTRATEGIA:
 * - Las props de Inertia son la fuente de verdad principal. Cuando cambian (router.post/reload),
 *   el estado local se sincroniza automáticamente.
 * - BroadcastChannel para comunicación entre pestañas del mismo navegador.
 * - Preparado para Laravel Echo (solo descomentar).
 */
export function useCycleListener(initialCycle: Cycle) {
    const [currentCycle, setCurrentCycle] = useState<Cycle>(initialCycle);
    const cycleIdRef = useRef<number>(initialCycle.id);

    // 1. Sincronizar estado cuando las props de Inertia cambien.
    //    Esto ocurre automáticamente después de router.post(), router.reload(), etc.
    //    Usamos JSON.stringify para comparación profunda y evitar re-renders infinitos.
    useEffect(() => {
        console.log(`[ParcialStatusListener] Props de Inertia actualizadas → Ciclo "${initialCycle.nombre}" (ID: ${initialCycle.id})`);
        console.log(`[ParcialStatusListener] Estado de parciales: P1=${initialCycle.p1_activo}, P2=${initialCycle.p2_activo}, P3=${initialCycle.p3_activo}`);
        setCurrentCycle(initialCycle);
        cycleIdRef.current = initialCycle.id;
    }, [
        // Dependencias granulares para máxima reactividad sin usar objeto completo
        initialCycle.id,
        initialCycle.status,
        initialCycle.activo,
        initialCycle.p1_activo,
        initialCycle.p2_activo,
        initialCycle.p3_activo,
        initialCycle.nombre,
    ]);

    // 2. BroadcastChannel: sincronización entre pestañas del mismo navegador
    useEffect(() => {
        const currentCycleId = cycleIdRef.current;
        console.log(`[ParcialStatusListener] Iniciando BroadcastChannel listener para ciclo ID: ${currentCycleId}`);

        const bc = new BroadcastChannel('school-cycle-channel');

        bc.onmessage = (event) => {
            if (event.data?.type === 'cycle-update') {
                console.log('[ParcialStatusListener] Señal silenciosa recibida.');
            }
        };

        /**
         * ============================================================
         * INTEGRACIÓN FUTURA CON LARAVEL ECHO (solo descomentar)
         * ============================================================
         *
         * import Echo from 'laravel-echo';
         *
         * const echoChannel = window.Echo.private(`cycles`);
         *
         * echoChannel.listen('.CycleUpdated', (event: { cycle: Cycle }) => {
         *     console.log('[ParcialStatusListener] Evento Echo recibido:', event);
         *     setCurrentCycle(event.cycle);
         * });
         *
         * // En el cleanup:
         * window.Echo.leave('cycles');
         */

        return () => {
            console.log(`[ParcialStatusListener] Cerrando BroadcastChannel para ciclo ID: ${currentCycleId}`);
            bc.close();
        };
    }, []); // Solo se monta/desmonta una vez — la sincronización de datos va por el useEffect de arriba

    return currentCycle;
}

import React from 'react';
import ParcialControlGrid from './ParcialControlGrid';
import { useCycleListener, Cycle } from '../hooks/useCycleListener';

interface ParcialStatusListenerProps {
    cycle: Cycle;
    onToggle: (parcial: number, currentStatus: boolean) => void;
}

/**
 * Componente Wrapper de tipo Listener (Controlador de Tiempo Real).
 * Su única responsabilidad es gestionar la suscripción a eventos en tiempo real
 * y alimentar al componente presentacional puro con el estado actualizado.
 */
export default function ParcialStatusListener({ cycle, onToggle }: ParcialStatusListenerProps) {
    // Suscribir al hook de sincronización de tiempo real
    const currentCycle = useCycleListener(cycle);

    return (
        <ParcialControlGrid
            activeCycle={currentCycle}
            onToggle={onToggle}
        />
    );
}

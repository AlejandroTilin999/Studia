import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router, Deferred } from '@inertiajs/react';
import DashboardWelcomeBanner from '@/Components/layout/DashboardWelcomeBanner';
import QuickSummaryWidget, { MetricItem } from '@/Components/QuickSummaryWidget';
import { SwalHelper } from '@/utils/SwalHelper';
import { cycleService } from '@/services/cycleService';
import DotsLoader from '@/Components/ui/DotsLoader';

// Subcomponents
import CycleStatusCard from './components/CycleStatusCard';
import ParcialStatusListener from './components/ParcialStatusListener';
import RecentActivitiesTable from './components/RecentActivitiesTable';
import AdminToolsSidebar from './components/AdminToolsSidebar';
import NewCycleModal from './components/NewCycleModal';
import CycleHistoryModal from './components/CycleHistoryModal';

export default function AdminDashboardIndex() {
    const {
        auth,
        cycles = [],
        studentsCount,
        teachersCount,
        groupsCount,
        coursesCount,
        specialtiesCount,
        usersCount,
        recentActivities = []
    } = usePage().props as any;
    const adminName = auth?.user?.nombre || 'Administrador';

    // Modals state
    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const activeCycle = cycles.find((c: any) => c.status === 'activo');
    const planningCycle = cycles.find((c: any) => c.status === 'planificacion');

    // El ciclo que se muestra en la tarjeta principal (prioridad al activo)
    const workingCycle = activeCycle || planningCycle;

    // Form for new cycle
    const { data, setData, reset, processing, errors, put, post } = useForm({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        activo: true,
        p1_inicio: '', p1_fin: '', p1_activo: true,
        p2_inicio: '', p2_fin: '', p2_activo: false,
        p3_inicio: '', p3_fin: '', p3_activo: false,
    });

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedCycleId(null);
        reset();
        setIsPeriodModalOpen(true);
    };

    const openEditModal = (cycle: any) => {
        setModalMode('edit');
        setSelectedCycleId(cycle.id);

        // Cargar datos en el formulario
        setData({
            nombre: cycle.nombre,
            fecha_inicio: cycle.fecha_inicio,
            fecha_fin: cycle.fecha_fin,
            activo: cycle.activo,
            p1_inicio: cycle.p1_inicio || '',
            p1_fin: cycle.p1_fin || '',
            p1_activo: !!cycle.p1_activo,
            p2_inicio: cycle.p2_inicio || '',
            p2_fin: cycle.p2_fin || '',
            p2_activo: !!cycle.p2_activo,
            p3_inicio: cycle.p3_inicio || '',
            p3_fin: cycle.p3_fin || '',
            p3_activo: !!cycle.p3_activo,
        });

        setIsPeriodModalOpen(true);
    };

    const broadcastCycleUpdate = (cycleId: any) => {
        if (!cycleId) return;
        const id = Number(cycleId);

        try {
            const payload = {
                type: 'cycle-update',
                id: id,
                t: Date.now(),
                msg: 'FORCE_REFRESH_THUNDER'
            };

            // Un solo disparo potente, el receptor se encarga de la ráfaga
            const bc = new BroadcastChannel('school-cycle-channel');
            bc.postMessage(payload);
            setTimeout(() => bc.close(), 1000);

            localStorage.setItem('studia_rt_signal', JSON.stringify(payload));
            window.dispatchEvent(new CustomEvent('studia-rt-signal', { detail: payload }));

            console.log('%c[ThunderSync] ⚡ Señal de ráfaga enviada.', 'color: #fbbf24; font-weight: bold;');
        } catch (e) {
            console.error('Error en ThunderSync:', e);
        }
    };

    const handleSubmitPeriod = (e: React.FormEvent) => {
        e.preventDefault();

        const actionText = modalMode === 'create' ? 'Abriendo ciclo escolar...' : 'Actualizando ciclo escolar...';
        SwalHelper.toastLoading(actionText);

        const options = {
            onSuccess: () => {
                SwalHelper.close();
                setIsPeriodModalOpen(false);
                reset();
                SwalHelper.toast(`Ciclo escolar ${modalMode === 'create' ? 'configurado' : 'actualizado'} correctamente.`, 'success');
                if (selectedCycleId) {
                    broadcastCycleUpdate(selectedCycleId);
                }
            },
            onError: () => {
                SwalHelper.close();
                SwalHelper.toast(`Hubo un problema al ${modalMode === 'create' ? 'crear' : 'actualizar'} el ciclo escolar.`, 'error');
            }
        };

        if (modalMode === 'create') {
            cycleService.store(data, options);
        } else if (selectedCycleId) {
            cycleService.update(selectedCycleId, data, options);
        }
    };

    const handleCloseActiveCycle = () => {
        if (!activeCycle) return;

        SwalHelper.confirm(
            '¿Concluir Ciclo Escolar?',
            `Esta acción archivará el "${activeCycle.nombre}" y bloqueará nuevas calificaciones.`,
            'Sí, Concluir y Archivar',
            'Cancelar',
            'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.toastLoading('Verificando alumnos e inscripciones...');
                cycleService.close(activeCycle.id, {
                    onSuccess: () => {
                        SwalHelper.close();
                        SwalHelper.toast('Ciclo escolar archivado correctamente.', 'success');
                        broadcastCycleUpdate(activeCycle.id);
                    },
                    onError: (errors: any) => {
                        SwalHelper.close();
                        const message = errors?.ciclo || errors?.message || 'No se pudo concluir el ciclo escolar. Verifica las promociones pendientes.';
                        SwalHelper.alert('No es posible concluir el ciclo', message, 'warning');
                    }
                });
            }
        });
    };

    const handleActivateCycle = (id: number) => {
        SwalHelper.confirm(
            '¿Cambiar Ciclo Activo?',
            'Se cambiará el periodo vigente del sistema escolar.',
            'Sí, Cambiar',
            'No, Mantener actual'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.toastLoading('Cambiando ciclo activo...');
                cycleService.activate(id, {
                    onSuccess: () => {
                        SwalHelper.close();
                        setIsHistoryModalOpen(false);
                        SwalHelper.toast('Ciclo activo cambiado correctamente.', 'success');
                        broadcastCycleUpdate(id);
                    },
                    onError: (errors: any) => {
                        SwalHelper.close();
                        const message = errors?.ciclo || errors?.message || 'No se pudo cambiar el ciclo escolar.';
                        SwalHelper.alert('Error', message, 'error');
                    }
                });
            }
        });
    };

    const [localParcialStates, setLocalParcialStates] = useState<Record<number, boolean>>({});

    const handleToggleParcial = (parcial: number, currentStatus: boolean) => {
        if (!workingCycle) return;

        const key = `p${parcial}_activo`;
        const currentActive = localParcialStates[parcial] ?? (workingCycle as any)[key];

        const action = currentActive ? 'Cerrar' : 'Abrir';
        SwalHelper.confirm(
            `¿${action} Parcial ${parcial}?`,
            `Esta acción permitirá o bloqueará la captura de calificaciones para el parcial ${parcial}.`,
            `Sí, ${action}`,
            'Cancelar',
            currentActive ? 'warning' : 'info'
        ).then((result) => {
            if (result.isConfirmed) {
                const nextState = !currentActive;

                // 1. Respuesta instantánea en UI (0 ms) sin esperar al servidor ni recargar
                setLocalParcialStates(prev => ({ ...prev, [parcial]: nextState }));
                (workingCycle as any)[key] = nextState;
                
                broadcastCycleUpdate(workingCycle.id);
                SwalHelper.toast(`Parcial ${parcial} ${nextState ? 'abierto' : 'cerrado'}.`, 'success');

                // 2. Persistir en base de datos via Axios síncrono ultra liviano (no bloqueante)
                window.axios.post(route('admin.cycles.toggle_parcial', { id: workingCycle.id }), {
                    parcial,
                    activo: nextState
                }).catch(() => {
                    // Revertir en caso de error de red
                    setLocalParcialStates(prev => ({ ...prev, [parcial]: currentActive }));
                    (workingCycle as any)[key] = currentActive;
                    SwalHelper.error('Error', 'No se pudo cambiar el estado del parcial.');
                });
            }
        });
    };

    const metrics: MetricItem[] = [
        { code: "T1", label: "Alumnos", value: studentsCount },
        { code: "T2", label: "Docentes", value: teachersCount },
        { code: "T3", label: "Grupos", value: groupsCount },
        { code: "T4", label: "Materias", value: coursesCount },
        { code: "T5", label: "Especialidades", value: specialtiesCount },
        { code: "T6", label: "Usuarios", value: usersCount }
    ];

    return (
        <AuthenticatedLayout noPadding>
            <Head title="Panel de Control Administrativo" />

            <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden font-body w-full">
                {/* Main Content Area */}
                <div className="flex-1 p-4 md:p-8 space-y-8 lg:overflow-y-auto lg:h-full flex flex-col lg:min-h-0 scrollbar-hide">

                    <DashboardWelcomeBanner
                        greeting={`Hola ${adminName}`}
                        title="Bienvenido al"
                        subtitle="Portal de Administración Escolar · Prepahid"
                        wrapperClassName="pb-2"
                    />

                    {/* Active Cycle Card */}
                    <CycleStatusCard
                        activeCycle={workingCycle}
                        totalCycles={cycles.length}
                        onOpenNewCycle={openCreateModal}
                        onEditCycle={openEditModal}
                        onActivateCycle={handleActivateCycle}
                        onCloseCycle={handleCloseActiveCycle}
                        onOpenHistory={() => setIsHistoryModalOpen(true)}
                    />

                    {/* Parcial Controls (Only if cycle is active or planning) */}
                    {workingCycle && (
                        <ParcialStatusListener
                            cycle={workingCycle}
                            onToggle={handleToggleParcial}
                        />
                    )}

                    {/* Summary for Mobile (Hidden on LG+) */}
                    <div className="lg:hidden">
                        <QuickSummaryWidget metrics={metrics} />
                    </div>

                    {/* Activities Table */}
                    <Deferred data="recentActivities" fallback={
                        <div className="bg-white rounded-lg p-8 border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                            <DotsLoader label="Sincronizando bitácora" sublabel="Consultando actividades recientes..." />
                        </div>
                    }>
                        <RecentActivitiesTable activities={recentActivities} />
                    </Deferred>

                </div>

                {/* Sidebar area */}
                <AdminToolsSidebar
                    metrics={metrics}
                    onOpenNewCycle={openCreateModal}
                />
            </div>

            {/* Modals */}
            <NewCycleModal
                isOpen={isPeriodModalOpen}
                onClose={() => { setIsPeriodModalOpen(false); reset(); }}
                mode={modalMode}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmitPeriod}
            />

            <CycleHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                cycles={cycles}
                onActivate={handleActivateCycle}
                onEdit={openEditModal}
            />

        </AuthenticatedLayout>
    );
}

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import QuickSummaryWidget, { MetricItem } from '@/Components/QuickSummaryWidget';
import { SwalHelper } from '@/utils/SwalHelper';
import { cycleService } from '@/services/cycleService';

// Subcomponents
import CycleStatusCard from './components/CycleStatusCard';
import ParcialControlGrid from './components/ParcialControlGrid';
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

    // Layout effect
    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (!mainEl) return;
        mainEl.style.padding = '0';
        const handleResize = () => {
            if (window.innerWidth >= 1024) mainEl.style.overflow = 'hidden';
            else mainEl.style.overflow = 'auto';
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const handleSubmitPeriod = (e: React.FormEvent) => {
        e.preventDefault();

        const actionText = modalMode === 'create' ? 'Abriendo ciclo escolar...' : 'Actualizando ciclo escolar...';
        SwalHelper.loading(actionText, 'Configurando periodos y fechas');

        const options = {
            onSuccess: () => {
                setIsPeriodModalOpen(false);
                reset();
                SwalHelper.success('¡Operación Exitosa!', `El ciclo ha sido ${modalMode === 'create' ? 'configurado' : 'actualizado'} correctamente.`);
            },
            onError: () => {
                SwalHelper.error('Error', `Hubo un problema al ${modalMode === 'create' ? 'crear' : 'actualizar'} el ciclo escolar.`);
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
                SwalHelper.loading('Concluyendo ciclo...', 'Archivando expedientes históricos');
                cycleService.close(activeCycle.id, {
                    onSuccess: () => {
                        SwalHelper.success('¡Ciclo Concluido!', 'El periodo ha sido archivado correctamente.');
                    },
                    onError: () => {
                        SwalHelper.error('Error', 'No se pudo cerrar el ciclo escolar.');
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
                SwalHelper.loading('Cambiando ciclo...', 'Actualizando vigencia escolar');
                cycleService.activate(id, {
                    onSuccess: () => {
                        setIsHistoryModalOpen(false);
                        SwalHelper.success('¡Ciclo Cambiado!', 'El sistema ahora opera bajo el nuevo periodo.');
                    },
                    onError: () => {
                        SwalHelper.error('Error', 'No se pudo cambiar el ciclo escolar.');
                    }
                });
            }
        });
    };

    const handleToggleParcial = (parcial: number, currentStatus: boolean) => {
        if (!activeCycle) return;

        const action = currentStatus ? 'Cerrar' : 'Abrir';
        SwalHelper.confirm(
            `¿${action} Parcial ${parcial}?`,
            `Esta acción permitirá o bloqueará la captura de calificaciones para el parcial ${parcial}.`,
            `Sí, ${action}`,
            'Cancelar',
            currentStatus ? 'warning' : 'info'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Actualizando estado...', 'Comunicando con el servidor escolar');
                router.post(route('admin.cycles.toggle_parcial', { id: activeCycle.id }), {
                    parcial,
                    activo: !currentStatus
                }, {
                    onSuccess: () => SwalHelper.success('¡Actualizado!', `El Parcial ${parcial} ahora está ${!currentStatus ? 'abierto' : 'cerrado'}.`),
                    onError: () => SwalHelper.error('Error', 'No se pudo cambiar el estado del parcial.')
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
                        <ParcialControlGrid
                            activeCycle={workingCycle}
                            onToggle={handleToggleParcial}
                        />
                    )}

                    {/* Summary for Mobile (Hidden on LG+) */}
                    <div className="lg:hidden">
                        <QuickSummaryWidget metrics={metrics} />
                    </div>

                    {/* Activities Table */}
                    <RecentActivitiesTable activities={recentActivities} />

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

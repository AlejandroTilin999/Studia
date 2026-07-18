import { useState, useMemo, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import LoadFormModal from './components/LoadFormModal';
import LoadTable from './components/LoadTable';
import LoadTableControls from './components/LoadTableControls';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { loadService } from './services/loadService';
import { CargasIndexProps, AcademicLoadItem } from './types';

export default function CargasIndex({
    loads = [],
    periods = [],
    groups = [],
    courses = [],
    teachers = []
}: CargasIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    const activePeriod = useMemo(() => {
        return periods.find((p: any) => p.activo);
    }, [periods]);

    const [periodFilter, setPeriodFilter] = useState('all');

    useEffect(() => {
        if (activePeriod) {
            setPeriodFilter(activePeriod.id.toString());
        }
    }, [activePeriod]);

    const [groupFilter, setGroupFilter] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLoad, setSelectedLoad] = useState<AcademicLoadItem | null>(null);

    const { data, setData, reset, processing, errors } = useForm({
        ciclo_id: '' as string | number,
        grupo_id: '' as string | number,
        materia_id: '' as string | number,
        docente_id: '' as string | number,
        assignments: [] as { materia_id: number | string, docente_id: number | string }[],
    });

    const filteredLoads = useMemo(() => {
        return loads.filter(load => {
            const matchesSearch =
                load.nombre_materia.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.codigo_materia.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.nombre_docente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.nombre_grupo.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesPeriod = periodFilter === 'all' || load.ciclo_id.toString() === periodFilter;
            const matchesGroup = groupFilter === 'all' || load.grupo_id.toString() === groupFilter;

            return matchesSearch && matchesPeriod && matchesGroup;
        });
    }, [loads, searchQuery, periodFilter, groupFilter]);

    const totalLoadsCount = loads.length;
    const activeCyclesCount = periods.filter((p: any) => p.activo).length;
    const coveredGroupsCount = new Set(loads.map(l => l.grupo_id)).size;

    const handleExportExcel = () => {
        const headers = ["Grupo", "Materia (Clave)", "Materia (Nombre)", "Docente"];
        const rows = filteredLoads.map(l => [
            l.nombre_grupo,
            l.codigo_materia,
            l.nombre_materia,
            l.nombre_docente
        ]);

        exportToExcel(
            "Reporte de Asignaciones de Materias - PrepaHID",
            "Asignaciones",
            headers,
            rows,
            "asignaciones",
            () => triggerToast("Reporte de asignaciones de materias exportado a Excel.")
        );
    };

    const openCreateModal = () => {
        reset();
        if (activePeriod) {
            setData('ciclo_id', activePeriod.id);
        }
        setIsCreateModalOpen(true);
    };

    const openEditModal = (load: AcademicLoadItem) => {
        setSelectedLoad(load);
        setData({
            ciclo_id: load.ciclo_id,
            grupo_id: load.grupo_id,
            materia_id: load.materia_id,
            docente_id: load.docente_id,
            assignments: [], // Mantener estructura para evitar errores de renderizado
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        SwalHelper.loading('Creando asignación...', 'Procesando en el servidor');
        loadService.store(data, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                SwalHelper.success('¡Hecho!', 'La materia ha sido asignada correctamente.');
            },
            onError: (errs) => {
                SwalHelper.error('Error', Object.values(errs)[0] as string || 'No se pudo crear la asignación.');
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoad) return;
        SwalHelper.loading('Guardando cambios...', 'Actualizando información');
        loadService.update(selectedLoad.id, data, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                SwalHelper.success('¡Actualizado!', 'Los cambios han sido guardados.');
            },
            onError: (errs) => {
                SwalHelper.error('Error', Object.values(errs)[0] as string || 'No se pudo actualizar la asignación.');
            }
        });
    };

    const handleDeleteLoad = (load: AcademicLoadItem) => {
        SwalHelper.confirm(
            '¿Eliminar Asignación?',
            `¿Estás seguro de que deseas desvincular "${load.nombre_materia}" del grupo "${load.nombre_grupo}"?`,
            'Sí, Eliminar',
            'Cancelar',
            'error'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Eliminando...', 'Borrando asignación del sistema');
                loadService.destroy(load.id, {
                    onSuccess: () => {
                        SwalHelper.success('¡Eliminada!', 'La asignación ha sido removida.');
                    },
                    onError: () => {
                        SwalHelper.error('Error', 'No se pudo eliminar la asignación.');
                    }
                });
            }
        });
    };

    return (
        <AdminPageLayout
            headTitle="Asignaciones"
            title={`Asignaciones de Materias (${totalLoadsCount})`}
            subtitle={activePeriod ? `Gestionando asignaciones para el periodo: ${activePeriod.nombre}` : "Asocia grupos, materias y docentes"}
            breadcrumb="Asignaciones"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Asignaciones", value: String(totalLoadsCount) },
                { code: "T3", label: "Ciclos activos", value: String(activeCyclesCount) },
                { code: "T4", label: "Grupos cubiertos", value: String(coveredGroupsCount) }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download }
            ]}
            donutChartLabel="asignaciones"
            donutChartSegments={[
                { name: "Asignadas", count: totalLoadsCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" }
            ]}
        >
            <LoadTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                periodFilter={periodFilter}
                setPeriodFilter={setPeriodFilter}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                periods={periods}
                groups={groups}
                onOpenCreateModal={openCreateModal}
            />

            <LoadTable
                loads={filteredLoads}
                onOpenEditModal={openEditModal}
                onOpenDeleteModal={handleDeleteLoad}
                activePeriodId={activePeriod?.id}
            />

            <LoadFormModal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                }}
                mode={isCreateModalOpen ? 'create' : 'edit'}
                load={selectedLoad}
                periods={periods}
                groups={groups}
                courses={courses}
                teachers={teachers}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit}
            />
        </AdminPageLayout>
    );
}

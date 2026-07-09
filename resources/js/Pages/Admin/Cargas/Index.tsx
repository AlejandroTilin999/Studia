import { useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import LoadFormModal from './components/LoadFormModal';
import LoadTable from './components/LoadTable';
import LoadTableControls from './components/LoadTableControls';
import AdminPageLayout from '@/Components/AdminPageLayout';
import ConfirmActionModal from '@/Components/ConfirmActionModal';
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
    const activePeriod = periods.find((p: any) => p.is_active);
    const [periodFilter, setPeriodFilter] = useState(activePeriod ? activePeriod.id.toString() : 'all');
    const [groupFilter, setGroupFilter] = useState('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedLoad, setSelectedLoad] = useState<AcademicLoadItem | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    // Formulario reactivo de Inertia
    const { data, setData, post, put, delete: destroyLoad, reset, processing, errors } = useForm({
        academic_period_id: '' as string | number,
        academic_group_id: '' as string | number,
        course_id: '' as string | number,
        teacher_id: '' as string | number,
    });

    // Filtrar Cargas
    const filteredLoads = useMemo(() => {
        return loads.filter(load => {
            const matchesSearch = 
                load.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.group_name.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesPeriod = periodFilter === 'all' || load.academic_period_id.toString() === periodFilter;
            const matchesGroup = groupFilter === 'all' || load.academic_group_id.toString() === groupFilter;

            return matchesSearch && matchesPeriod && matchesGroup;
        });
    }, [loads, searchQuery, periodFilter, groupFilter]);

    // Métricas del layout
    const totalLoadsCount = loads.length;
    const activeCyclesCount = periods.filter((p: any) => p.is_active).length;
    const coveredGroupsCount = new Set(loads.map(l => l.academic_group_id)).size;

    const handleExportExcel = () => {
        const headers = ["Ciclo Escolar", "Grupo", "Materia (Clave)", "Materia (Nombre)", "Docente"];
        const rows = filteredLoads.map(l => [
            l.period_name,
            l.group_name,
            l.course_code,
            l.course_name,
            l.teacher_name
        ]);

        exportToExcel(
            "Reporte de Asignaciones de Materias - PrepaHID",
            "Asignaciones",
            headers,
            rows,
            "asignaciones",
            (msg) => triggerToast("Reporte de asignaciones de materias exportado a Excel.")
        );
    };

    const openCreateModal = () => {
        reset();
        // Cargar por defecto datos iniciales
        if (periods.length > 0) {
            const activePeriod = periods.find((p: any) => p.is_active) || periods[0];
            setData('academic_period_id', activePeriod.id);
        }
        if (groups.length > 0) setData('academic_group_id', groups[0].id);
        if (courses.length > 0) setData('course_id', courses[0].id);
        if (teachers.length > 0) setData('teacher_id', teachers[0].id);

        setIsCreateModalOpen(true);
    };

    const openEditModal = (load: AcademicLoadItem) => {
        setSelectedLoad(load);
        setData({
            academic_period_id: load.academic_period_id,
            academic_group_id: load.academic_group_id,
            course_id: load.course_id,
            teacher_id: load.teacher_id,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (load: AcademicLoadItem) => {
        setSelectedLoad(load);
        setIsDeleteModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        loadService.store(data, {
            onSuccess: () => {
                setSaveStatus('success');
                reset();
                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setSaveStatus('idle');
                    triggerToast("La asignación de materia ha sido creada con éxito.");
                }, 2000);
            },
            onError: () => {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoad) return;
        setSaveStatus('saving');
        loadService.update(selectedLoad.id, data, {
            onSuccess: () => {
                setSaveStatus('success');
                reset();
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    setSaveStatus('idle');
                    triggerToast("Los cambios en la asignación de materia se guardaron con éxito.");
                }, 2000);
            },
            onError: () => {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        });
    };

    const handleDeleteSubmit = () => {
        if (!selectedLoad) return;
        loadService.destroy(selectedLoad.id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedLoad(null);
                triggerToast("La asignación de materia ha sido eliminada.");
            }
        });
    };

    return (
        <AdminPageLayout
            headTitle="Asignaciones"
            title={`Asignaciones de Materias (${totalLoadsCount})`}
            subtitle="Asocia y consulta la vinculación de grupos, materias, profesores y ciclos escolares"
            breadcrumb="Asignaciones"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Asignaciones", value: totalLoadsCount },
                { code: "T3", label: "Ciclos activos", value: activeCyclesCount },
                { code: "T4", label: "Grupos cubiertos", value: coveredGroupsCount }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download }
            ]}
            donutChartLabel="asignaciones"
            donutChartSegments={[
                { name: "Asignadas", count: totalLoadsCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" }
            ]}
        >
            {/* Controles de filtro y búsqueda */}
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

            {/* Tabla de Cargas */}
            <LoadTable
                loads={filteredLoads}
                onOpenEditModal={openEditModal}
                onOpenDeleteModal={openDeleteModal}
            />

            {/* Modales */}
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
                saveStatus={saveStatus}
            />

            <ConfirmActionModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="¿Eliminar Asignación de Materia?"
                description={`Esta acción desvinculará la materia "${selectedLoad?.course_name}" del grupo "${selectedLoad?.group_name}" para el ciclo "${selectedLoad?.period_name}".`}
                warningMessage="¡Atención! La eliminación de esta asignación no eliminará calificaciones registradas históricamente, pero quitará el acceso del docente a este grupo en sus portales."
                onConfirm={handleDeleteSubmit}
                confirmLabel="Eliminar Asignación"
            />
        </AdminPageLayout>
    );
}

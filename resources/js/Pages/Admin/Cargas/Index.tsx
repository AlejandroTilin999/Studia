import { useState, useMemo, useEffect } from 'react';
import { useForm, Deferred, router } from '@inertiajs/react';
import { FileSpreadsheet, Download, Home, GraduationCap } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import LoadFormModal from './components/LoadFormModal';
import LoadTable from './components/LoadTable';
import LoadTableControls from './components/LoadTableControls';
import ImportLoadModal from './components/ImportLoadModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useExportPDF } from '@/hooks/useExportPDF';
import { loadService } from './services/loadService';
import { CargasIndexProps, AcademicLoadItem } from './types';
import DotsLoader from '@/Components/ui/DotsLoader';
import axios from 'axios';

export default function CargasIndex({
    loads,
    periods = [],
    groups = [],
    courses = [],
    teachers = [],
    filters = { search: '' },
    isCycleActive,
    canRegister
}: any) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const { toastMessage } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    const workingPeriod = useMemo(() => {
        // Prioridad: 1. Ciclo Activo, 2. Ciclo en Planeación
        const active = periods.find((p: any) => p.activo);
        if (active) return active;
        return periods.find((p: any) => p.status === 'planificacion');
    }, [periods]);

    const [periodFilter, setPeriodFilter] = useState('all');

    useEffect(() => {
        if (workingPeriod && periodFilter === 'all') {
            setPeriodFilter(workingPeriod.id.toString());
        }
    }, [workingPeriod]);

    // Soportar paginación y búsqueda
    const loadData = useMemo(() => {
        if (Array.isArray(loads)) return loads;
        return loads?.data || [];
    }, [loads]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                router.get(window.location.pathname, {
                    search: searchQuery
                }, {
                    preserveState: true,
                    replace: true,
                    only: ['loads']
                });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const [groupFilter, setGroupFilter] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedLoad, setSelectedLoad] = useState<AcademicLoadItem | null>(null);
    const [isProcessingImport, setIsImportProcessing] = useState(false);

    const { data, setData, reset, processing, errors } = useForm({
        ciclo_id: '' as string | number,
        grupo_id: '' as string | number,
        materia_id: '' as string | number,
        docente_id: '' as string | number,
        assignments: [] as { materia_id: number | string, docente_id: number | string }[],
    });

    // Helper flexible para asignar variables con setData de Inertia
    const handleSetData = (key: string, value: any) => {
        setData(key as any, value);
    };

    const handleExportPDF = () => {
        const headers = ["Grupo", "Clave Materia", "Materia", "Docente"];
        const rows = filteredLoads.map((l: any) => [
            l.nombre_grupo,
            l.codigo_materia,
            l.nombre_materia,
            l.nombre_docente
        ]);

        exportToPDF("Reporte de Asignaciones Docentes", headers, rows, "asignaciones");
    };

    const filteredLoads = useMemo(() => {
        return loadData.filter((load: any) => {
            const matchesPeriod = periodFilter === 'all' || load.ciclo_id?.toString() === periodFilter;
            const matchesGroup = groupFilter === 'all' || load.grupo_id?.toString() === groupFilter;

            const matchesSearch =
                (load.nombre_materia || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (load.codigo_materia || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (load.nombre_docente || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (load.nombre_grupo || '').toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch && matchesPeriod && matchesGroup;
        });
    }, [loadData, searchQuery, periodFilter, groupFilter]);

    const totalLoadsCount = useMemo(() => (loads === null || loads === undefined ? null : (Array.isArray(loads) ? loads.length : loads?.total || 0)), [loads]);
    const coveredGroupsCount = useMemo(() => (loads === null || loads === undefined) ? null : new Set(loadData.map((l: any) => l.grupo_id)).size, [loadData, loads]);

    const handleExportExcel = () => {
        const headers = ["Grupo", "Materia (Clave)", "Materia (Nombre)", "Docente"];
        const rows = filteredLoads.map((l: any) => [
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
            () => SwalHelper.success("¡Asignaciones Exportadas!", "El reporte de asignaciones de materias se ha generado correctamente.")
        );
    };

    const openCreateModal = () => {
        if (!groups || groups.length === 0) {
            SwalHelper.alert('Faltan Grupos', 'No hay grupos registrados. Crea uno antes de realizar asignaciones.', 'warning');
            return;
        }
        if (!courses || courses.length === 0) {
            SwalHelper.alert('Faltan Materias', 'No hay materias registradas en el catálogo. Crea materias primero.', 'warning');
            return;
        }
        if (!teachers || teachers.length === 0) {
            SwalHelper.alert('Faltan Profesores', 'No hay docentes registrados. Da de alta profesores primero.', 'warning');
            return;
        }

        reset();
        setData({
            ciclo_id: workingPeriod?.id || '',
            grupo_id: '',
            materia_id: '',
            docente_id: '',
            assignments: [],
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (load: AcademicLoadItem) => {
        setSelectedLoad(load);
        setData({
            ciclo_id: load.ciclo_id,
            grupo_id: load.grupo_id,
            materia_id: load.materia_id,
            docente_id: load.docente_id,
            assignments: [],
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.ciclo_id || !data.grupo_id) {
            SwalHelper.toast('Debes seleccionar un ciclo escolar y un grupo.', 'error');
            return;
        }

        if (data.assignments.length === 0) {
            SwalHelper.toast('Por favor asigna al menos un docente a una materia.', 'error');
            return;
        }

        SwalHelper.toastLoading('Creando asignaciones académicas...');
        
        router.post(route('admin.cargas.store'), {
            ciclo_id: data.ciclo_id,
            grupo_id: data.grupo_id,
            assignments: data.assignments
        }, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                SwalHelper.toast('Asignaciones registradas correctamente.', 'success');
            },
            onError: (errs: any) => {
                const firstError = Object.values(errs)[0] as string;
                SwalHelper.toast(firstError || 'No se pudieron registrar las asignaciones.', 'error');
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoad) return;
        
        SwalHelper.toastLoading('Actualizando asignación...');
        
        router.put(route('admin.cargas.update', selectedLoad.id), {
            ciclo_id: data.ciclo_id,
            grupo_id: data.grupo_id,
            materia_id: data.materia_id,
            docente_id: data.docente_id
        }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                SwalHelper.toast('Asignación académica actualizada.', 'success');
            },
            onError: (errs: any) => {
                const firstError = Object.values(errs)[0] as string;
                SwalHelper.toast(firstError || 'No se pudo actualizar la asignación.', 'error');
            }
        });
    };

    const handleImportSubmit = async (importData: any) => {
        setIsImportProcessing(true);
        SwalHelper.toastLoading('Clonando materias y docentes del ciclo anterior...');

        try {
            await axios.post(route('admin.loads.import'), importData);
            SwalHelper.toast('¡Carga académica importada correctamente!', 'success');
            setIsImportModalOpen(false);
            router.reload();
        } catch (error: any) {
            console.error(error);
            SwalHelper.toast(error.response?.data?.error || 'No se pudo importar la carga académica.', 'error');
        } finally {
            setIsImportProcessing(false);
        }
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
                SwalHelper.toastLoading('Eliminando asignación...');
                router.delete(route('admin.cargas.destroy', load.id), {
                    onSuccess: () => {
                        SwalHelper.toast('Asignación eliminada correctamente.', 'success');
                    },
                    onError: () => {
                        SwalHelper.toast('No se pudo eliminar la asignación.', 'error');
                    }
                });
            }
        });
    };

    return (
        <AdminPageLayout
            headTitle="Asignaciones"
            title="Asignaciones de Materias"
            subtitle={workingPeriod ? `Gestionando asignaciones para el periodo: ${workingPeriod.nombre}` : "Asocia grupos, materias y docentes"}
            breadcrumb="Asignaciones"
            toastMessage={toastMessage}
            isLoading={loads === null || loads === undefined}

            metrics={[
                { code: "T1", label: "Asignaciones", value: totalLoadsCount },
                { code: "T4", label: "Grupos cubiertos", value: coveredGroupsCount }
            ]}

            quickActions={[
                { label: "Importar Carga", onClick: () => setIsImportModalOpen(true), icon: Download },
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: RiFileExcel2Fill },
                { label: "Exportar listado (PDF)", onClick: handleExportPDF, icon: FaFilePdf },
                { label: "Panel de Control", onClick: () => router.visit(route('admin.dashboard')), icon: Home },
                { label: "Plantilla Docente", onClick: () => router.visit(route('admin.docentes.index')), icon: GraduationCap }
            ]}
            donutChartLabel="asignaciones"
            donutChartSegments={[
                { name: "Asignadas", count: totalLoadsCount, color: "#0266E0", bulletClass: "bg-[#0266E0]" }
            ]}
        >
            {!isCycleActive && canRegister && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest leading-none mb-1">Modo Planeación</p>
                        <p className="text-[11px] text-blue-700 font-medium">Configurando la carga académica para el próximo ciclo. Las asignaciones de materias y docentes están habilitadas para preparar el periodo escolar.</p>
                    </div>
                </div>
            )}

            {!canRegister && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">Modo Solo Catálogo</p>
                        <p className="text-[11px] text-amber-700 font-medium">No existe un Ciclo Escolar activo ni en planeación. La asignación de materias y el registro de cargas académicas están bloqueados.</p>
                    </div>
                    <button
                        onClick={() => router.visit(route('admin.dashboard'))}
                        className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-all shrink-0"
                    >
                        Crear Ciclo
                    </button>
                </div>
            )}

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
                isCycleActive={canRegister}
            />

            <Deferred data="loads" fallback={
                <DotsLoader
                    label="Cargando asignaciones"
                    sublabel="Por favor espera un momento..."
                />
            }>
                <LoadTable
                    loads={filteredLoads}
                    onOpenEditModal={openEditModal}
                    onOpenDeleteModal={handleDeleteLoad}
                    activePeriodId={workingPeriod?.id}
                />
            </Deferred>

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
                setData={handleSetData}
                errors={errors}
                processing={processing}
                onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit}
            />

            <ImportLoadModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                periods={periods}
                groups={groups}
                onConfirm={handleImportSubmit}
                processing={isProcessingImport}
            />
        </AdminPageLayout>
    );
}
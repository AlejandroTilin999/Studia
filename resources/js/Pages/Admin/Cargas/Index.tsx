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
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    const activePeriod = useMemo(() => {
        return periods.find((p: any) => p.activo);
    }, [periods]);

    const [periodFilter, setPeriodFilter] = useState('all');

    useEffect(() => {
        if (activePeriod && periodFilter === 'all') {
            setPeriodFilter(activePeriod.id.toString());
        }
    }, [activePeriod]);

    // [OPTIMIZACIÓN] Soportar paginación y búsqueda en servidor
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

    const handleExportPDF = () => {
        const headers = ["Grupo", "Clave Materia", "Materia", "Docente"];
        const rows = filteredLoads.map(l => [
            l.nombre_grupo,
            l.codigo_materia,
            l.nombre_materia,
            l.nombre_docente
        ]);

        exportToPDF("Reporte de Asignaciones Docentes", headers, rows, "asignaciones");
    };

    const filteredLoads = useMemo(() => {
        return loadData.filter(load => {
            const matchesPeriod = periodFilter === 'all' || load.ciclo_id.toString() === periodFilter;
            const matchesGroup = groupFilter === 'all' || load.grupo_id.toString() === groupFilter;

            // Búsqueda local complementaria
            const matchesSearch =
                load.nombre_materia.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.codigo_materia.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.nombre_docente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.nombre_grupo.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch && matchesPeriod && matchesGroup;
        });
    }, [loadData, searchQuery, periodFilter, groupFilter]);

    const totalLoadsCount = useMemo(() => (loads === null || loads === undefined ? null : (Array.isArray(loads) ? loads.length : loads?.total || 0)), [loads]);
    const coveredGroupsCount = useMemo(() => (loads === null || loads === undefined) ? null : new Set(loadData.map(l => l.grupo_id)).size, [loadData, loads]);

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

        // Validar si quedan grupos disponibles para asignación masiva
        if (activePeriod) {
            const isOddCycle = activePeriod.mes_inicio ? (activePeriod.mes_inicio >= 8 || activePeriod.mes_inicio === 1) : true;
            const availableGroups = groups.filter(g => {
                const s = g.codigo ? parseInt(g.codigo.charAt(0)) : 0;
                const matchesParity = isOddCycle ? s % 2 !== 0 : s % 2 === 0;
                if (!matchesParity) return false;

                const alreadyAssigned = loadData.some(l =>
                    l.grupo_id.toString() === g.id.toString() &&
                    l.ciclo_id.toString() === activePeriod.id.toString()
                );
                return !alreadyAssigned;
            });

            if (availableGroups.length === 0) {
                SwalHelper.alert(
                    'Sin Grupos Disponibles',
                    'Actualmente todos los grupos correspondientes a este periodo ya cuentan con su plantilla docente asignada.',
                    'info'
                );
                return;
            }
        }

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
            onError: (errs: any) => {
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
            onError: (errs: any) => {
                SwalHelper.error('Error', Object.values(errs)[0] as string || 'No se pudo actualizar la asignación.');
            }
        });
    };

    const handleImportSubmit = async (importData: any) => {
        setIsImportProcessing(true);
        SwalHelper.loading("Importando Carga", "Clonando materias y docentes del ciclo anterior...");

        try {
            await axios.post(route('admin.loads.import'), importData);
            SwalHelper.success("¡Importación Exitosa!", "La carga académica ha sido clonada correctamente.");
            setIsImportModalOpen(false);
            router.reload();
        } catch (error: any) {
            console.error(error);
            SwalHelper.error("Error", error.response?.data?.error || "No se pudo importar la carga académica.");
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
            title="Asignaciones de Materias"
            subtitle={activePeriod ? `Gestionando asignaciones para el periodo: ${activePeriod.nombre}` : "Asocia grupos, materias y docentes"}
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
                    activePeriodId={activePeriod?.id}
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
                existingLoads={loadData}
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

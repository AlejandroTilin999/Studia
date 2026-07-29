import { useState, useMemo } from 'react';
import { useForm, router, Deferred } from '@inertiajs/react';
import { FileSpreadsheet, Layers, Plus, Search, Home, BookOpen } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import SpecialtyTable from './components/SpecialtyTable';
import SpecialtyFormModal from './components/SpecialtyFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useExportPDF } from '@/hooks/useExportPDF';
import { specialtyService } from './services/specialtyService';
import { SpecialtiesIndexProps, Specialty } from './types';
import DotsLoader from '@/Components/ui/DotsLoader';

export default function SpecialtiesIndex({ especialidades, specialtyDistribution, filters = { search: '' } }: any) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);

    const { triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    const { data, setData, post, put, reset, processing, errors, clearErrors } = useForm({
        nombre: '',
        codigo: '',
    });

    const handleExportExcel = () => {
        const headers = ["Código / Abreviación", "Nombre de la Especialidad"];
        const rows = filteredSpecialties.map(s => [
            s.codigo,
            s.nombre
        ]);

        exportToExcel(
            "Reporte de Especialidades - PrepaHid",
            "Especialidades",
            headers,
            rows,
            "reporte_especialidades",
            (msg) => SwalHelper.success("¡Listado de Especialidades!", "El reporte de especialidades se ha generado correctamente.")
        );
    };

    const handleExportPDF = () => {
        const headers = ["Código / Abreviación", "Nombre de la Especialidad"];
        const rows = filteredSpecialties.map(s => [
            s.codigo,
            s.nombre
        ]);

        exportToPDF("Catálogo de Especialidades y Carreras", headers, rows, "reporte_especialidades");
    };

    const filteredSpecialties = (especialidades || []).filter(s =>
        (s.nombre?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (s.codigo?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (specialty: Specialty) => {
        clearErrors();
        setSelectedSpecialty(specialty);
        setData({
            nombre: specialty.nombre,
            codigo: specialty.codigo,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        SwalHelper.loading('Registrando especialidad...', 'Guardando datos en el servidor');

        post('/admin/especialidades', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                SwalHelper.success('¡Hecho!', 'La especialidad ha sido registrada correctamente.');
            },
            onError: () => {
                SwalHelper.error('Error de validación', 'Por favor revisa los campos.');
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSpecialty) {
            SwalHelper.loading('Actualizando especialidad...', 'Procesando cambios');

            put(`/admin/especialidades/${selectedSpecialty.id}`, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    SwalHelper.success('¡Actualizado!', 'Los datos han sido guardados.');
                },
                onError: () => {
                    SwalHelper.error('Error', 'No se pudieron guardar los cambios.');
                },
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        SwalHelper.confirm(
            '¿Eliminar Especialidad?',
            `¿Estás seguro de que deseas eliminar "${name}"? Esta acción no se puede deshacer.`,
            'Sí, Eliminar',
            'Cancelar',
            'error'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Eliminando...', 'Borrando registro del servidor');
                specialtyService.destroy(id, {
                    onSuccess: () => {
                        SwalHelper.success('¡Eliminado!', 'La especialidad ha sido removida.');
                    },
                    onError: (err: any) => {
                        SwalHelper.error('Error', err.delete || 'No se pudo eliminar la especialidad.');
                    }
                });
            }
        });
    };

    const totalSpecialtiesCount = useMemo(() => (especialidades === null || especialidades === undefined) ? null : especialidades.length, [especialidades]);
    const linkedSpecialtiesCount = useMemo(() => (especialidades === null || especialidades === undefined) ? null : especialidades.filter((s: any) => s.courses_count > 0).length, [especialidades]);
    const unlinkedSpecialtiesCount = useMemo(() => (especialidades === null || especialidades === undefined) ? null : especialidades.filter((s: any) => s.courses_count === 0).length, [especialidades]);

    const isDataLoading = especialidades === undefined;

    return (
        <AdminPageLayout
            headTitle="Gestión de Especialidades"
            title="Gestión de especialidades"
            subtitle="Consulta, edita y registra especialidades y carreras técnicas"
            breadcrumb="Especialidades"
            isLoading={isDataLoading}
            metrics={[
                { code: "T1", label: "Especialidades totales", value: totalSpecialtiesCount },
                { code: "T4", label: "Con materias", value: linkedSpecialtiesCount }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: RiFileExcel2Fill },
                { label: "Exportar listado (PDF)", onClick: handleExportPDF, icon: FaFilePdf },
                { label: "Panel de Control", onClick: () => router.visit(route('admin.dashboard')), icon: Home },
                { label: "Catálogo de Materias", onClick: () => router.visit(route('admin.materias.index')), icon: BookOpen }
            ]}
            donutChartTitle="Estado del Catálogo"
            donutChartLabel="especialidades"
            donutChartSegments={[
                { name: "Con materias", count: linkedSpecialtiesCount || 0, color: "#0266E0", bulletClass: "bg-[#0266E0]" },
                { name: "Sin materias", count: unlinkedSpecialtiesCount || 0, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
                <div className="relative flex-1 w-full text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar especialidad por nombre o código..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-11 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-[#1e88e5] focus:outline-none focus:ring-0 shadow-sm text-slate-700 placeholder-slate-450 transition-colors"
                    />
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="bg-[#0266E0] hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-lg w-full md:w-auto text-sm transition-all shadow-none flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Registrar especialidad
                </button>
            </div>

            {/* Table */}
            <Deferred data="especialidades" fallback={
                <DotsLoader
                    label="Cargando especialidades"
                    sublabel="Por favor espera un momento..."
                />
            }>
                <SpecialtyTable
                    specialties={filteredSpecialties}
                    onOpenEditModal={openEditModal}
                    onDelete={handleDelete}
                />
            </Deferred>

            {/* Create Modal */}
            <SpecialtyFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    clearErrors();
                    setIsCreateModalOpen(false);
                }}
                mode="create"
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleCreateSubmit}
            />

            {/* Edit Modal */}
            <SpecialtyFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    clearErrors();
                    setIsEditModalOpen(false);
                }}
                mode="edit"
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleEditSubmit}
            />
        </AdminPageLayout>
    );
}

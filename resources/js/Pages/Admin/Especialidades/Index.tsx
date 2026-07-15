import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Download, Layers, Plus, Search } from 'lucide-react';
import SpecialtyTable from './components/SpecialtyTable';
import SpecialtyFormModal from './components/SpecialtyFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { specialtyService } from './services/specialtyService';
import { SpecialtiesIndexProps, Specialty } from './types';

export default function SpecialtiesIndex({ specialties = [] }: SpecialtiesIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    const { data, setData, post, put, reset, processing, errors, clearErrors } = useForm({
        name: '',
        code: '',
    });

    const handleExportExcel = () => {
        const headers = ["Código / Abreviación", "Nombre de la Especialidad"];
        const rows = filteredSpecialties.map(s => [
            s.code,
            s.name
        ]);

        exportToExcel(
            "Reporte de Especialidades - PrepaHid",
            "Especialidades",
            headers,
            rows,
            "reporte_especialidades",
            (msg) => triggerToast("Reporte de especialidades exportado a Excel con éxito.")
        );
    };

    const filteredSpecialties = specialties.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase())
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
            name: specialty.name,
            code: specialty.code,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');

        post('/admin/especialidades', {
            onSuccess: (page) => {
                if (page.props.errors && Object.keys(page.props.errors).length > 0) {
                    setSaveStatus('error');
                    setTimeout(() => {
                        setSaveStatus('idle');
                    }, 2500);
                    return;
                }
                setSaveStatus('success');
                reset();
                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setSaveStatus('idle');
                    triggerToast("Especialidad registrada con éxito.");
                }, 2000);
            },
            onError: () => {
                setSaveStatus('error');
                setTimeout(() => {
                    setSaveStatus('idle');
                }, 2500);
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSpecialty) {
            setSaveStatus('saving');

            put(`/admin/especialidades/${selectedSpecialty.id}`, {
                onSuccess: (page) => {
                    if (page.props.errors && Object.keys(page.props.errors).length > 0) {
                        setSaveStatus('error');
                        setTimeout(() => {
                            setSaveStatus('idle');
                        }, 2500);
                        return;
                    }
                    setSaveStatus('success');
                    reset();
                    setTimeout(() => {
                        setIsEditModalOpen(false);
                        setSaveStatus('idle');
                        triggerToast("Especialidad actualizada con éxito.");
                    }, 2000);
                },
                onError: () => {
                    setSaveStatus('error');
                    setTimeout(() => {
                        setSaveStatus('idle');
                    }, 2500);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta especialidad?')) {
            specialtyService.destroy(id, {
                onSuccess: () => {
                    triggerToast("Especialidad eliminada con éxito.");
                },
            });
        }
    };

    const totalSpecialtiesCount = specialties.length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Especialidades"
            title={`Gestión de Especialidades (${totalSpecialtiesCount})`}
            subtitle="Consulta, edita y registra especialidades y carreras técnicas"
            breadcrumb="Especialidades"
            toastMessage={toastMessage}
            metrics={[
                { code: "E1", label: "Especialidades", value: totalSpecialtiesCount }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download },
                { label: "Gestionar grupos", onClick: () => router.visit('/admin/grupos'), icon: Layers }
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
            <SpecialtyTable
                specialties={filteredSpecialties}
                onOpenEditModal={openEditModal}
                onDelete={handleDelete}
            />

            {/* Create Modal */}
            <SpecialtyFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        clearErrors();
                        setIsCreateModalOpen(false);
                    }
                }}
                mode="create"
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleCreateSubmit}
                saveStatus={saveStatus}
            />

            {/* Edit Modal */}
            <SpecialtyFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        clearErrors();
                        setIsEditModalOpen(false);
                    }
                }}
                mode="edit"
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleEditSubmit}
                saveStatus={saveStatus}
            />
        </AdminPageLayout>
    );
}

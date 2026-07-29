import { useState, useEffect, useMemo } from 'react';
import { useForm, router, Deferred } from '@inertiajs/react';
import { FileSpreadsheet, Layers, Users, Home } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import DotsLoader from '@/Components/ui/DotsLoader';
import GroupTable from './components/GroupTable';
import GroupTableControls from './components/GroupTableControls';
import GroupFormModal from './components/GroupFormModal';
import PromotionModal from './components/PromotionModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import axios from 'axios';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useExportPDF } from '@/hooks/useExportPDF';
import { groupService } from './services/groupService';
import { GruposIndexProps, GroupFormatted } from './types';

export default function GruposIndex({
    grupos,
    profesores = [],
    materias = [],
    especialidades = [],
    cycles = [],
    filters = { search: '' },
    isCycleActive,
    canRegister
}: any) {
    // [OPTIMIZACIÓN v2.3] Soportar paginación y búsqueda en servidor
    const groupDataList = useMemo(() => {
        if (Array.isArray(grupos)) return grupos;
        return grupos?.data || [];
    }, [grupos]);

    const formattedGroups: GroupFormatted[] = useMemo(() => groupDataList.map((g: any) => ({
        id: g.id,
        code: g.codigo || 'S/C',
        name: g.nombre || 'Sin nombre',
        semestre: g.semestre || 1,
        generacion: g.generacion || 'N/A',
        shift: g.turno || 'Matutino',
        teacherName: g.profesor || 'Pendiente de Asignación',
        teacher_id: (g as any).docente_tutor_id,
        specialty: g.especialidad || 'General',
        activo: g.activo ?? true
    })), [groupDataList]);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                router.get(window.location.pathname, {
                    search: searchQuery
                }, {
                    preserveState: true,
                    replace: true,
                    only: ['grupos']
                });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupFormatted | null>(null);
    const [isProcessingPromote, setIsPromoteProcessing] = useState(false);

    const { triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    // Formulario reactivo de Inertia (Nombres en Español)
    const { data, setData, post, put, reset, processing, errors, clearErrors } = useForm({
        codigo: '',
        nombre: '',
        turno: 'Matutino',
        semestre: 1,
        generacion: '',
        especialidad: '',
        docente_tutor_id: '' as string | number,
        activo: true
    });

    const handleExportExcel = () => {
        const headers = ["Código", "Nombre del Grupo", "Turno", "Especialidad"];
        const rows = filteredGroups.map(g => [
            g.code,
            g.name,
            g.shift,
            g.specialty
        ]);

        exportToExcel(
            "Reporte de Grupos Académicos - PrepaHid",
            "Grupos Escolares",
            headers,
            rows,
            "reporte_grupos",
            (msg) => SwalHelper.success("¡Listado de Grupos!", "El reporte de grupos académicos se ha generado correctamente.")
        );
    };

    const handleExportPDF = () => {
        const headers = ["Código", "Nombre del Grupo", "Turno", "Especialidad", "Tutor"];
        const rows = filteredGroups.map(g => [
            g.code,
            g.name,
            g.shift,
            g.specialty,
            g.teacherName
        ]);

        exportToPDF("Reporte de Grupos Académicos", headers, rows, "reporte_grupos");
    };

    const filteredGroups = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return formattedGroups.filter(g => {
            const matchesSearch = (g.name?.toLowerCase() || '').includes(query) ||
                (g.code?.toLowerCase() || '').includes(query) ||
                (g.teacherName?.toLowerCase() || '').includes(query);
            const matchesSpecialty = specialtyFilter === 'all' || g.specialty === specialtyFilter;
            return matchesSearch && matchesSpecialty;
        });
    }, [formattedGroups, searchQuery, specialtyFilter]);

    const openCreateModal = () => {
        if (!especialidades || especialidades.length === 0) {
            SwalHelper.alert(
                'Sin Especialidades',
                'No puedes registrar un grupo porque no hay especialidades o carreras técnicas registradas en el sistema. Por favor, agrega al menos una primero.',
                'warning'
            );
            return;
        }
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (group: GroupFormatted) => {
        clearErrors();
        setSelectedGroup(group);
        setData({
            codigo: group.code,
            nombre: group.name,
            turno: group.shift,
            semestre: group.semestre ?? 1,
            generacion: group.generacion ?? '',
            especialidad: group.specialty,
            docente_tutor_id: group.teacher_id ?? '',
            activo: group.activo ?? true
        } as any);
        setIsEditModalOpen(true);
    };

    const handleDeleteGroup = (id: number, name: string) => {
        SwalHelper.confirm(
            '¿Eliminar Grupo?',
            `¿Estás seguro de que deseas eliminar el grupo "${name}"? Esta acción no se puede deshacer.`,
            'Sí, Eliminar',
            'Cancelar',
            'error'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Eliminando...', 'Borrando grupo del sistema escolar');
                groupService.destroy(id, {
                    onSuccess: () => {
                        SwalHelper.success('¡Eliminado!', 'El grupo ha sido removido correctamente.');
                    },
                    onError: (err: any) => {
                        SwalHelper.error('Error', err.delete || 'No se pudo eliminar el grupo (podría tener alumnos inscritos).');
                    }
                });
            }
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        SwalHelper.loading('Registrando grupo...', 'Guardando datos en el servidor');
        post('/admin/grupos', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                SwalHelper.success('¡Hecho!', 'El grupo ha sido registrado correctamente.');
            },
            onError: () => {
                SwalHelper.error('Error de validación', 'Por favor revisa los campos.');
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGroup) {
            SwalHelper.loading('Actualizando grupo...', 'Procesando cambios');
            put(`/admin/grupos/${selectedGroup.id}`, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    SwalHelper.success('¡Actualizado!', 'Los datos del grupo han sido guardados.');
                },
                onError: () => {
                    SwalHelper.error('Error', 'No se pudieron guardar los cambios.');
                },
            });
        }
    };

    const handlePromoteSubmit = async (promoteData: any) => {
        setIsPromoteProcessing(true);
        SwalHelper.loading("Procesando Promoción", "Generando nuevas inscripciones y actualizando historial...");

        try {
            await axios.post(route('admin.promociones.promote'), promoteData);
            SwalHelper.success("¡Promoción Exitosa!", "Los alumnos han sido movidos al nuevo nivel académico.");
            setIsPromoteModalOpen(false);
            router.reload();
        } catch (error: any) {
            console.error(error);
            SwalHelper.error("Error", error.response?.data?.error || "No se pudo procesar la promoción.");
        } finally {
            setIsPromoteProcessing(false);
        }
    };

    const totalGroupsCount = useMemo(() => (grupos === null || grupos === undefined ? null : (Array.isArray(grupos) ? grupos.length : grupos?.total || 0)), [grupos]);
    const assignedGroupsCount = useMemo(() => (grupos === null || grupos === undefined) ? null : formattedGroups.filter(g => g.teacherName !== 'Pendiente de Asignación').length, [formattedGroups, grupos]);


    return (
        <AdminPageLayout
            headTitle="Gestión de Grupos"
            title="Gestión de grupos"
            subtitle="Consulta, edita y registra grupos académicos y tutores"
            breadcrumb="Grupos"
            isLoading={grupos === null || grupos === undefined}
            metrics={[
                { code: "T1", label: "Grupos totales", value: totalGroupsCount },
                { code: "T4", label: "Asignados", value: assignedGroupsCount }
            ]}

            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: RiFileExcel2Fill },
                { label: "Exportar listado (PDF)", onClick: handleExportPDF, icon: FaFilePdf },
                { label: "Panel de Control", onClick: () => router.visit(route('admin.dashboard')), icon: Home },
                { label: "Control de Alumnos", onClick: () => router.visit(route('admin.alumnos.index')), icon: Users }
            ]}
            donutChartLabel="grupos"
            donutChartSegments={[
                { name: "Asignados", count: formattedGroups.filter(g => g.teacherName !== 'Pendiente de Asignación').length, color: "#0266E0", bulletClass: "bg-[#0266E0]" },
                { name: "Sin tutor", count: formattedGroups.filter(g => g.teacherName === 'Pendiente de Asignación').length, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {!isCycleActive && canRegister && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest leading-none mb-1">Modo Planeación</p>
                        <p className="text-[11px] text-blue-700 font-medium">Configurando el próximo periodo escolar. Puedes registrar grupos y estructurar la oferta académica, pero el ciclo aún no está vigente.</p>
                    </div>
                </div>
            )}

            {!canRegister && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">Modo Solo Catálogo</p>
                        <p className="text-[11px] text-amber-700 font-medium">No existe un Ciclo Escolar activo ni en planeación. La creación de grupos y gestión de semestres está restringida.</p>
                    </div>
                    <button
                        onClick={() => router.visit(route('admin.dashboard'))}
                        className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-all shrink-0"
                    >
                        Crear Ciclo
                    </button>
                </div>
            )}

            <GroupTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                specialtyFilter={specialtyFilter}
                setSpecialtyFilter={setSpecialtyFilter}
                onOpenCreateModal={openCreateModal}
                specialties={especialidades}
                isCycleActive={canRegister}
            />

            <Deferred data="grupos" fallback={
                <DotsLoader
                    label="Cargando grupos"
                    sublabel="Por favor espera un momento..."
                />
            }>
                <GroupTable
                    groups={filteredGroups}
                    onOpenEditModal={openEditModal}
                    onOpenPromoteModal={(group) => {
                        setSelectedGroup(group);
                        setIsPromoteModalOpen(true);
                    }}
                    onDelete={handleDeleteGroup}
                />
            </Deferred>

            <PromotionModal
                isOpen={isPromoteModalOpen}
                onClose={() => setIsPromoteModalOpen(false)}
                sourceGroup={selectedGroup}
                cycles={cycles}
                groups={formattedGroups}
                onConfirm={handlePromoteSubmit}
                processing={isProcessingPromote}
            />

            <GroupFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    clearErrors();
                    setIsCreateModalOpen(false);
                }}
                mode="create"
                group={null}
                profesores={profesores}
                specialties={especialidades}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleCreateSubmit}
            />

            <GroupFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                }}
                mode="edit"
                group={selectedGroup}
                profesores={profesores}
                specialties={especialidades}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleEditSubmit}
            />
        </AdminPageLayout>
    );
}

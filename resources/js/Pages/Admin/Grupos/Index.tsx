import { useState } from 'react';
import { useForm, router, Deferred } from '@inertiajs/react';
import { FileSpreadsheet, Layers, Users } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import DotsLoader from '@/Components/ui/DotsLoader';
import GroupTable from './components/GroupTable';
import GroupTableControls from './components/GroupTableControls';
import GroupFormModal from './components/GroupFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useExportPDF } from '@/hooks/useExportPDF';
import { groupService } from './services/groupService';
import { GruposIndexProps, GroupFormatted } from './types';

export default function GruposIndex({
    grupos = [],
    profesores = [],
    materias = [],
    especialidades = []
}: GruposIndexProps) {
    const formattedGroups: GroupFormatted[] = (grupos || []).map(g => ({
        id: g.id,
        code: g.codigo || 'S/C',
        name: g.nombre || 'Sin nombre',
        shift: g.turno || 'Matutino',
        teacherName: g.profesor || 'Pendiente de Asignación',
        teacher_id: g.docente_tutor_id,
        specialty: g.especialidad || 'General',
        activo: g.activo ?? true
    }));

    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupFormatted | null>(null);

    const { triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    // Formulario reactivo de Inertia (Nombres en Español)
    const { data, setData, post, put, reset, processing, errors, clearErrors } = useForm({
        codigo: '',
        nombre: '',
        turno: 'Matutino',
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

    const filteredGroups = filteredGroupsList(formattedGroups, searchQuery, specialtyFilter);

    function filteredGroupsList(list: GroupFormatted[], search: string, filter: string) {
        const query = search.toLowerCase();
        return list.filter(g => {
            const matchesSearch = (g.name?.toLowerCase() || '').includes(query) ||
                (g.code?.toLowerCase() || '').includes(query) ||
                (g.teacherName?.toLowerCase() || '').includes(query);
            const matchesSpecialty = filter === 'all' || g.specialty === filter;
            return matchesSearch && matchesSpecialty;
        });
    }

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

    const totalGroupsCount = formattedGroups.length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Grupos"
            title="Gestión de grupos"
            subtitle="Consulta, edita y registra grupos académicos y tutores"
            breadcrumb="Grupos"
            isLoading={grupos.length === 0}
            metrics={[
                { code: "T1", label: "Grupos totales", value: grupos.length > 0 ? totalGroupsCount : null },
                { code: "T4", label: "Asignados", value: grupos.length > 0 ? formattedGroups.filter(g => g.teacherName !== 'Pendiente de Asignación').length : null }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: RiFileExcel2Fill },
                { label: "Exportar listado (PDF)", onClick: handleExportPDF, icon: FaFilePdf },
                { label: "Gestionar materias", onClick: () => router.visit('/admin/materias'), icon: Layers },
                { label: "Gestionar profesores", onClick: () => router.visit('/admin/docentes'), icon: Users }
            ]}
            donutChartLabel="grupos"
            donutChartSegments={[
                { name: "Asignados", count: formattedGroups.filter(g => g.teacherName !== 'Pendiente de Asignación').length, color: "#0266E0", bulletClass: "bg-[#0266E0]" },
                { name: "Sin tutor", count: formattedGroups.filter(g => g.teacherName === 'Pendiente de Asignación').length, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            <GroupTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                specialtyFilter={specialtyFilter}
                setGroupFilter={setSpecialtyFilter}
                onOpenCreateModal={openCreateModal}
                specialties={especialidades}
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
                    onDelete={handleDeleteGroup}
                />
            </Deferred>

            <GroupFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    clearErrors();
                    setIsCreateModalOpen(false);
                }}
                mode="create"
                group={null}
                profesores={profesores}
                materiasList={materias}
                specialties={especialidades}
                groupsList={formattedGroups}
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
                materiasList={materias}
                specialties={especialidades}
                groupsList={formattedGroups}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleEditSubmit}
            />
        </AdminPageLayout>
    );
}

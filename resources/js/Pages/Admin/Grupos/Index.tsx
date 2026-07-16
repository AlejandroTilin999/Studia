import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Download, Layers, Users } from 'lucide-react';
import GroupTable from './components/GroupTable';
import GroupTableControls from './components/GroupTableControls';
import GroupFormModal from './components/GroupFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { groupService } from './services/groupService';
import { GruposIndexProps, GroupFormatted } from './types';

export default function GruposIndex({
    grupos = [],
    profesores = [],
    materias = [],
    especialidades = [],
    turnos = []
}: GruposIndexProps) {
    const formattedGroups: GroupFormatted[] = (grupos || []).map(g => ({
        id: g.id,
        code: g.codigo || 'S/C',
        name: g.nombre || 'Sin nombre',
        shift: g.turno || 'Horario único',
        teacherName: g.profesor || 'Pendiente de Asignación',
        teacher_id: g.tutor_teacher_id,
        specialty: g.especialidad === 'TI' ? 'Informática' : (g.especialidad || 'General'),
        turno_id: g.turno_id ?? '',
        activo: g.activo ?? true
    }));

    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupFormatted | null>(null);

    const { triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    // Formulario reactivo de Inertia
    const { data, setData, post, put, reset, processing, errors, clearErrors } = useForm({
        code: '',
        name: '',
        shift: 'Matutino',
        major: '',
        tutor_teacher_id: '' as string | number,
        linked_courses: [] as number[],
        turno_id: '' as string | number,
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
            (msg) => triggerToast("Reporte de grupos exportado a Excel con éxito.")
        );
    };

    const filteredGroups = filteredGroupsList(formattedGroups, searchQuery, specialtyFilter);

    function filteredGroupsList(list: GroupFormatted[], search: string, filter: string) {
        return list.filter(g => {
            const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
                g.code.toLowerCase().includes(search.toLowerCase()) ||
                g.teacherName.toLowerCase().includes(search.toLowerCase());
            const matchesSpecialty = filter === 'all' || g.specialty === filter;
            return matchesSearch && matchesSpecialty;
        });
    }

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (group: GroupFormatted) => {
        const rawGroup = grupos.find(g => g.id === group.id);
        clearErrors();
        setSelectedGroup(group);
        setData({
            code: group.code,
            name: group.name,
            shift: group.shift,
            major: group.specialty,
            tutor_teacher_id: group.teacher_id ?? '',
            linked_courses: rawGroup?.linked_courses || [],
            turno_id: group.turno_id ?? '',
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
    const shiftCount = Array.from(new Set(formattedGroups.map(g => g.shift))).length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Grupos"
            title={`Gestión de grupos (${totalGroupsCount})`}
            subtitle="Consulta, edita y registra grupos académicos y tutores"
            breadcrumb="Grupos"
            metrics={[
                { code: "T1", label: "Grupos totales", value: totalGroupsCount },
                { code: "T3", label: "Turnos", value: shiftCount },
                { code: "T4", label: "Asignados", value: formattedGroups.filter(g => g.teacherName !== 'Pendiente de Asignación').length }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download },
                { label: "Gestionar materias", onClick: () => router.visit('/admin/materias'), icon: Layers },
                { label: "Gestionar profesores", onClick: () => router.visit('/admin/docentes'), icon: Users }
            ]}
            donutChartLabel="grupos"
            donutChartSegments={[
                { name: "Asignados", count: formattedGroups.filter(g => g.teacherName !== 'Pendiente de Asignación').length, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "Sin tutor", count: formattedGroups.filter(g => g.teacherName === 'Pendiente de Asignación').length, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls */}
            <GroupTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                specialtyFilter={specialtyFilter}
                setSpecialtyFilter={setSpecialtyFilter}
                onOpenCreateModal={openCreateModal}
                specialties={especialidades}
            />

            {/* Table */}
            <GroupTable
                groups={filteredGroups}
                onOpenEditModal={openEditModal}
                onDelete={handleDeleteGroup}
            />

            {/* Create Modal */}
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
                turnos={turnos}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleCreateSubmit}
            />

            {/* Edit Modal */}
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
                turnos={turnos}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleEditSubmit}
            />
        </AdminPageLayout>
    );
}

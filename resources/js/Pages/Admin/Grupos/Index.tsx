import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Download, Layers, Users } from 'lucide-react';
import GroupTable from './components/GroupTable';
import GroupTableControls from './components/GroupTableControls';
import GroupFormModal from './components/GroupFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { groupService } from './services/groupService';
import { GruposIndexProps, GroupFormatted } from './types';

export default function GruposIndex({ grupos = [], profesores = [], materias = [], especialidades = [], planes = [], turnos = [] }: GruposIndexProps) {
    const formattedGroups: GroupFormatted[] = grupos.map(g => ({
        id: g.id,
        code: g.codigo || 'S/C',
        name: g.nombre || 'Sin nombre',
        shift: g.turno || 'Horario único',
        teacherName: g.profesor || 'Pendiente de Asignación',
        teacher_id: g.tutor_teacher_id,
        specialty: g.especialidad === 'TI' ? 'Informática' : (g.especialidad || (especialidades[0]?.name || 'Informática')),
        plan_id: g.plan_id ?? '',
        plan_nombre: g.plan_nombre || 'Sin plan de estudios',
        turno_id: g.turno_id ?? '',
        activo: g.activo ?? true
    }));

    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupFormatted | null>(null);
    
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    // Formulario reactivo de Inertia
    const { data, setData, post, put, reset, processing, errors, clearErrors } = useForm({
        code: '',
        name: '',
        shift: 'Horario único',
        major: especialidades[0]?.name || 'Informática',
        tutor_teacher_id: '' as string | number,
        linked_courses: [] as number[],
        plan_id: '' as string | number,
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
        reset();
        clearErrors();
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
            plan_id: group.plan_id ?? '',
            turno_id: group.turno_id ?? '',
            activo: group.activo ?? true
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');

        post('/admin/grupos', {
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
        if (selectedGroup) {
            setSaveStatus('saving');
            put(`/admin/grupos/${selectedGroup.id}`, {
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

    const totalGroupsCount = formattedGroups.length;
    const shiftCount = Array.from(new Set(formattedGroups.map(g => g.shift))).length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Grupos"
            title={`Gestión de grupos (${totalGroupsCount})`}
            subtitle="Consulta, edita y registra grupos académicos y tutores"
            breadcrumb="Grupos"
            toastMessage={toastMessage}
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
            />

            {/* Create Modal */}
            <GroupFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        clearErrors();
                        setIsCreateModalOpen(false);
                    }
                }}
                mode="create"
                group={null}
                profesores={profesores}
                materiasList={materias}
                specialties={especialidades}
                groupsList={formattedGroups}
                planes={planes}
                turnos={turnos}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleCreateSubmit}
                saveStatus={saveStatus}
            />

            {/* Edit Modal */}
            <GroupFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        clearErrors();
                        setIsEditModalOpen(false);
                    }
                }}
                mode="edit"
                group={selectedGroup}
                profesores={profesores}
                materiasList={materias}
                specialties={especialidades}
                groupsList={formattedGroups}
                planes={planes}
                turnos={turnos}
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

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

export default function GruposIndex({ grupos = [], profesores = [], materias = [] }: GruposIndexProps) {
    const formattedGroups: GroupFormatted[] = grupos.map(g => ({
        id: g.id,
        code: g.codigo || 'S/C',
        name: g.nombre || 'Sin nombre',
        shift: g.turno || 'Horario único',
        teacherName: g.profesor || 'Pendiente de Asignación',
        teacher_id: g.teacher_id,
        specialty: g.especialidad || 'TI'
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
    const { data, setData, post, put, reset, processing, errors } = useForm({
        code: '',
        name: '',
        shift: 'Horario único',
        specialty: 'TI',
        teacher_id: '' as string | number,
        linked_courses: [] as number[]
    });

    const handleExportExcel = () => {
        const headers = ["Código", "Nombre del Grupo", "Turno", "Tutor / Profesor Asignado", "Especialidad"];
        const rows = filteredGroups.map(g => [
            g.code,
            g.name,
            g.shift,
            g.teacherName,
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

    const filteredGroups = formattedGroups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = specialtyFilter === 'all' || g.specialty === specialtyFilter;
        return matchesSearch && matchesSpecialty;
    });

    const openCreateModal = () => {
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (group: GroupFormatted) => {
        const rawGroup = grupos.find(g => g.id === group.id);
        setSelectedGroup(group);
        setData({
            code: group.code,
            name: group.name,
            shift: group.shift,
            specialty: group.specialty,
            teacher_id: group.teacher_id ?? '',
            linked_courses: rawGroup?.linked_courses || []
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');

        groupService.store(data, {
            onSuccess: () => {
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
            onFinish: () => {
                setSaveStatus(current => {
                    if (current === 'saving') {
                        setTimeout(() => setSaveStatus('idle'), 3000);
                        return 'error';
                    }
                    return current;
                });
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGroup) {
            setSaveStatus('saving');
            groupService.update(selectedGroup.id, data, {
                onSuccess: () => {
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
                onFinish: () => {
                    setSaveStatus(current => {
                        if (current === 'saving') {
                            setTimeout(() => setSaveStatus('idle'), 3000);
                            return 'error';
                        }
                        return current;
                    });
                }
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
                        setIsCreateModalOpen(false);
                    }
                }}
                mode="create"
                group={null}
                profesores={profesores}
                materiasList={materias}
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
                        setIsEditModalOpen(false);
                    }
                }}
                mode="edit"
                group={selectedGroup}
                profesores={profesores}
                materiasList={materias}
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

import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import GroupTable from './GroupTable';
import GroupTableControls from './GroupTableControls';
import GroupFormModal from './GroupFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';

interface GrupoBackend {
    id: number;
    codigo: string;
    nombre: string;
    turno: string;
    especialidad: string;
    teacher_id: number | null;
    profesor: string;
}

interface ProfesorSelect {
    id: number;
    nombre_completo: string;
}

interface GruposIndexProps {
    grupos?: GrupoBackend[];
    profesores?: ProfesorSelect[];
}

export default function GruposIndex({ grupos = [], profesores = [] }: GruposIndexProps) {
    const formattedGroups = grupos.map(g => ({
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Formulario reactivo de Inertia
    const { data, setData, post, put, reset, processing, errors } = useForm({
        code: '',
        name: '',
        shift: 'Horario único',
        specialty: 'TI',
        teacher_id: '' as string | number
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
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

    const openEditModal = (group: any) => {
        setSelectedGroup(group);
        setData({
            code: group.code,
            name: group.name,
            shift: group.shift,
            specialty: group.specialty,
            teacher_id: group.teacher_id ?? ''
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('groups.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                triggerToast(`Grupo creado correctamente.`);
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGroup) {
            put(route('groups.update', selectedGroup.id), {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    triggerToast(`Grupo actualizado correctamente.`);
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
                { label: "Registrar grupo", onClick: openCreateModal }
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
            />

            {/* Table */}
            <GroupTable
                groups={filteredGroups}
                onOpenEditModal={openEditModal}
            />

            {/* Create Modal */}
            <GroupFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode="create"
                group={null}
                profesores={profesores}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleCreateSubmit}
            />

            {/* Edit Modal */}
            <GroupFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                group={selectedGroup}
                profesores={profesores}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleEditSubmit}
            />
        </AdminPageLayout>
    );
}

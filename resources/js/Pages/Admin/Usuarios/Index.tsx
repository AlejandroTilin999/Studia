import { useState } from 'react';
import { router } from '@inertiajs/react';
import { GraduationCap, Users, FileText } from 'lucide-react';
import UserTable, { MockUser } from './UserTable';
import UserTableControls from './UserTableControls';
import UserFormModal from './UserFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';

interface UsersIndexProps {
    dbUsers?: MockUser[];
}

export default function UsersIndex({ dbUsers = [] }: UsersIndexProps) {
    // 2. Control de filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // 3. Modales de agregar/editar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

    // Filtrar usuarios
    const filteredUsers = dbUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Abrir modal de creación
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    // Abrir modal de edición
    const openEditModal = (user: MockUser) => {
        setModalMode('edit');
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // Guardar formulario
    const handleFormSubmit = (formData: any) => {
        SwalHelper.loading(
            modalMode === 'create' ? 'Creando usuario...' : 'Actualizando datos...',
            'Procesando en el servidor'
        );

        if (modalMode === 'create') {
            router.post('/admin/usuarios', {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                password: formData.password || 'Prepahid2026',
                phone: formData.phone
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    SwalHelper.success('¡Hecho!', 'El usuario ha sido registrado con éxito.');
                },
                onError: (errs) => {
                    SwalHelper.error('Error', 'No se pudo registrar al usuario.');
                }
            });
        } else if (modalMode === 'edit' && selectedUser) {
            router.put(`/admin/usuarios/${selectedUser.id}`, {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                phone: formData.phone
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    SwalHelper.success('¡Actualizado!', 'Los datos del usuario han sido actualizados.');
                },
                onError: (errs) => {
                    SwalHelper.error('Error', 'No se pudieron actualizar los datos.');
                }
            });
        }
    };

    // Alternar estado activo/inactivo
    const toggleStatus = (user: MockUser) => {
        const isActivating = user.status !== 'active';

        SwalHelper.confirm(
            isActivating ? '¿Activar Cuenta?' : '¿Desactivar Cuenta?',
            `¿Estás seguro de que deseas ${isActivating ? 'activar' : 'suspender'} el acceso de ${user.name}?`,
            isActivating ? 'Sí, Activar' : 'Sí, Suspender',
            'Cancelar',
            isActivating ? 'info' : 'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Procesando...', 'Cambiando estado de cuenta.');
                router.post(`/admin/usuarios/${user.id}/toggle`, {}, {
                    onSuccess: () => {
                        SwalHelper.success('¡Completado!', `La cuenta ha sido ${isActivating ? 'activada' : 'desactivada'}.`);
                    },
                    onError: () => {
                        SwalHelper.error('Error', 'No se pudo cambiar el estado de la cuenta.');
                    }
                });
            }
        });
    };

    // Simular restablecimiento de contraseña
    const handleResetPassword = (user: MockUser) => {
        SwalHelper.confirm(
            '¿Restablecer Contraseña?',
            `Se cambiará la contraseña de ${user.name} a la predeterminada (Prepahid2026).`,
            'Sí, Restablecer',
            'No, Cancelar',
            'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Restableciendo...', 'Generando nueva clave temporal.');
                router.post(`/admin/usuarios/${user.id}/reset-password`, {}, {
                    onSuccess: () => {
                        SwalHelper.success('¡Contraseña Cambiada!', 'Se ha enviado la nueva clave al usuario.');
                    },
                    onError: () => {
                        SwalHelper.error('Error', 'No se pudo restablecer la contraseña.');
                    }
                });
            }
        });
    };

    // Estadísticas
    const totalCount = dbUsers.length;
    const adminCount = dbUsers.filter(u => u.role?.toLowerCase() === 'admin').length;
    const teacherCount = dbUsers.filter(u => u.role?.toLowerCase() === 'docente').length;
    const studentCount = dbUsers.filter(u => u.role?.toLowerCase() === 'alumno').length;
    const activeCount = dbUsers.filter(u => u.status === 'active').length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Cuentas"
            title="Gestión de Cuentas"
            subtitle="Administra los accesos y credenciales globales de PrepaHid"
            breadcrumb="Usuarios"
            metrics={[
                { code: "T1", label: "Usuarios totales", value: totalCount },
                { code: "T3", label: "Administradores", value: adminCount },
                { code: "T4", label: "Docentes", value: teacherCount },
                { code: "T2", label: "Alumnos", value: studentCount }
            ]}
            quickActions={[
                { label: "Ver docentes", onClick: () => router.visit('/admin/docentes'), icon: Users },
                { label: "Ver alumnos", onClick: () => router.visit('/admin/alumnos'), icon: GraduationCap },
                { label: "Ver reportes", onClick: () => router.visit('/admin/reportes'), icon: FileText }
            ]}
            donutChartTitle="Estado de Cuentas"
            donutChartLabel="usuarios"
            donutChartSegments={[
                { name: "Activos", count: activeCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "Inactivos", count: totalCount - activeCount, color: "#f43f5e", bulletClass: "bg-rose-500" }
            ]}
        >
            {/* Controls: Search and Actions */}
            <UserTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                onOpenCreateModal={openCreateModal}
            />

            {/* Table */}
            <UserTable
                users={filteredUsers}
                onToggleStatus={toggleStatus}
                onResetPassword={handleResetPassword}
                onOpenEditModal={openEditModal}
            />

            {/* Modal de Agregar / Editar */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                user={selectedUser}
                onSubmit={handleFormSubmit}
            />
        </AdminPageLayout>
    );
}

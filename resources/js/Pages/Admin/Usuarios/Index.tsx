import { useState } from 'react';
import { router, Deferred } from '@inertiajs/react';
import { GraduationCap, Users, FileText } from 'lucide-react';
import UserTable, { MockUser } from './UserTable';
import UserTableControls from './UserTableControls';
import UserFormModal from './UserFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import DotsLoader from '@/Components/ui/DotsLoader';

interface UsersIndexProps {
    dbUsers?: MockUser[];
}

export default function UsersIndex({ dbUsers = [] }: UsersIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

    const filteredUsers = dbUsers.filter(user => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.rol === roleFilter;
        return matchesSearch && matchesRole;
    });

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: MockUser) => {
        setModalMode('edit');
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        SwalHelper.loading(
            modalMode === 'create' ? 'Creando usuario...' : 'Actualizando datos...',
            'Procesando en el servidor'
        );

        const payload = {
            nombre: formData.nombre,
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno,
            email: formData.email,
            rol: formData.rol,
            genero: formData.genero,
            estatus: formData.estatus,
            password: formData.password || 'Prepahid2026',
            telefono: formData.telefono
        };

        if (modalMode === 'create') {
            router.post('/admin/usuarios', payload, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    SwalHelper.success('¡Hecho!', 'El usuario ha sido registrado con éxito.');
                },
                onError: (errs) => {
                    SwalHelper.error('Error', 'No se pudo registrar al usuario.');
                }
            });
        } else if (modalMode === 'edit' && selectedUser) {
            router.put(`/admin/usuarios/${selectedUser.id}`, payload, {
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

    const toggleStatus = (user: MockUser) => {
        const isActivating = user.estatus !== 'active';
        SwalHelper.confirm(
            isActivating ? '¿Activar Cuenta?' : '¿Desactivar Cuenta?',
            `¿Estás seguro de que deseas ${isActivating ? 'activar' : 'suspender'} el acceso de ${user.nombre}?`,
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

    const handleResetPassword = (user: MockUser) => {
        SwalHelper.confirm(
            '¿Restablecer Contraseña?',
            `Se cambiará la contraseña de ${user.nombre} a la predeterminada (Prepahid2026).`,
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

    const totalCount = dbUsers.length;
    const adminCount = dbUsers.filter(u => u.rol?.toLowerCase() === 'admin').length;
    const teacherCount = dbUsers.filter(u => u.rol?.toLowerCase() === 'docente').length;
    const studentCount = dbUsers.filter(u => u.rol?.toLowerCase() === 'alumno').length;
    const activeCount = dbUsers.filter(u => u.estatus === 'active').length;

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
            <UserTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                onOpenCreateModal={openCreateModal}
            />

            <Deferred data="dbUsers" fallback={
                <DotsLoader
                    label="Cargando usuarios"
                    sublabel="Por favor espera un momento..."
                />
            }>
                <UserTable
                    users={filteredUsers}
                    onToggleStatus={toggleStatus}
                    onResetPassword={handleResetPassword}
                    onOpenEditModal={openEditModal}
                />
            </Deferred>
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

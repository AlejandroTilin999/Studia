import { useState } from 'react';
import { router } from '@inertiajs/react';
import { GraduationCap, Users, FileText } from 'lucide-react';
import UserTable, { MockUser } from './UserTable';
import UserTableControls from './UserTableControls';
import UserFormModal from './UserFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';

interface UsersIndexProps {
    dbUsers?: MockUser[];
}

export default function UsersIndex({ dbUsers = [] }: UsersIndexProps) {
    // 2. Control de filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // 3. Modales de agregar/editar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

    // 4. Toasts o alertas
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

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
        setSaveStatus('saving');
        
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
                    setSaveStatus('success');
                    setTimeout(() => {
                        setIsModalOpen(false);
                        setSaveStatus('idle');
                        triggerToast('Usuario registrado con éxito.');
                    }, 1000);
                },
                onError: (errs) => {
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus('idle'), 3000);
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
                    setSaveStatus('success');
                    setTimeout(() => {
                        setIsModalOpen(false);
                        setSaveStatus('idle');
                        triggerToast('Usuario actualizado con éxito.');
                    }, 1000);
                },
                onError: (errs) => {
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus('idle'), 3000);
                }
            });
        }
    };

    // Alternar estado activo/inactivo
    const toggleStatus = (user: MockUser) => {
        router.post(`/admin/usuarios/${user.id}/toggle`, {}, {
            onSuccess: () => {
                const newStatus = user.status === 'active' ? 'INACTIVO' : 'ACTIVO';
                triggerToast(`Usuario "${user.name}" marcado como ${newStatus}.`);
            }
        });
    };

    // Simular restablecimiento de contraseña
    const handleResetPassword = (user: MockUser) => {
        router.post(`/admin/usuarios/${user.id}/reset-password`, {}, {
            onSuccess: () => {
                triggerToast(`Contraseña restablecida a Prepahid2026 para: ${user.email}`);
            }
        });
    };

    // Estadísticas
    const totalCount = dbUsers.length;
    const adminCount = dbUsers.filter(u => u.role === 'admin').length;
    const teacherCount = dbUsers.filter(u => u.role === 'docente').length;
    const studentCount = dbUsers.filter(u => u.role === 'alumno').length;
    const activeCount = dbUsers.filter(u => u.status === 'active').length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Cuentas"
            title="Gestión de Cuentas"
            subtitle="Administra los accesos y credenciales globales de PrepaHid"
            breadcrumb="Usuarios"
            toastMessage={toastMessage}
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
                onClose={() => {
                    if (saveStatus === 'idle') {
                        setIsModalOpen(false);
                    }
                }}
                mode={modalMode}
                user={selectedUser}
                onSubmit={handleFormSubmit}
                saveStatus={saveStatus}
            />
        </AdminPageLayout>
    );
}

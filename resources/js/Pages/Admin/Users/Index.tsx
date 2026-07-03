import { useState } from 'react';
import UserTable, { MockUser } from './UserTable';
import UserTableControls from './UserTableControls';
import UserFormModal from './UserFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';

export default function UsersIndex() {
    // 1. Datos simulados (mock users)
    const [users, setUsers] = useState<MockUser[]>([
        { id: 1, name: 'Director Particular Hidalgo', email: 'director@prepahidalgo.edu.mx', role: 'admin', status: 'active' },
        { id: 2, name: 'Francisco Javier Martínez', email: 'f.martinez@prepahidalgo.edu.mx', role: 'docente', status: 'active' },
        { id: 3, name: 'María Elena Rodríguez', email: 'm.rodriguez@prepahidalgo.edu.mx', role: 'docente', status: 'active' },
        { id: 4, name: 'José Eduardo Gómez', email: 'jose.gomez@alumno.prepahidalgo.edu.mx', role: 'alumno', status: 'active' },
        { id: 5, name: 'Ana Sofía López', email: 'sofia.lopez@alumno.prepahidalgo.edu.mx', role: 'alumno', status: 'active' },
        { id: 6, name: 'Ex Alumno Suspendido', email: 'suspendido@alumno.prepahidalgo.edu.mx', role: 'alumno', status: 'inactive' },
    ]);

    // 2. Control de filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // 3. Modales de agregar/editar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

    // 4. Toasts o alertas simulados
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filtrar usuarios
    const filteredUsers = users.filter(user => {
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

    // Guardar formulario (Simulación de POST/PUT)
    const handleFormSubmit = (formData: any) => {
        if (modalMode === 'create') {
            const newUser: MockUser = {
                id: Date.now(),
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status
            };
            setUsers([newUser, ...users]);
            triggerToast(`Usuario "${formData.name}" registrado correctamente.`);
        } else if (modalMode === 'edit' && selectedUser) {
            setUsers(users.map(u => u.id === selectedUser.id ? { 
                ...u, 
                name: formData.name, 
                email: formData.email, 
                role: formData.role, 
                status: formData.status 
            } : u));
            triggerToast(`Información de "${formData.name}" actualizada.`);
        }
        setIsModalOpen(false);
    };

    // Alternar estado activo/inactivo (Simulado)
    const toggleStatus = (user: MockUser) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        triggerToast(`Usuario "${user.name}" marcado como ${newStatus === 'active' ? 'ACTIVO' : 'INACTIVO'}.`);
    };

    // Simular restablecimiento de contraseña
    const handleResetPassword = (user: MockUser) => {
        triggerToast(`Se ha enviado un enlace de restauración a: ${user.email}`);
    };

    // Estadísticas
    const totalCount = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const teacherCount = users.filter(u => u.role === 'docente').length;
    const studentCount = users.filter(u => u.role === 'alumno').length;
    const activeCount = users.filter(u => u.status === 'active').length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Usuarios"
            title="Gestión de Usuarios"
            subtitle="Registra y administra los accesos al sistema escolar"
            breadcrumb="Usuarios"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Usuarios totales", value: totalCount },
                { code: "T3", label: "Administradores", value: adminCount },
                { code: "T4", label: "Docentes", value: teacherCount },
                { code: "T2", label: "Alumnos", value: studentCount }
            ]}
            quickActions={[
                { label: "Registrar Usuario", onClick: openCreateModal }
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

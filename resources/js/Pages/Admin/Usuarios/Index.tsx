import { useState } from 'react';
import { router, Deferred } from '@inertiajs/react';
import { GraduationCap, Users, FileText, Key, AlertCircle } from 'lucide-react';
import UserTable, { MockUser } from './UserTable';
import UserTableControls from './UserTableControls';
import UserFormModal from './UserFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import DotsLoader from '@/Components/ui/DotsLoader';

interface ResetRequest {
    id: number;
    nombre: string;
    email: string;
    fecha: string;
}

interface UsersIndexProps {
    dbUsers?: MockUser[];
    resetRequests?: ResetRequest[];
}

export default function UsersIndex({ dbUsers = [], resetRequests = [] }: UsersIndexProps) {
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

    const handleApproveReset = (req: ResetRequest) => {
        SwalHelper.confirm(
            '¿Aprobar Restablecimiento?',
            `Se cambiará la contraseña de ${req.nombre} a la predeterminada (Prepahid2026).`,
            'Sí, Aprobar',
            'Cancelar',
            'info'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Procesando...', 'Actualizando credenciales del usuario.');
                router.post(`/admin/usuarios/solicitudes-reset/${req.id}/aprobar`, {}, {
                    onSuccess: () => {
                        SwalHelper.success('¡Hecho!', 'La contraseña ha sido restablecida.');
                    },
                    onError: () => {
                        SwalHelper.error('Error', 'No se pudo procesar la solicitud.');
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
            {/* Sección de Solicitudes de Restablecimiento */}
            {resetRequests.length > 0 && (
                <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 text-slate-800 mb-2">
                        <AlertCircle size={20} className="text-blue-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Solicitudes de Restablecimiento</h3>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {resetRequests.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {resetRequests.map((req) => (
                            <div key={req.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between group hover:border-blue-200 transition-all duration-300">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{req.nombre}</p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{req.fecha}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium truncate mb-4">{req.email}</p>
                                </div>
                                <button
                                    onClick={() => handleApproveReset(req)}
                                    className="w-full py-2.5 bg-white border border-slate-200 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Key size={14} />
                                    Aprobar Reset
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="h-px bg-slate-100 w-full my-8" />
                </div>
            )}

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

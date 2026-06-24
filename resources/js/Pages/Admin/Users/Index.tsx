import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppTable from '@/Components/AppTable';
import { 
    Search, 
    UserPlus, 
    Key, 
    Edit, 
    Check, 
    X,
    Shield,
    Mail,
    User,
    Lock
} from 'lucide-react';

interface MockUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'docente' | 'alumno';
    status: 'active' | 'inactive';
}

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

    // 4. Formulario
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'alumno' as 'admin' | 'docente' | 'alumno',
        status: 'active' as 'active' | 'inactive',
        password: ''
    });

    // 5. Toasts o alertas simulados
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
        setFormData({ name: '', email: '', role: 'alumno', status: 'active', password: '' });
        setIsModalOpen(true);
    };

    // Abrir modal de edición
    const openEditModal = (user: MockUser) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({ 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            status: user.status,
            password: '' // No se edita contraseña aquí de fábrica
        });
        setIsModalOpen(true);
    };

    // Guardar formulario (Simulación de POST/PUT)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Gestión de Usuarios
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Registra y administra los accesos al sistema escolar.</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
                    >
                        <UserPlus size={16} />
                        Registrar Usuario
                    </button>
                </div>
            }
        >
            <Head title="Gestión de Usuarios" />

            {/* Simulación de Alertas / Toast */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm animate-bounce">
                    <div className="bg-emerald-500 p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Filtros */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 text-sm transition-all text-slate-700 placeholder-slate-400"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="w-full md:w-48 py-2.5 px-3 bg-slate-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 text-sm transition-all text-slate-700"
                        >
                            <option value="all">Todos los Roles</option>
                            <option value="admin">Administradores</option>
                            <option value="docente">Docentes</option>
                            <option value="alumno">Alumnos</option>
                        </select>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <AppTable
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No se encontraron usuarios coincidentes."
                    columns={[
                        {
                            header: "Usuario",
                            accessor: (row) => (
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                        {row.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold text-slate-800 block leading-tight">{row.name}</span>
                                        <span className="text-xs text-slate-400 block mt-0.5">{row.email}</span>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: "Rol",
                            accessor: (row) => (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    row.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                                    row.role === 'docente' ? 'bg-amber-50 text-amber-700' :
                                    'bg-blue-50 text-blue-700'
                                }`}>
                                    <Shield size={12} />
                                    {row.role === 'admin' ? 'Administrador' :
                                     row.role === 'docente' ? 'Docente' : 'Alumno'}
                                </span>
                            ),
                        },
                        {
                            header: "Estado",
                            accessor: (row) => (
                                <button 
                                    onClick={() => toggleStatus(row)}
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                                        row.status === 'active' 
                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                >
                                    {row.status === 'active' ? 'Activo' : 'Inactivo'}
                                </button>
                            ),
                        },
                        {
                            header: "Acciones",
                            align: "right",
                            accessor: (row) => (
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleResetPassword(row)}
                                        title="Restablecer Contraseña"
                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all"
                                    >
                                        <Key size={16} />
                                    </button>
                                    <button 
                                        onClick={() => openEditModal(row)}
                                        title="Editar Usuario"
                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            {/* Modal de Agregar / Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Cabecera del Modal */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-lg">
                                {modalMode === 'create' ? 'Registrar Nuevo Usuario' : 'Editar Usuario'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                {/* Nombre */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nombre Completo</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                            <User size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ej: Ing. Francisco Javier Martínez"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Correo */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Correo Electrónico</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                            <Mail size={16} />
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="ejemplo@prepahidalgo.edu.mx"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Contraseña (Solo en creación) */}
                                {modalMode === 'create' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Contraseña Temporal</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                                <Lock size={16} />
                                            </span>
                                            <input
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Rol y Estado */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rol del Sistema</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                            className="w-full py-2.5 px-3 bg-slate-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 text-sm transition-all text-slate-700"
                                        >
                                            <option value="admin">Administrador</option>
                                            <option value="docente">Docente</option>
                                            <option value="alumno">Alumno</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Estado Inicial</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full py-2.5 px-3 bg-slate-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 text-sm transition-all text-slate-700"
                                        >
                                            <option value="active">Activo</option>
                                            <option value="inactive">Inactivo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
                                >
                                    {modalMode === 'create' ? 'Registrar' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

import AppTable from '@/Components/AppTable';
import { Edit, Key, Shield } from 'lucide-react';

export interface MockUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'docente' | 'alumno';
    status: 'active' | 'inactive';
}

interface UserTableProps {
    users: MockUser[];
    onToggleStatus: (user: MockUser) => void;
    onResetPassword: (user: MockUser) => void;
    onOpenEditModal: (user: MockUser) => void;
}

export default function UserTable({
    users,
    onToggleStatus,
    onResetPassword,
    onOpenEditModal,
}: UserTableProps) {
    return (
        <AppTable
            data={users}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron usuarios coincidentes."
            columns={[
                {
                    header: "Usuario",
                    accessor: (row) => (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-650">
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
                            type="button"
                            onClick={() => onToggleStatus(row)}
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
                                type="button"
                                onClick={() => onResetPassword(row)}
                                title="Restablecer Contraseña"
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all"
                            >
                                <Key size={16} />
                            </button>
                            <button 
                                type="button"
                                onClick={() => onOpenEditModal(row)}
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
    );
}

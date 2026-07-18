import AppTable from '@/Components/table/AppTable';
import { TableActions, TableActionButton } from '@/Components/TableActions';

export interface MockUser {
    id: number;
    nombre: string;
    email: string;
    rol: 'admin' | 'docente' | 'alumno';
    estatus: 'active' | 'inactive';
    telefono?: string;
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
                                {row.nombre?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="text-left">
                                <span className="font-medium text-slate-700 block leading-tight text-[13px]">{row.nombre}</span>
                                <span className="text-xs text-slate-400 block mt-0.5">{row.email}</span>
                            </div>
                        </div>
                    ),
                },
                {
                    header: "Rol",
                    accessor: (row) => (
                        <span className={`flex items-center justify-center w-[110px] h-7 rounded-lg text-xs font-normal border ${
                            row.rol?.toLowerCase() === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                : row.rol?.toLowerCase() === 'docente'
                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                            {row.rol?.toLowerCase() === 'admin' ? 'Administrador' :
                                row.rol?.toLowerCase() === 'docente' ? 'Docente' : 'Alumno'}
                        </span>
                    ),
                },
                {
                    header: "Estado",
                    accessor: (row) => (
                        <button
                            type="button"
                            onClick={() => onToggleStatus(row)}
                            className={`flex items-center justify-center w-[110px] h-7 rounded-lg text-xs font-normal border transition-all ${
                                row.estatus === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                            }`}
                        >
                            {row.estatus === 'active' ? 'Activo' : 'Inactivo'}
                        </button>
                    ),
                },
                {
                    header: "Acciones",
                    align: "right",
                    accessor: (row) => (
                        <TableActions align="end">
                            <TableActionButton
                                onClick={() => onResetPassword(row)}
                                title="Restablecer Contraseña"
                                icon="reset-password"
                            />
                            <TableActionButton
                                onClick={() => onOpenEditModal(row)}
                                title="Editar Usuario"
                                icon="edit"
                            />
                        </TableActions>
                    ),
                },
            ]}
        />
    );
}

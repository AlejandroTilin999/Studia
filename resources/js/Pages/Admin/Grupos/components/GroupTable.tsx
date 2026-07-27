import AppTable from '@/Components/table/AppTable';
import { GroupFormatted } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface GroupTableProps {
    groups: GroupFormatted[];
    onOpenEditModal: (group: GroupFormatted) => void;
    onOpenPromoteModal: (group: GroupFormatted) => void;
    onDelete: (id: number, name: string) => void;
}

export default function GroupTable({
    groups,
    onOpenEditModal,
    onOpenPromoteModal,
    onDelete,
}: GroupTableProps) {
    return (
        <AppTable
            data={groups}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron grupos coincidentes."
            columns={[
                {
                    header: "Código",
                    accessor: (row) => (
                        <div className="flex flex-col">
                            <span className="text-slate-800 font-bold text-[13px]">{row.code}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{row.generacion}</span>
                        </div>
                    ),
                    className: "text-left",
                },
                {
                    header: "Nombre del grupo",
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className="text-slate-700 text-[13px] block font-normal">{row.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{row.specialty}</span>
                        </div>
                    ),
                },
                {
                    header: "Semestre",
                    accessor: (row) => (
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-black text-slate-600">
                            {row.semestre}°
                        </span>
                    ),
                    align: "center",
                },
                {
                    header: "Tutor / Profesor",
                    accessor: (row) => row.teacherName,
                    className: "text-slate-500 font-medium text-[13px] text-left",
                },
                {
                    header: "Acciones",
                    accessor: (row) => (
                        <TableActions align="start">
                            <TableActionButton
                                onClick={() => onOpenPromoteModal(row)}
                                title="Promover Alumnos"
                                icon="promote"
                                variant="success"
                            />
                            <TableActionButton
                                onClick={() => onOpenEditModal(row)}
                                title="Editar Grupo"
                                icon="edit"
                            />
                            <TableActionButton
                                onClick={() => onDelete(row.id, row.name)}
                                title="Eliminar Grupo"
                                icon="delete"
                                variant="danger"
                            />
                        </TableActions>
                    ),
                },
            ]}
        />
    );
}

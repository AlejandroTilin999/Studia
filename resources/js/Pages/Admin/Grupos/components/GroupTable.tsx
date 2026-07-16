import AppTable from '@/Components/table/AppTable';
import { GroupFormatted } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface GroupTableProps {
    groups: GroupFormatted[];
    onOpenEditModal: (group: GroupFormatted) => void;
    onDelete: (id: number, name: string) => void;
}

export default function GroupTable({
    groups,
    onOpenEditModal,
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
                    accessor: (row) => row.code,
                    className: "text-slate-500 font-medium text-[13px] text-left",
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
                    header: "Turno",
                    accessor: "shift",
                    className: "text-slate-500 font-medium text-[13px] text-left",
                },
                {
                    header: "Tutor / Profesor Asignado",
                    accessor: (row) => row.teacherName,
                    className: "text-slate-500 font-medium text-[13px] text-left",
                },
                {
                    header: "Acciones",
                    accessor: (row) => (
                        <TableActions align="start">
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

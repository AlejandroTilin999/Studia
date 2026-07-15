import AppTable from '@/Components/table/AppTable';
import { GroupFormatted } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface GroupTableProps {
    groups: GroupFormatted[];
    onOpenEditModal: (group: GroupFormatted) => void;
}

export default function GroupTable({
    groups,
    onOpenEditModal,
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
                            <span className="text-slate-700 text-[13px] block">{row.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{row.specialty} • {row.plan_nombre}</span>
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
                        </TableActions>
                    ),
                },
            ]}
        />
    );
}

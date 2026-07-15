import AppTable from '@/Components/table/AppTable';
import { SubjectFormatted } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface SubjectTableProps {
    subjects: SubjectFormatted[];
    onOpenEditModal: (subject: SubjectFormatted) => void;
    onDelete: (id: number, name: string) => void;
}

export default function SubjectTable({
    subjects,
    onOpenEditModal,
    onDelete,
}: SubjectTableProps) {
    return (
        <AppTable
            data={subjects}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron materias."
            columns={[
                {
                    header: "Código",
                    accessor: (row) => row.code,
                    className: "text-slate-500 font-medium text-[13px] text-left leading-tight text-left",
                },
                {
                    header: "Materia",
                    accessor: (row) => row.name,

                    className: "text-slate-700 text-[13px] text-left leading-tight text-left",
                },
                {
                    header: "Descripción",
                    accessor: (row) => row.description || "Sin descripción",
                    className: "text-slate-500 text-[12.5px] text-left max-w-sm whitespace-normal break-words ",
                },
                {
                    header: "Acciones",
                    accessor: (row) => (
                        <TableActions align="start">
                            <TableActionButton
                                onClick={() => onOpenEditModal(row)}
                                title="Editar Materia"
                                icon="edit"
                            />
                            <TableActionButton
                                onClick={() => onDelete(row.id, row.name)}
                                title="Eliminar Materia"
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

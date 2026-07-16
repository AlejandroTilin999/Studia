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
                    className: "text-slate-700 text-[13px] text-left leading-tight text-left font-normal",
                },
                {
                    header: "Sem.",
                    accessor: (row) => (
                        <span className="text-slate-500 font-bold text-xs">{row.semestre}°</span>
                    ),
                    className: "text-center",
                },
                {
                    header: "Tipo",
                    accessor: (row) => (
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[12px] font-normal rounded-lg block w-fit text-left">
                            {row.tipo}
                        </span>
                    ),
                    className: "text-left",
                },
                {
                    header: "Especialidad",
                    accessor: (row) => {
                        if (row.tipo === 'General') {
                            return <span className="text-slate-500 font-medium text-xs">Todas las Carreras</span>;
                        }
                        if (!row.specialties || row.specialties.length === 0) {
                            return <span className="text-slate-500 font-semibold text-xs">Sin asignar</span>;
                        }
                        return (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {row.specialties.map(spec => (
                                    <span key={spec.id} className="text-slate-500 font-medium text-xs" title={spec.name}>
                                        {spec.name}
                                    </span>
                                ))}
                            </div>
                        );
                    },
                    className: "text-left max-w-xs whitespace-normal break-words",
                },
                {
                    header: "Descripción",
                    accessor: (row) => {
                        const desc = row.description || "Sin descripción";
                        return desc.length > 50 ? desc.slice(0, 50) + '...' : desc;
                    },
                    className: "text-slate-500 text-[12.5px] text-left max-w-sm whitespace-normal break-words",
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

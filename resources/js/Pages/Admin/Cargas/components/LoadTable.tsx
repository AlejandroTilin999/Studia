import AppTable from '@/Components/table/AppTable';
import { AcademicLoadItem } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface LoadTableProps {
    loads: AcademicLoadItem[];
    onOpenEditModal: (load: AcademicLoadItem) => void;
    onOpenDeleteModal: (load: AcademicLoadItem) => void;
}

export default function LoadTable({
    loads,
    onOpenEditModal,
    onOpenDeleteModal,
}: LoadTableProps) {
    return (
        <AppTable
            data={loads}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron cargas académicas registradas."
            columns={[
                {
                    header: 'Ciclo Escolar',
                    accessor: (row) => row.period_name,
                    className: "text-[13px] font-medium text-slate-700 leading-normal text-left",
                },
                {
                    header: 'Grupo',
                    accessor: (row) => (
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-extrabold rounded-lg block w-fit text-left">
                            {row.group_name}
                        </span>
                    ),
                    className: "text-left",
                },
                {
                    header: 'Materia',
                    accessor: (row) => (
                        <div className="leading-normal text-left">
                            <div className="text-[13px] font-medium ">
                                {row.course_name}
                            </div>
                            <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                                Clave: {row.course_code}
                            </div>
                        </div>
                    ),
                    className: "text-left",
                },
                {
                    header: 'Profesor / Docente',
                    accessor: (row) => row.teacher_name,
                    className: "text-[13px] font-medium text-slate-600 leading-normal text-left",
                },
                {
                    header: 'Acciones',
                    accessor: (row) => (
                        <TableActions align="start">
                            <TableActionButton
                                onClick={() => onOpenEditModal(row)}
                                title="Editar carga"
                                icon="edit"
                            />
                            <TableActionButton
                                onClick={() => onOpenDeleteModal(row)}
                                title="Eliminar carga"
                                icon="delete"
                                variant="danger"
                            />
                        </TableActions>
                    ),
                    className: "text-left",
                }
            ]}
        />
    );
}

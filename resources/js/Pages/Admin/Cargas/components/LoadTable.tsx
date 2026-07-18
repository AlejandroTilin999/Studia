import AppTable from '@/Components/table/AppTable';
import { AcademicLoadItem } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface LoadTableProps {
    loads: AcademicLoadItem[];
    onOpenEditModal: (load: AcademicLoadItem) => void;
    onOpenDeleteModal: (load: AcademicLoadItem) => void;
    activePeriodId?: number;
}

export default function LoadTable({
    loads,
    onOpenEditModal,
    onOpenDeleteModal,
    activePeriodId,
}: LoadTableProps) {
    return (
        <AppTable
            data={loads}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron cargas académicas registradas."
            columns={[
                {
                    header: 'Grupo',
                    accessor: (row) => (
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-extrabold rounded-lg block w-fit text-left">
                            {row.nombre_grupo}
                        </span>
                    ),
                    className: "text-left",
                },
                {
                    header: 'Materia',
                    accessor: (row) => (
                        <div className="leading-normal text-left">
                            <div className="text-[13px] font-medium ">
                                {row.nombre_materia}
                            </div>
                            <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                                Clave: {row.codigo_materia}
                            </div>
                        </div>
                    ),
                    className: "text-left",
                },
                {
                    header: 'Profesor / Docente',
                    accessor: (row) => row.nombre_docente,
                    className: "text-[13px] font-medium text-slate-600 leading-normal text-left",
                },
                {
                    header: 'Acciones',
                    accessor: (row) => {
                        const isHistorical = activePeriodId && row.ciclo_id !== activePeriodId;

                        if (isHistorical) {
                            return (
                                <span className="text-[10px] text-slate-400 font-bold italic italic-select-none">Lectura únicamente</span>
                            );
                        }

                        return (
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
                        );
                    },
                    className: "text-left",
                }
            ]}
        />
    );
}

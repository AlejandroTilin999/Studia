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
                    header: 'Ciclo Escolar',
                    accessor: (row) => (
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-slate-700 leading-normal">{row.period_name}</span>
                            {row.academic_period_id === activePeriodId && (
                                <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-100 font-black uppercase tracking-tighter">Vigente</span>
                            )}
                        </div>
                    ),
                    className: "text-left",
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
                    accessor: (row) => {
                        const isHistorical = activePeriodId && row.academic_period_id !== activePeriodId;

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

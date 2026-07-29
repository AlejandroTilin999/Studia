import AppTable from '@/Components/table/AppTable';
import { AcademicLoadItem } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';
import { cn } from '@/lib/utils';

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
            defaultPageSize={20}
            columns={[
                {
                    header: 'Grupo Académico',
                    accessor: (row, index) => {
                        // Lógica para no repetir el nombre del grupo si es el mismo que el anterior
                        // Esto asume que el componente AppTable no ha reordenado los datos de forma distinta
                        // a como los recibió (por defecto vienen ordenados por grupo desde el controlador)
                        const isDuplicate = index > 0 && loads[index - 1]?.nombre_grupo === row.nombre_grupo;

                        return (
                            <div className={cn(
                                "text-[13px] font-normal text-slate-800 transition-opacity duration-300",
                                isDuplicate ? "opacity-0 select-none" : "opacity-100"
                            )}>
                                {row.nombre_grupo}
                            </div>
                        );
                    },
                    className: "text-left w-40",
                },
                {
                    header: 'Asignatura / Materia',
                    accessor: (row) => (
                        <div className="leading-normal text-left">
                            <div className="text-[13px] font-normal text-slate-600">
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
                    header: 'Profesor Titular',
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className="text-[13px] font-normal text-slate-600 block">{row.nombre_docente}</span>
                            {row.area_docente && (
                                <span className="text-[10px] text-slate-400 font-normal uppercase tracking-tight">ÁREA: {row.area_docente}</span>
                            )}
                        </div>
                    ),
                    className: "text-left",
                },
                {
                    header: 'Acciones',
                    accessor: (row) => {
                        const isHistorical = activePeriodId && row.ciclo_id !== activePeriodId;

                        if (isHistorical) {
                            return (
                                <span className="text-[10px] text-slate-400 font-normal">Lectura únicamente</span>
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

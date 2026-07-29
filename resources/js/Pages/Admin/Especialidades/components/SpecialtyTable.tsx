import React from 'react';
import AppTable from '@/Components/table/AppTable';
import { Specialty } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface SpecialtyTableProps {
    specialties: Specialty[];
    onOpenEditModal: (specialty: Specialty) => void;
    onDelete: (id: number, name: string) => void;
}

export default function SpecialtyTable({
    specialties,
    onOpenEditModal,
    onDelete,
}: SpecialtyTableProps) {
    return (
        <AppTable
            data={specialties}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron especialidades registradas."
            columns={[
                {
                    header: "Código / Abreviación",
                    accessor: (row) => row.codigo,
                    className: "text-slate-500 font-normal text-[13px] text-left",
                },
                {
                    header: "Nombre de la Especialidad",
                    accessor: (row) => (
                        <span className="text-slate-700 font-normal text-[13px] rounded-lg block w-fit text-left">
                            {row.nombre}
                        </span>
                    ),
                },
                {
                    header: "Áreas Técnicas / Ramas",
                    accessor: (row) => (
                        <div className="flex flex-wrap gap-1.5 max-w-[400px]">
                            {row.sub_areas && row.sub_areas.length > 0 ? (
                                row.sub_areas.map((area, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-blue-50 text-[#0266E0] rounded-md text-[10px] font-normal uppercase tracking-normal border border-blue-100/50"
                                    >
                                        {area}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 text-[11px]">Sin áreas definidas</span>
                            )}
                        </div>
                    ),
                },
                {
                    header: "Acciones",
                    accessor: (row) => (
                        <TableActions align="start">
                            <TableActionButton
                                onClick={() => onOpenEditModal(row)}
                                title="Editar Especialidad"
                                icon="edit"
                            />
                            <TableActionButton
                                onClick={() => onDelete(row.id, row.nombre)}
                                title="Eliminar Especialidad"
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

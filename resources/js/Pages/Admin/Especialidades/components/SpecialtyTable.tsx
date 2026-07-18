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
                    className: "text-slate-500 font-medium text-[13px] text-left",
                },
                {
                    header: "Nombre de la Especialidad",
                    accessor: (row) => (
                        <span className="text-slate-500 text-[13px] rounded-lg block w-fit text-left">
                            {row.nombre}
                        </span>
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

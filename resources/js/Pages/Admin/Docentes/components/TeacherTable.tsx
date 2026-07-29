import React from 'react';
import AppTable from "@/Components/table/AppTable";
import { TeacherFormatted } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface TeacherTableProps {
    teachers: TeacherFormatted[];
    onEdit: (teacher: TeacherFormatted) => void;
    onDelete: (teacher: TeacherFormatted) => void;
}

export default function TeacherTable({
    teachers,
    onEdit,
    onDelete,
}: TeacherTableProps) {
    return (
        <AppTable
            data={teachers}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron profesores coincidentes."
            columns={[
                {
                    header: "Matrícula",
                    accessor: (row) => row.matricula,
                    className: "text-slate-500 font-normal text-[12.5px]",
                },
                {
                    header: "Nombre",
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className="text-slate-500 font-normal text-[13px] block">
                                {row.name}
                            </span>
                            <span className="text-[12.5px] text-slate-400 font-normal block mt-0.5">
                                {row.specialty} {(row as any).area ? ` - ${(row as any).area}` : ''}
                            </span>
                        </div>
                    ),
                },
                {
                    header: "Contacto",
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className="text-slate-500 font-normal text-[13px] block">
                                {row.email}
                            </span>

                            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                                {row.phone}
                            </span>
                        </div>
                    ),
                },
                {
                    header: "Acciones",
                    accessor: (row) => (
                        <TableActions align="start">
                            <TableActionButton
                                onClick={() => onEdit(row)}
                                title="Editar Docente"
                                icon="edit"
                            />
                            <TableActionButton
                                onClick={() => onDelete(row)}
                                title="Eliminar Docente"
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

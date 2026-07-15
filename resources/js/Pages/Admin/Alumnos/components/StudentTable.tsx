import React from 'react';
import AppTable from '@/Components/table/AppTable';
import { AppTableColumn } from '@/Components/table/types/table.types';
import { StudentFormatted } from '../types';
import { TableActions, TableActionButton } from '@/Components/TableActions';

interface StudentTableProps {
    students: StudentFormatted[];
    onOpenEditModal: (student: StudentFormatted) => void;
    onOpenBajaModal: (student: StudentFormatted) => void;
    onOpenKardexModal: (student: StudentFormatted) => void;
}

export default function StudentTable({
    students,
    onOpenEditModal,
    onOpenBajaModal,
    onOpenKardexModal
}: StudentTableProps) {
    const columns: AppTableColumn<StudentFormatted>[] = [
        {
            header: "Matrícula",
            accessor: (student: StudentFormatted) => student.matricula,
            align: "left",
            className: "text-slate-500 font-medium text-[13px] h-16",
        },
        {
            header: "Nombre",
            accessor: (student: StudentFormatted) => (
                <div className="leading-tight">
                    <span className="text-slate-700 font-normal text-[14px] block">{student.name}</span>
                    <span className="text-[10.5px] text-slate-400 font-medium">{student.email}</span>
                </div>
            ),
            align: "left",
            className: "px-2",
        },
        {
            header: "Grado y grupo",
            accessor: (student: StudentFormatted) => student.groupName,
            align: "left",
            className: "text-slate-500 font-medium text-[13px]",
        },
        {
            header: "Kardex",
            align: "center",
            headerClassName: "text-center",
            accessor: (student: StudentFormatted) => (
                <TableActions align="center">
                    <TableActionButton
                        onClick={() => onOpenKardexModal(student)}
                        title="Ver Kardex"
                        icon="kardex"
                    />
                </TableActions>
            )
        },
        {
            header: "Acciones",
            align: "left",
            headerClassName: "text-left",
            accessor: (student: StudentFormatted) => (
                <TableActions align="start">
                    <TableActionButton
                        onClick={() => onOpenEditModal(student)}
                        title="Editar Alumno"
                        icon="edit"
                    />
                    <TableActionButton
                        onClick={() => onOpenBajaModal(student)}
                        title={student.status === 'active' ? "Dar de Baja" : "Dar de Alta"}
                        icon={student.status === 'active' ? 'delete' : 'activate'}
                        variant={student.status === 'active' ? 'danger' : 'success'}
                    />
                </TableActions>
            )
        }
    ];

    return (
        <AppTable
            columns={columns}
            data={students}
            keyExtractor={(student: StudentFormatted) => student.id}
            emptyMessage="No se encontraron alumnos coincidentes."
            className="flex-1 scrollbar-hide"
        />
    );
}

import React from 'react';
import AppTable, { AppTableColumn } from '@/Components/AppTable';
import { StudentFormatted } from '../types';

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
            accessor: (student) => student.matricula,
            align: "left",
            className: "text-slate-500 font-medium text-[13px] h-16",
        },
        {
            header: "Nombre",
            accessor: (student) => (
                <div className="leading-tight">
                    <span className="text-slate-700 font-bold text-[15px] block">{student.name}</span>
                    <span className="text-[10.5px] text-slate-400 font-medium">{student.email}</span>
                </div>
            ),
            align: "left",
            className: "px-2",
        },
        {
            header: "Grado y grupo",
            accessor: (student) => student.groupName,
            align: "left",
            className: "text-slate-500 font-medium text-[13px]",
        },
        {
            header: "Kardex",
            align: "center",
            headerClassName: "text-center",
            accessor: (student) => (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenKardexModal(student);
                    }}
                    className="bg-[#e3f2fd] hover:bg-[#bbdefb] text-[#1e88e5] font-black h-8 px-4 rounded-lg text-[12px] transition-all"
                >
                    Ver
                </button>
            )
        },
        {
            header: "Acciones",
            align: "left",
            headerClassName: "text-left",
            accessor: (student) => (
                <div className="flex items-center justify-start gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => onOpenEditModal(student)}
                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none transition-all"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={() => onOpenBajaModal(student)}
                        className={`font-bold h-8 px-5 rounded-lg text-[12px] transition-all ${
                            student.status === 'active' 
                                ? 'bg-rose-55 hover:bg-rose-100 text-rose-600' 
                                : 'bg-emerald-55 hover:bg-emerald-100 text-emerald-600'
                        }`}
                    >
                        {student.status === 'active' ? 'Baja' : 'Alta'}
                    </button>
                </div>
            )
        }
    ];

    return (
        <AppTable
            columns={columns}
            data={students}
            keyExtractor={(student) => student.id}
            emptyMessage="No se encontraron alumnos coincidentes."
            className="flex-1 scrollbar-hide"
        />
    );
}

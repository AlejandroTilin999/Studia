import AppTable from '@/Components/AppTable';
import { Edit, Trash2 } from 'lucide-react';
import { AcademicLoadItem } from '../types';

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
                    className: "text-xs font-black text-slate-800 leading-normal text-left",
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
                            <div className="text-xs font-extrabold text-[#1e88e5]">
                                {row.course_name}
                            </div>
                            <div className="text-[9.5px] font-bold text-slate-400 mt-0.5">
                                Clave: {row.course_code}
                            </div>
                        </div>
                    ),
                    className: "text-left",
                },
                {
                    header: 'Profesor / Docente',
                    accessor: (row) => row.teacher_name,
                    className: "text-xs font-bold text-slate-600 leading-normal text-left",
                },
                {
                    header: 'Acciones',
                    accessor: (row) => (
                        <div className="flex items-center justify-start gap-2">
                            <button
                                type="button"
                                onClick={() => onOpenEditModal(row)}
                                className="p-2 text-slate-400 hover:text-[#1e88e5] hover:bg-blue-50/50 rounded-xl transition-all"
                                title="Editar carga"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onOpenDeleteModal(row)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Eliminar carga"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ),
                    className: "text-left",
                }
            ]}
        />
    );
}

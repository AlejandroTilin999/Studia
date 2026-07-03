import AppTable from '@/Components/AppTable';

export interface MockSubject {
    id: number;
    code: string;
    name: string;
    teacherName: string;
    linkedGroups: string[];
    description: string;
}

interface SubjectTableProps {
    subjects: MockSubject[];
    onOpenEditModal: (subject: MockSubject) => void;
    onDelete: (id: number, name: string) => void;
}

export default function SubjectTable({
    subjects,
    onOpenEditModal,
    onDelete,
}: SubjectTableProps) {
    return (
        <AppTable
            data={subjects}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron materias."
            columns={[
                {
                    header: "Código",
                    accessor: (row) => row.code,
                    className: "text-slate-500 font-mono text-[13px] font-bold text-left",
                },
                {
                    header: "Materia",
                    accessor: (row) => (
                        <div className="leading-tight max-w-xs text-left">
                            <span className="text-slate-700 font-bold text-[15px] block">{row.name}</span>
                            <span className="text-[10.5px] text-slate-400 font-medium block mt-0.5 truncate">{row.description || 'Sin descripción'}</span>
                        </div>
                    ),
                },
                {
                    header: "Profesor Asignado",
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className={`text-[13px] font-bold block ${row.teacherName === 'Pendiente de Asignación' ? 'text-amber-500' : 'text-slate-700'}`}>
                                {row.teacherName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                {row.teacherName === 'Pendiente de Asignación' ? 'Sin docente' : 'Docente titular'}
                            </span>
                        </div>
                    ),
                },
                {
                    header: "Grupos Vinculados",
                    accessor: (row) => (
                        <div className="flex flex-wrap gap-1.5 justify-start">
                            {row.linkedGroups.length > 0 ? (
                                row.linkedGroups.map((g, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-850 px-2 py-0.5 rounded font-bold text-[10px]">
                                        {g}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 text-xs font-medium italic">Sin vincular</span>
                            )}
                        </div>
                    ),
                },
                {
                    header: "Acciones",
                    align: "right",
                    accessor: (row) => (
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                type="button"
                                onClick={() => onOpenEditModal(row)}
                                className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none transition-all"
                            >
                                Editar
                            </button>
                            <button 
                                type="button"
                                onClick={() => onDelete(row.id, row.name)}
                                className="font-bold h-8 px-5 rounded-lg text-[12px] transition-all bg-rose-50 hover:bg-rose-100 text-rose-600"
                                title="Eliminar Registro"
                            >
                                Eliminar
                            </button>
                        </div>
                    ),
                },
            ]}
        />
    );
}

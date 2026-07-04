import AppTable from '@/Components/AppTable';

export interface GroupRecord {
    id: number;
    code: string;
    name: string;
    shift: string;
    teacherName: string;
    specialty: string;
}

interface GroupTableProps {
    groups: GroupRecord[];
    onOpenEditModal: (group: GroupRecord) => void;
}

export default function GroupTable({
    groups,
    onOpenEditModal,
}: GroupTableProps) {
    return (
        <AppTable
            data={groups}
            keyExtractor={(item) => item.id}
            emptyMessage="No se encontraron grupos coincidentes."
            columns={[
                {
                    header: "Código",
                    accessor: (row) => row.code,
                    className: "text-slate-500 font-mono text-[13px] font-bold text-left",
                },
                {
                    header: "Nombre del grupo",
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className="text-slate-700 font-bold text-[15px] block">{row.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{row.specialty}</span>
                        </div>
                    ),
                },
                {
                    header: "Turno",
                    accessor: "shift",
                    className: "text-slate-500 font-medium text-[13px] text-left",
                },
                {
                    header: "Profesor Asignado",
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className={`text-[13px] font-bold block ${row.teacherName === 'Pendiente de Asignación' ? 'text-amber-500' : 'text-slate-700'}`}>
                                {row.teacherName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Tutor titular</span>
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
                        </div>
                    ),
                },
            ]}
        />
    );
}

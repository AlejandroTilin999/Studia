import AppTable from "@/Components/AppTable";

interface TeacherTableProps {
    teachers: any[];
    onEdit: (teacher: any) => void;
    onViewAssignments: (teacher: any) => void;
    onDelete: (teacher: any) => void;
}

export default function TeacherTable({
    teachers,
    onEdit,
    onViewAssignments,
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
                    className: "text-slate-500 font-medium text-[13px]",
                },
                {
                    header: "Nombre",
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className="text-slate-700 font-bold text-[15px] block">
                                {row.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                {row.specialty}
                            </span>
                        </div>
                    ),
                },
                {
                    header: "Materia asignada",
                    accessor: (row) => (
                        <div className="flex flex-col text-left">
                            <span className="text-[13px] text-slate-700 font-bold">
                                {row.assignments.map((a: any) => a.subject).join(", ") || "Sin materias"}
                            </span>

                            {row.assignments.length > 0 && (
                                <button
                                    onClick={() => onViewAssignments(row)}
                                    className="text-[10.5px] text-[#1e88e5] font-extrabold hover:underline text-left mt-0.5"
                                >
                                    Ver asignaciones ({row.assignments.length})
                                </button>
                            )}
                        </div>
                    ),
                },
                {
                    header: "Contacto",
                    accessor: (row) => (
                        <div className="leading-tight text-left">
                            <span className="text-slate-500 font-medium text-[13px] block">
                                {row.email}
                            </span>

                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                {row.phone}
                            </span>
                        </div>
                    ),
                },
                {
                    header: "Acciones",
                    accessor: (row) => (
                        <div className="flex items-center justify-start gap-2">
                            <button
                                onClick={() => onEdit(row)}
                                className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] transition-all active:scale-[0.97]"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete(row)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold h-8 px-5 rounded-lg text-[12px] transition-all active:scale-[0.97]"
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
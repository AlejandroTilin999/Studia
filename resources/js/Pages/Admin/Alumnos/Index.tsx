import { useState } from 'react';
import { Search, Filter, Plus } from "lucide-react";
import AppTable, { AppTableColumn } from '@/Components/AppTable';
import StudentFormModal from './StudentFormModal';
import StudentKardexModal from './StudentKardexModal';
import AdminPageLayout from '@/Components/AdminPageLayout';

export interface MockStudent {
    id: number;
    matricula: string;
    name: string;
    birthdate: string;
    email: string;
    phone: string;
    groupName: string;
    status: 'active' | 'suspended';
    grades: { subject: string; score: number; period: string }[];
}

export default function AlumnosIndex() {
    const [students, setStudents] = useState<MockStudent[]>([
        { id: 1, matricula: "P001", name: "Alejandro Bautista Beltrán", birthdate: "2008-04-12", email: "alejandro.bautista@alumno.prepahidalgo.edu.mx", phone: "7712345678", groupName: "1°A", status: 'active', grades: [{ subject: 'Matemáticas I', score: 9.5, period: '2026-A' }] },
        { id: 2, matricula: "P002", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [{ subject: 'Matemáticas I', score: 10.0, period: '2026-A' }] },
        { id: 3, matricula: "P003", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
        { id: 4, matricula: "P004", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
        { id: 5, matricula: "P005", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
        { id: 6, matricula: "P006", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
        { id: 7, matricula: "P007", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
        { id: 8, matricula: "P008", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
    ]);

    // 2. React state for search & filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    // 3. Form & Kardex Modals State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<MockStudent | null>(null);

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filters logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || student.groupName === groupFilter;
        return matchesSearch && matchesGroup;
    });

    // Stats calculations
    const activeCount = students.filter(s => s.status === 'active').length;
    const inactiveCount = students.filter(s => s.status === 'suspended').length;
    const totalCount = students.length;

    // Actions
    const openCreateModal = () => {
        setModalMode('create');
        setIsFormModalOpen(true);
    };

    const openEditModal = (student: MockStudent) => {
        setModalMode('edit');
        setSelectedStudent(student);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (submittedData: {
        matricula: string;
        name: string;
        birthdate: string;
        email: string;
        phone: string;
        groupName: string;
        status: 'active' | 'suspended';
    }) => {
        if (modalMode === 'create') {
            const newStudent: MockStudent = {
                id: Date.now(),
                matricula: submittedData.matricula,
                name: submittedData.name,
                birthdate: submittedData.birthdate,
                email: submittedData.email,
                phone: submittedData.phone,
                groupName: submittedData.groupName,
                status: submittedData.status,
                grades: []
            };
            setStudents([...students, newStudent]);
            triggerToast(`Estudiante "${submittedData.name}" registrado correctamente.`);
        } else if (modalMode === 'edit' && selectedStudent) {
            setStudents(students.map(s => s.id === selectedStudent.id ? {
                ...s,
                name: submittedData.name,
                birthdate: submittedData.birthdate,
                email: submittedData.email,
                phone: submittedData.phone,
                groupName: submittedData.groupName,
                status: submittedData.status
            } : s));
            triggerToast(`Datos de "${submittedData.name}" actualizados.`);
        }
        setIsFormModalOpen(false);
    };

    const toggleStatus = (student: MockStudent) => {
        const newStatus = student.status === 'active' ? 'suspended' : 'active';
        setStudents(students.map(s => s.id === student.id ? { ...s, status: newStatus } : s));
        triggerToast(`Estado de "${student.name}" cambiado a ${newStatus === 'active' ? 'Activo' : 'Baja'}.`);
    };

    const openKardexModal = (student: MockStudent) => {
        setSelectedStudent(student);
        setIsKardexModalOpen(true);
    };

    const calculateGPA = (grades: { score: number }[]) => {
        if (grades.length === 0) return '0.0';
        const sum = grades.reduce((acc, curr) => acc + curr.score, 0);
        return (sum / grades.length).toFixed(1);
    };

    const mainColumns: AppTableColumn<MockStudent>[] = [
        {
            header: "Matrícula",
            accessor: (student) => student.matricula,
            align: "left",
            className: "text-slate-500 font-medium text-[13px] h-16",
        },
        {
            header: "Nombre",
            accessor: (student) => student.name,
            align: "left",
            className: "text-slate-700 font-bold text-[15px] leading-tight",
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
                        openKardexModal(student);
                    }}
                    className="bg-[#e3f2fd] hover:bg-[#bbdefb] text-[#1e88e5] font-black h-8 px-4 rounded-lg text-[12px] transition-all"
                >
                    Ver
                </button>
            )
        },
        {
            header: "Acciones",
            align: "right",
            headerClassName: "text-right",
            accessor: (student) => (
                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => openEditModal(student)}
                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none transition-all"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={() => toggleStatus(student)}
                        className={`font-bold h-8 px-5 rounded-lg text-[12px] transition-all ${
                            student.status === 'active' 
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                        }`}
                        title={student.status === 'active' ? "Dar de baja" : "Dar de alta"}
                    >
                        {student.status === 'active' ? 'Baja' : 'Alta'}
                    </button>
                </div>
            )
        }
    ];

    return (
        <AdminPageLayout
            headTitle="Gestión de Alumnos"
            title={`Gestión de alumnos (${totalCount})`}
            subtitle="Consulta, edita y registra"
            breadcrumb="Alumnos"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Alumnos totales", value: totalCount },
                { code: "T3", label: "Activos", value: activeCount },
                { code: "T4", label: "De baja", value: inactiveCount }
            ]}
            quickActions={[
                { label: "Registrar alumnos", onClick: openCreateModal },
                {
                    label: "Dar de baja/alta",
                    onClick: () => {
                        alert("Haz clic en el botón 'Baja'/'Alta' que se encuentra en la columna 'Acciones' de la tabla para cambiar el estado del alumno.");
                    }
                }
            ]}
            donutChartLabel="alumnos"
            donutChartSegments={[
                { name: "Activos", count: activeCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "De baja", count: inactiveCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls: Search and Actions */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar Alumno"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 shadow-none text-slate-700 placeholder-slate-400"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto relative">
                    <button
                        onClick={openCreateModal}
                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial text-sm transition-all shadow-none flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Registrar alumno
                    </button>

                    <button
                        onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                        className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg flex-1 md:flex-initial gap-2 px-8 text-sm hover:bg-slate-50 transition-all flex items-center justify-center"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>

                    {/* Dropdown Filters Selector */}
                    {showFiltersDropdown && (
                        <div className="absolute right-0 top-14 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-3.5 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Filtrar por grupo</span>
                            <select
                                value={groupFilter}
                                onChange={e => {
                                    setGroupFilter(e.target.value);
                                    setShowFiltersDropdown(false);
                                }}
                                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                            >
                                <option value="all">Todos los Grupos</option>
                                <option value="1°A">Grupo 1°A</option>
                                <option value="2-B">Grupo 2-B</option>
                                <option value="3-A">Grupo 3-A</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <AppTable
                columns={mainColumns}
                data={filteredStudents}
                keyExtractor={(student) => student.id}
                emptyMessage="No se encontraron alumnos coincidentes."
                className="flex-1 border-none shadow-none rounded-none scrollbar-hide"
            />

            {/* Modal: Add/Edit student */}
            <StudentFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                mode={modalMode}
                student={selectedStudent}
                nextId={students.length + 1}
                onSubmit={handleFormSubmit}
            />

            {/* Modal: Kardex View */}
            <StudentKardexModal
                isOpen={isKardexModalOpen}
                onClose={() => setIsKardexModalOpen(false)}
                student={selectedStudent}
                onEditClick={(student) => openEditModal(student)}
                onDownloadKardex={(student) => {
                    triggerToast(`Descargando Kardex oficial de ${student.name}...`);
                }}
                calculateGPA={calculateGPA}
            />
        </AdminPageLayout>
    );
}
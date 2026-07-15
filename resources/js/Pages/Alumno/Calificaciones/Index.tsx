import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Download,
    ChevronDown,
    Search,
    Filter,
    Check
} from 'lucide-react';
import StudentRightSidebar from '@/Components/StudentRightSidebar';
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import StudentInfoCard from '@/Components/StudentInfoCard';
import AppTable from '@/Components/table/AppTable';
import GradeDetailsModal from './GradeDetailsModal';

interface Grade {
    id: number;
    subject: string;
    teacher: string;
    score: string;
    approved: string;
}

export default function AlumnoCalificacionesIndex() {
    const { auth } = usePage().props as any;

    // Datos del alumno
    const studentInfo = {
        name: auth?.user?.name || 'Alejandro Bautista Beltrán',
        matricula: 'P001',
        groupName: '1°A',
        tutor: 'Ing. Uriel Cambron',
        ciclo: '2025-2026',
        periodo: '(Enero-Abril 2026)'
    };

    // Calificaciones de la mockup
    const [grades] = useState<Grade[]>([
        { id: 1, subject: 'Cálculo 1', teacher: 'Ing. Uriel Cambron', score: '10', approved: 'N/A' },
        { id: 2, subject: 'Programación', teacher: 'DP. Ana Karen', score: '10', approved: 'N/A' },
        { id: 3, subject: 'Programación', teacher: 'Chef Ana', score: '40', approved: 'N/A' },
        { id: 4, subject: 'Cocina', teacher: 'Ing. Uriel Cambron', score: '30', approved: 'N/A' },
        { id: 5, subject: 'Redes', teacher: 'DP. Ana Karen', score: '10', approved: 'N/A' },
        { id: 6, subject: 'Pastelería', teacher: 'Chef Ana', score: '10', approved: 'N/A' },
        { id: 7, subject: 'Matemáticas', teacher: 'Chef Ana', score: '10', approved: 'N/A' },
        { id: 8, subject: 'Diseño móvil', teacher: 'Chef Ana', score: '10', approved: 'N/A' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDownloadKardex = () => {
        triggerToast('Iniciando descarga del Kardex académico oficial...');
    };

    const openGradeDetail = (grade: Grade) => {
        setSelectedGrade(grade);
        setIsModalOpen(true);
    };

    // Filtrado de materias
    const filteredGrades = grades.filter(g =>
        g.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout noPadding>
            <Head title="Mis Materias" />

            {/* Layout de Dos Columnas */}
            <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden font-body w-full">

                {/* Columna Izquierda: Historial Académico */}
                <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto lg:h-full">

                    {/* Header Banner */}
                    <PageHeaderBanner
                        title="Mis Materias"
                        subtitle="Aquí esta tu historial Académico"
                        breadcrumb="Materias"
                    />

                    {/* Table Filters & Content Area */}
                    <div className="p-0 md:p-6 flex-1 overflow-hidden lg:overflow-visible flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0 lg:min-h-fit">

                            {/* Ficha de Alumno */}
                            <StudentInfoCard
                                matricula={studentInfo.matricula}
                                name={studentInfo.name}
                                groupName={studentInfo.groupName}
                            />

                            {/* Controls: Search and Actions */}
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
                                <div className="relative flex-1 w-full text-left">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar Materia"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 shadow-none text-slate-700 placeholder-slate-400"
                                    />
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto relative">
                                    <button
                                        type="button"
                                        onClick={handleDownloadKardex}
                                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial text-sm transition-all shadow-none flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} />
                                        Descargar Kardex
                                    </button>
                                    <button type="button" className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg flex-1 md:flex-initial gap-2 px-8 text-sm hover:bg-slate-50 transition-all flex items-center justify-center">
                                        <Filter size={14} className="text-slate-400" />
                                        Filtros
                                        <ChevronDown size={12} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabla de Calificaciones */}
                            <AppTable
                                data={filteredGrades}
                                keyExtractor={(item) => item.id}
                                emptyMessage="No se encontraron materias coincidentes."
                                className="flex-1"
                                columns={[
                                    {
                                        header: "Materias",
                                        accessor: (row) => row.subject,
                                        className: "text-slate-700 font-bold text-[15px] leading-tight text-left",
                                    },
                                    {
                                        header: "Profesor",
                                        accessor: "teacher",
                                        className: "text-slate-500 font-medium text-[13px] text-left",
                                    },
                                    {
                                        header: "Calificación",
                                        accessor: "score",
                                        className: "text-slate-700 font-bold text-[14px] text-left",
                                    },
                                    {
                                        header: "Aprobado",
                                        accessor: "approved",
                                        className: "text-slate-400 font-medium text-[13px] text-left",
                                    },
                                    {
                                        header: "Calificaciones",
                                        align: "right",
                                        accessor: (row) => (
                                            <button
                                                type="button"
                                                onClick={() => openGradeDetail(row)}
                                                className="bg-[#e3f2fd] hover:bg-[#bbdefb] text-[#1e88e5] font-black h-8 px-4 rounded-lg text-[12px] transition-all"
                                            >
                                                Ver
                                            </button>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Avisos y Calendario */}
                <StudentRightSidebar />
            </div>

            {/* Modal: Detalle de Parciales */}
            <GradeDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                grade={selectedGrade}
            />

            {/* Toast Alerta */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-emerald-500 p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span className="font-semibold">{toastMessage}</span>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

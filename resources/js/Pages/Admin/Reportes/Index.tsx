import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Check, 
    Download 
} from 'lucide-react';

// Reusable components
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import QuickActionsWidget from '@/Components/QuickActionsWidget';
import DonutChartWidget from '@/Components/DonutChartWidget';

interface StudentItem {
    matricula: string;
    name: string;
    group: string;
}

const studentsList: StudentItem[] = [
    { matricula: "P001", name: "Alejandro Bautista Beltrán", group: "1°A" },
    { matricula: "P002", name: "Edson Velazques Vazques", group: "1°A" },
    { matricula: "P003", name: "Edson Velazques Vazques", group: "1°A" },
    { matricula: "P004", name: "Edson Velazques Vazques", group: "1°A" },
    { matricula: "P005", name: "Edson Velazques Vazques", group: "1°A" },
    { matricula: "P006", name: "Edson Velazques Vazques", group: "1°A" },
    { matricula: "P007", name: "Edson Velazques Vazques", group: "1°A" },
    { matricula: "P008", name: "Edson Velazques Vazques", group: "1°A" },
    { matricula: "P009", name: "María Elena Gómez", group: "2-B" },
    { matricula: "P010", name: "Carlos Alberto Peralta", group: "2-B" },
    { matricula: "P011", name: "Diana Laura Montes", group: "3-A" },
    { matricula: "P012", name: "Ana Sofía López", group: "3-A" }
];

export default function AdminReportesIndex() {
    const [selectedReport, setSelectedReport] = useState<'asistencia' | 'constancia' | 'boleta'>('asistencia');
    const [groupFilter, setGroupFilter] = useState('1°A');
    const [selectedStudentMatricula, setSelectedStudentMatricula] = useState('P001');
    const [periodFilter, setPeriodFilter] = useState('Mayo 2026');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleGroupChange = (newGroup: string) => {
        setGroupFilter(newGroup);
        const firstStudent = studentsList.find(s => s.group === newGroup);
        if (firstStudent) {
            setSelectedStudentMatricula(firstStudent.matricula);
        }
    };

    const handleDownloadReport = () => {
        if (selectedReport === 'asistencia') {
            triggerToast(`Generando Reporte de asistencia para Grupo ${groupFilter} (${periodFilter})...`);
        } else if (selectedReport === 'constancia') {
            const student = studentsList.find(s => s.matricula === selectedStudentMatricula);
            triggerToast(`Generando Constancia de estudios para ${student?.name} (${selectedStudentMatricula}) - Grupo ${groupFilter}...`);
        } else if (selectedReport === 'boleta') {
            const student = studentsList.find(s => s.matricula === selectedStudentMatricula);
            triggerToast(`Generando Boleta de calificaciones para ${student?.name} (${selectedStudentMatricula}) - Periodo ${periodFilter}...`);
        }
    };

    const filteredStudents = studentsList.filter(s => s.group === groupFilter);

    return (
        <AuthenticatedLayout>
            <Head title="Reportes Oficiales" />

            {/* Toast Alerta */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-[#1e88e5] p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Layout Wrapper split into Main Content and Right Sidebar */}
            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] font-body overflow-x-hidden -m-6 md:-m-8">
                
                {/* Main Content Column */}
                <div className="flex-1 flex flex-col min-w-0">
                    
                    {/* Header Banner */}
                    <PageHeaderBanner 
                        title="Reportes oficiales"
                        subtitle="Generación y consulta de expedientes grupales y personales"
                        breadcrumb="Reportes"
                    />

                    {/* Content Panel Area */}
                    <div className="p-0 md:p-6 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0">
                            
                            <h3 className="font-extrabold text-slate-800 text-lg mb-6 tracking-tight">Panel de Reportes Oficiales</h3>
                            
                            {/* Dashboard Control Box */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 flex-1 min-h-0">
                                
                                {/* Left Section: Report Selection Options (Takes 3 columns) */}
                                <div className="col-span-1 md:col-span-3 space-y-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selecciona el tipo de reporte</span>
                                    
                                    {/* Option 1: Asistencia */}
                                    <div 
                                        onClick={() => setSelectedReport('asistencia')}
                                        className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                            selectedReport === 'asistencia'
                                                ? 'bg-blue-50/50 border-[#1e88e5] shadow-sm animate-none'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="text-left">
                                            <span className="font-extrabold text-slate-800 text-sm block">Reportes de asistencia</span>
                                            <span className="text-[11px] text-slate-400 font-bold block mt-1 leading-tight">
                                                Descarga formato de asistencia mensual por grupo
                                            </span>
                                        </div>
                                    </div>

                                    {/* Option 2: Constancia */}
                                    <div 
                                        onClick={() => setSelectedReport('constancia')}
                                        className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                            selectedReport === 'constancia'
                                                ? 'bg-blue-50/50 border-[#1e88e5] shadow-sm animate-none'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="text-left">
                                            <span className="font-extrabold text-slate-800 text-sm block">Constancia de estudios</span>
                                            <span className="text-[11px] text-slate-400 font-bold block mt-1 leading-tight">
                                                Generación de constancias de inscripción oficial
                                            </span>
                                        </div>
                                    </div>

                                    {/* Option 3: Boleta */}
                                    <div 
                                        onClick={() => setSelectedReport('boleta')}
                                        className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                            selectedReport === 'boleta'
                                                ? 'bg-blue-50/50 border-[#1e88e5] shadow-sm animate-none'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="text-left">
                                            <span className="font-extrabold text-slate-800 text-sm block">Boleta de calificaciones</span>
                                            <span className="text-[11px] text-slate-400 font-bold block mt-1 leading-tight">
                                                Visualización y descarga de calificaciones por periodo
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Filters and Action Buttons (Takes 2 columns) */}
                                <div className="col-span-1 md:col-span-2 border border-slate-100 bg-slate-50/50 rounded-2xl p-6 flex flex-col gap-6 h-fit">
                                    <div className="space-y-5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parámetros del Reporte</span>
                                        
                                        {/* Group filter dropdown */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar Grupo por:</label>
                                            <div>
                                                <select
                                                    value={groupFilter}
                                                    onChange={e => handleGroupChange(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1e88e5] text-xs font-bold text-slate-700 transition-all focus:outline-none focus:border-[#1e88e5]"
                                                >
                                                    <option value="1°A">1°A</option>
                                                    <option value="2-B">2-B</option>
                                                    <option value="3-A">3-A</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Student filter dropdown (only for constancia or boleta) */}
                                        {(selectedReport === 'constancia' || selectedReport === 'boleta') && (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seleccionar Alumno:</label>
                                                <div>
                                                    <select
                                                        value={selectedStudentMatricula}
                                                        onChange={e => setSelectedStudentMatricula(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1e88e5] text-xs font-bold text-slate-700 transition-all focus:outline-none focus:border-[#1e88e5]"
                                                    >
                                                        {filteredStudents.map((s) => (
                                                            <option key={s.matricula} value={s.matricula}>
                                                                {s.name} ({s.matricula})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Period filter dropdown (only for asistencia or boleta) */}
                                        {(selectedReport === 'asistencia' || selectedReport === 'boleta') && (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar por Periodo:</label>
                                                <div>
                                                    <select
                                                        value={periodFilter}
                                                        onChange={e => setPeriodFilter(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1e88e5] text-xs font-bold text-slate-700 transition-all focus:outline-none focus:border-[#1e88e5]"
                                                    >
                                                        <option value="Mayo 2026">Mayo 2026</option>
                                                        <option value="Junio 2026">Junio 2026</option>
                                                        <option value="Julio 2026">Julio 2026</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 pt-2">
                                        <button 
                                            onClick={handleDownloadReport}
                                            className="w-full bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-none"
                                        >
                                            <Download className="w-4 h-4" />
                                            Generar y Descargar
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSelectedReport('asistencia');
                                                setGroupFilter('1°A');
                                                setSelectedStudentMatricula('P001');
                                                setPeriodFilter('Mayo 2026');
                                                triggerToast('Filtros restablecidos.');
                                            }}
                                            className="w-full border border-slate-200 text-slate-500 font-bold h-12 rounded-xl flex items-center justify-center gap-2 text-xs hover:bg-slate-50 transition-all"
                                        >
                                            Restablecer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="w-full lg:w-[320px] bg-white border-l border-slate-100 p-6 space-y-8 shrink-0">
                    
                    {/* Quick Summary Widget */}
                    <QuickSummaryWidget 
                        metrics={[
                            { code: "T1", label: "Descargas totales", value: 45 },
                            { code: "T3", label: "Asistencia", value: 20 },
                            { code: "T4", label: "Calificaciones", value: 25 }
                        ]}
                    />

                    {/* Quick Actions Widget */}
                    <QuickActionsWidget 
                        actions={[
                            { 
                                label: "Descargar Todo", 
                                onClick: () => triggerToast("Generando paquete completo de reportes oficiales (Asistencia, Constancias y Boletas) para el ciclo actual...") 
                            },
                            { 
                                label: "Auditar Descargas", 
                                onClick: () => alert("Módulo de auditoría de descargas en desarrollo.") 
                            }
                        ]}
                    />

                    {/* Donut Chart Widget */}
                    <DonutChartWidget 
                        title="Formato de Descargas"
                        centerLabel="archivos"
                        segments={[
                            { name: "Asistencia (PDF)", count: 20, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                            { name: "Boletas (PDF)", count: 25, color: "#e2e8f0", bulletClass: "bg-slate-200" }
                        ]}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

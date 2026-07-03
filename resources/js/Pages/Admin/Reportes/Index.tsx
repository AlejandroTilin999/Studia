import { useState } from 'react';
import ReportSelector from './ReportSelector';
import ReportParams from './ReportParams';
import AdminPageLayout from '@/Components/AdminPageLayout';

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

    const handleReset = () => {
        setSelectedReport('asistencia');
        setGroupFilter('1°A');
        setSelectedStudentMatricula('P001');
        setPeriodFilter('Mayo 2026');
        triggerToast('Filtros restablecidos.');
    };

    const filteredStudents = studentsList.filter(s => s.group === groupFilter);

    return (
        <AdminPageLayout
            headTitle="Reportes Oficiales"
            title="Reportes oficiales"
            subtitle="Generación y consulta de expedientes grupales y personales"
            breadcrumb="Reportes"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Descargas totales", value: 45 },
                { code: "T3", label: "Asistencia", value: 20 },
                { code: "T4", label: "Calificaciones", value: 25 }
            ]}
            quickActions={[
                { 
                    label: "Descargar Todo", 
                    onClick: () => triggerToast("Generando paquete completo de reportes oficiales (Asistencia, Constancias y Boletas) para el ciclo actual...") 
                },
                { 
                    label: "Auditar Descargas", 
                    onClick: () => alert("Módulo de auditoría de descargas en desarrollo.") 
                }
            ]}
            donutChartTitle="Formato de Descargas"
            donutChartLabel="archivos"
            donutChartSegments={[
                { name: "Asistencia (PDF)", count: 20, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "Boletas (PDF)", count: 25, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            <h3 className="font-extrabold text-slate-800 text-lg mb-6 tracking-tight text-left">Panel de Reportes Oficiales</h3>
            
            {/* Dashboard Control Box */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 flex-1 min-h-0">
                <ReportSelector 
                    selectedReport={selectedReport}
                    setSelectedReport={setSelectedReport}
                />

                <ReportParams 
                    selectedReport={selectedReport}
                    groupFilter={groupFilter}
                    onGroupChange={handleGroupChange}
                    selectedStudentMatricula={selectedStudentMatricula}
                    setSelectedStudentMatricula={setSelectedStudentMatricula}
                    periodFilter={periodFilter}
                    setPeriodFilter={setPeriodFilter}
                    filteredStudents={filteredStudents}
                    onDownload={handleDownloadReport}
                    onReset={handleReset}
                />
            </div>
        </AdminPageLayout>
    );
}

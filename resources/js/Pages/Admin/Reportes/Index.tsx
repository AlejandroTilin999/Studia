import { useState, useEffect } from 'react';
import ReportSelector from './ReportSelector';
import ReportParams from './ReportParams';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { Download, FileText } from 'lucide-react';

interface StudentItem {
    matricula: string;
    nombre: string;
    grupo_id: number;
}

interface GroupItem {
    id: number;
    nombre: string;
}

interface PeriodItem {
    id: number;
    nombre: string;
}

interface AdminReportesProps {
    groups: GroupItem[];
    students: StudentItem[];
    periods: PeriodItem[];
}

export default function AdminReportesIndex({ groups = [], students = [], periods = [] }: AdminReportesProps) {
    const { toastMessage, triggerToast } = useToast();
    const [selectedReport, setSelectedReport] = useState<'asistencia' | 'constancia' | 'boleta'>('asistencia');

    // Inicializar filtros de forma segura
    const [groupFilter, setGroupFilter] = useState<string>('');
    const [selectedStudentMatricula, setSelectedStudentMatricula] = useState<string>('');
    const [periodFilter, setPeriodFilter] = useState<string>('');

    useEffect(() => {
        if (groups.length > 0 && !groupFilter) {
            setGroupFilter(groups[0].id.toString());
        }
        if (periods.length > 0 && !periodFilter) {
            setPeriodFilter(periods[0].id.toString());
        }
        if (students.length > 0 && !selectedStudentMatricula) {
            setSelectedStudentMatricula(students[0].matricula);
        }
    }, [groups, periods, students]);

    const handleGroupChange = (newGroupId: string) => {
        setGroupFilter(newGroupId);
        // Al cambiar de grupo, intentar seleccionar al primer alumno de ese grupo
        const firstStudentOfGroup = students.find(s => s.grupo_id?.toString() === newGroupId);
        if (firstStudentOfGroup) {
            setSelectedStudentMatricula(firstStudentOfGroup.matricula);
        } else {
            setSelectedStudentMatricula('');
        }
    };

    const handleDownloadReport = () => {
        const groupName = groups.find(g => g.id.toString() === groupFilter)?.nombre || 'Desconocido';
        const periodName = periods.find(p => p.id.toString() === periodFilter)?.nombre || 'Desconocido';

        if (selectedReport === 'asistencia') {
            SwalHelper.alert('Generando Reporte', `Generando Reporte de asistencia para Grupo ${groupName} (${periodName})...`, 'info');
        } else if (selectedReport === 'constancia') {
            const student = students.find(s => s.matricula === selectedStudentMatricula);
            if (!student) return SwalHelper.error('Error', 'Debe seleccionar un alumno válido.');
            SwalHelper.alert('Generando Constancia', `Generando Constancia de estudios para ${student.nombre} (${selectedStudentMatricula}) - Grupo ${groupName}...`, 'info');
        } else if (selectedReport === 'boleta') {
            const student = students.find(s => s.matricula === selectedStudentMatricula);
            if (!student) return SwalHelper.error('Error', 'Debe seleccionar un alumno válido.');
            SwalHelper.alert('Generando Boleta', `Generando Boleta de calificaciones para ${student.nombre} (${selectedStudentMatricula}) - Ciclo ${periodName}...`, 'info');
        }
    };

    const handleReset = () => {
        setSelectedReport('asistencia');
        setGroupFilter(groups[0]?.id?.toString() || '');
        setSelectedStudentMatricula(students[0]?.matricula || '');
        setPeriodFilter(periods[0]?.id?.toString() || '');
        SwalHelper.toast('Filtros restablecidos.', 'info');
    };

    const filteredStudents = students.filter(s => s.grupo_id?.toString() === groupFilter);

    return (
        <AdminPageLayout
            headTitle="Reportes Oficiales"
            title="Reportes oficiales"
            subtitle="Generación y consulta de expedientes grupales y personales"
            breadcrumb="Reportes"
            metrics={[
                { code: "T1", label: "Descargas totales", value: "45" },
                { code: "T3", label: "Asistencia", value: "20" },
                { code: "T4", label: "Calificaciones", value: "25" }
            ]}
            quickActions={[
                {
                    label: "Descargar Todo",
                    onClick: () => SwalHelper.alert("Procesando", "Generando paquete completo de reportes oficiales (Asistencia, Constancias y Boletas) para el ciclo actual...", "info"),
                    icon: Download
                },
                {
                    label: "Auditar Descargas",
                    onClick: () => SwalHelper.alert("En desarrollo", "Módulo de auditoría de descargas en desarrollo.", "info"),
                    icon: FileText
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
                    groups={groups}
                    periods={periods}
                    onDownload={handleDownloadReport}
                    onReset={handleReset}
                />
            </div>
        </AdminPageLayout>
    );
}

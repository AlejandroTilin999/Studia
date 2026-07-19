import { useState, useEffect } from 'react';
import { Deferred } from '@inertiajs/react';
import ReportSelector from './ReportSelector';
import ReportParams from './ReportParams';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { Download, FileText } from 'lucide-react';
import DotsLoader from '@/Components/ui/DotsLoader';

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
    const [selectedReport, setSelectedReport] = useState<'asistencia' | 'constancia' | 'boleta' | 'kardex' | null>('asistencia');

    // Inicializar filtros vacíos para forzar selección manual
    const [groupFilter, setGroupFilter] = useState<string>('');
    const [selectedStudentMatricula, setSelectedStudentMatricula] = useState<string>('');
    const [periodFilter, setPeriodFilter] = useState<string>('');

    useEffect(() => {
        // Quitamos la selección automática por defecto
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
        if (!selectedReport) {
            SwalHelper.alert('Selección requerida', 'Por favor, selecciona primero el tipo de documento que deseas generar.', 'warning');
            return;
        }

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
        } else if (selectedReport === 'kardex') {
            const student = students.find(s => s.matricula === selectedStudentMatricula);
            if (!student) return SwalHelper.error('Error', 'Debe seleccionar un alumno válido.');
            SwalHelper.alert('Generando Kardex', `Generando Historial Académico (Kardex) para ${student.nombre} (${selectedStudentMatricula})...`, 'info');
        }
    };

    const handleReset = () => {
        setGroupFilter('');
        setSelectedStudentMatricula('');
        setPeriodFilter('');
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
                { name: "Asistencia (PDF)", count: 20, color: "#0266E0", bulletClass: "bg-[#0266E0]" },
                { name: "Boletas (PDF)", count: 25, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            <Deferred data={["groups", "students", "periods"]} fallback={
                <DotsLoader
                    label="Cargando reportes"
                    sublabel="Por favor espera un momento..."
                />
            }>
                <div className="flex-1 flex flex-col py-2 animate-in fade-in duration-500 h-full">
                    <div className="mb-10 text-left">
                        <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-3xl">
                            Desde este panel puedes generar y descargar toda la documentación oficial del centro escolar.
                            Selecciona el tipo de documento que necesites, ajusta los filtros según el grupo o alumno y obtén el reporte en formato PDF listo para impresión.
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-10">
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

                        {/* Espaciador para empujar el contenido hacia arriba si hay mucho espacio */}
                        <div className="flex-1" />
                    </div>
                </div>
            </Deferred>
        </AdminPageLayout>
    );
}

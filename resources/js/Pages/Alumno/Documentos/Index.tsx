import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    Check,
    Eye
} from 'lucide-react';
import StudentRightSidebar from '@/Components/StudentRightSidebar';
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import StudentInfoCard from '@/Components/StudentInfoCard';
import ReportDocCard from '@/Components/ReportDocCard';
import AppTable from '@/Components/table/AppTable';

export default function AlumnoDocumentosIndex() {
    const { auth } = usePage().props as any;

    const studentInfo = {
        name: auth?.user?.name || 'Alejandro Bautista Beltrán',
        matricula: 'P001',
        groupName: '1°A',
    };

    // Historial de documentos generados de la maqueta
    const [downloadHistory] = useState([
        { id: 1, type: 'Kárdex', period: 'Enero-Abril', date: '10/05/2026' },
        { id: 2, type: 'Constancia', period: 'Enero-Abril', date: '10/05/2026' },
        { id: 3, type: 'Reporte de asistencia', period: 'Enero-Abril', date: '10/05/2026' }
    ]);

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDownloadPDF = (docName: string) => {
        triggerToast(`Descargando PDF: ${docName}...`);
    };

    const handleViewReport = (docName: string) => {
        triggerToast(`Abriendo reporte: ${docName}...`);
    };

    return (
        <AuthenticatedLayout noPadding>
            <Head title="Centro de Trámites y Reportes" />

            {/* Layout de Dos Columnas */}
            <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden font-body w-full">

                {/* Columna Izquierda: Reportes y Trámites */}
                <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto lg:h-full">

                    {/* Header Banner */}
                    <PageHeaderBanner
                        title="Centro de trámites y reportes"
                        subtitle={`Hola ${studentInfo.name.split(' ')[0]}`}
                        breadcrumb="Reportes"
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

                            {/* Subsección: Centro de Reportes */}
                            <div className="space-y-6 text-left">
                                <h3 className="text-base font-bold text-slate-700">Centro de Reportes</h3>

                                {/* Grid de las 4 Tarjetas de Trámite */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <ReportDocCard
                                        title="Boleta de calificaciones"
                                        description="Descarga tu boleta del periodo actual"
                                        icon={FileText}
                                        buttonText="Descargar PDF"
                                        buttonIcon={Download}
                                        onClick={() => handleDownloadPDF('Boleta de calificaciones')}
                                    />

                                    <ReportDocCard
                                        title="Constancia de estudios:"
                                        description="Descarga tu boleta del periodo actual"
                                        icon={FileText}
                                        buttonText="Descargar PDF"
                                        buttonIcon={Download}
                                        onClick={() => handleDownloadPDF('Constancia de estudios')}
                                    />

                                    <ReportDocCard
                                        title="Reporte de asistencia:"
                                        description="Descarga tu boleta del periodo actual"
                                        icon={Calendar}
                                        buttonText="Ver reporte"
                                        buttonIcon={Eye}
                                        onClick={() => handleViewReport('Reporte de asistencia')}
                                    />

                                    <ReportDocCard
                                        title="Estado de cuenta:"
                                        description="Descarga tu boleta del periodo actual"
                                        icon={FileText}
                                        buttonText="Descargar PDF"
                                        buttonIcon={Download}
                                        onClick={() => handleDownloadPDF('Estado de cuenta')}
                                    />

                                </div>
                            </div>

                            {/* Tabla del Historial de Solicitudes */}
                            <div className="mt-8 flex-1">
                                <AppTable
                                    data={downloadHistory}
                                    keyExtractor={(item) => item.id}
                                    columns={[
                                        {
                                            header: "Documento",
                                            accessor: (row) => row.type,
                                            className: "text-slate-700 font-bold text-[15px] leading-tight",
                                        },
                                        {
                                            header: "Periodo",
                                            accessor: "period",
                                            className: "text-slate-500 font-medium text-[13px]",
                                        },
                                        {
                                            header: "Fecha de solicitud",
                                            accessor: "date",
                                            className: "text-slate-500 font-medium text-[13px]",
                                        },
                                        {
                                            header: "Acción",
                                            align: "right",
                                            accessor: (row) => (
                                                <button
                                                    onClick={() => handleViewReport(row.type)}
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
                </div>

                {/* Columna Derecha: Avisos y Calendario */}
                <StudentRightSidebar />
            </div>

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

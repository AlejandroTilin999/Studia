import { useState, useEffect } from 'react';
import { Deferred, router } from '@inertiajs/react';
import ReportSelector from './ReportSelector';
import ReportParams from './ReportParams';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { Download, FileText, FilePlus, History, Home, Users } from 'lucide-react';
import DotsLoader from '@/Components/ui/DotsLoader';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { generateAttendanceHTML } from './generators/AttendanceGenerator';
import { generateCertificateHTML } from './generators/CertificateGenerator';
import { generateGradeReportHTML } from './generators/GradeReportGenerator';
import { generateKardexHTML } from './generators/KardexGenerator';
import AuditHistory from './components/AuditHistory';
import BatchDownloadModal from './components/BatchDownloadModal';

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
    stats?: {
        total: number;
        asistencia: number;
        boleta: number;
        constancia: number;
        historial: number;
        lote: number;
    };
    recentDownloads?: any[];
    defaultPeriodId?: number | null;
}

export default function AdminReportesIndex({ groups = [], students = [], periods = [], stats, recentDownloads = [], defaultPeriodId = null }: AdminReportesProps) {
    const { toastMessage, triggerToast } = useToast();

    // Recuperar la pestaña activa de localStorage o por defecto 'generador'
    const [activeTab, setActiveTab] = useState<'generador' | 'historial'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('reportes_active_tab') as any) || 'generador';
        }
        return 'generador';
    });

    const [selectedReport, setSelectedReport] = useState<'asistencia' | 'constancia' | 'boleta' | 'kardex' | null>('asistencia');

    const [groupFilter, setGroupFilter] = useState<string>('');
    const [selectedStudentMatricula, setSelectedStudentMatricula] = useState<string>('');
    const [periodFilter, setPeriodFilter] = useState<string>(() => defaultPeriodId?.toString() ?? '');
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);

    useEffect(() => {
        // Guardar la pestaña activa en localStorage cada vez que cambie
        localStorage.setItem('reportes_active_tab', activeTab);
    }, [activeTab]);

    const logDownload = (type: string, sujeto: string, metadata: any = {}) => {
        router.post(route('admin.reportes.log_download'), {
            tipo_reporte: type,
            sujeto: sujeto,
            metadata: metadata
        }, {
            preserveScroll: true,
            preserveState: true,
            only: ['stats', 'recentDownloads'],
            onFinish: () => {
                // No necesitamos hacer nada extra, Inertia actualiza las props stats y recentDownloads
            }
        });
    };

    const handleViewHistoryItem = async (item: any) => {
        const { tipo, metadata } = item;

        if (!metadata) {
            SwalHelper.alert("Información no disponible", "Este registro es antiguo y no cuenta con los metadatos necesarios para reconstruir el documento.", "warning");
            return;
        }

        SwalHelper.loading("Recuperando Documento", `Reconstruyendo ${tipo} oficial del historial...`);

        try {
            let htmlContent = '';
            let iframeId = 'audit-print-iframe';

            if (tipo === 'asistencia') {
                const response = await axios.get(route('admin.reportes.asistencia_data', {
                    grupo_id: metadata.grupo_id,
                    ciclo_id: metadata.ciclo_id
                }));
                htmlContent = generateAttendanceHTML(response.data);
            } else if (tipo === 'constancia') {
                const response = await axios.get(route('admin.reportes.constancia_data', {
                    matricula: metadata.matricula
                }));
                htmlContent = generateCertificateHTML(response.data);
            } else if (tipo === 'boleta') {
                const response = await axios.get(route('admin.reportes.boleta_data', {
                    matricula: metadata.matricula,
                    periodId: metadata.ciclo_id
                }));
                htmlContent = generateGradeReportHTML(response.data);
            } else if (tipo === 'historial') {
                const response = await axios.get(route('admin.reportes.kardex_data_full', {
                    matricula: metadata.matricula
                }));
                htmlContent = generateKardexHTML(response.data);
            } else if (tipo === 'lote') {
                // Re-procesar lote completo
                const response = await axios.post(route('admin.reportes.batch_data'), {
                    tipo_reporte: metadata.tipo_reporte || 'boleta', // Fallback si no está en metadata
                    grupo_id: metadata.grupo_id,
                    ciclo_id: metadata.ciclo_id
                }, { timeout: 300000 });

                const { items, tipo: loteTipo } = response.data;
                let fullHtml = `<html><head><style>@media print { .page-break { page-break-after: always; } }</style></head><body>`;
                items.forEach((data: any, idx: number) => {
                    let rHtml = (loteTipo === 'boleta') ? generateGradeReportHTML(data) : (loteTipo === 'constancia' ? generateCertificateHTML(data) : generateAttendanceHTML(data));
                    fullHtml += `<div class="${idx < items.length - 1 ? 'page-break' : ''}">${rHtml}</div>`;
                });
                fullHtml += `</body></html>`;
                htmlContent = fullHtml;
            }

            // Disparar impresión
            let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = iframeId;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            const doc = iframe.contentWindow?.document || iframe.contentDocument;
            if (doc) {
                doc.open();
                doc.write(htmlContent);
                doc.close();

                setTimeout(() => {
                    SwalHelper.close();
                    setTimeout(() => {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();
                    }, 800);
                }, 500);
            }

        } catch (error) {
            console.error(error);
            SwalHelper.error("Error al visualizar", "No se pudo recuperar la información original del documento.");
        }
    };

    const handleDeleteDownload = (item: any) => {
        SwalHelper.confirm(
            "¿Eliminar Registro?",
            `¿Estás seguro de que deseas eliminar permanentemente el folio ${item.folio} del historial?`,
            "Sí, eliminar",
            "Cancelar",
            "error"
        ).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.reportes.log_destroy', { id: item.id }), {
                    preserveScroll: true,
                    preserveState: true,
                    onStart: () => SwalHelper.loading("Eliminando...", "Borrando registro del historial."),
                    onSuccess: () => {
                        SwalHelper.success("¡Eliminado!", "El registro ha sido removido del historial.");
                    },
                    onError: () => {
                        SwalHelper.error("Error", "No se pudo eliminar el registro.");
                    }
                });
            }
        });
    };

    const handleClearHistory = () => {
        SwalHelper.confirm(
            "¿Vaciar Todo el Historial?",
            "Esta acción eliminará permanentemente TODOS los registros de descargas realizados hasta ahora. Esta acción no se puede deshacer.",
            "Sí, vaciar todo",
            "Cancelar",
            "error"
        ).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.reportes.history_clear'), {
                    preserveScroll: true,
                    preserveState: true,
                    onStart: () => SwalHelper.loading("Limpiando...", "Vaciando todo el historial de auditoría."),
                    onSuccess: () => {
                        SwalHelper.success("¡Historial Limpio!", "Se han eliminado todos los registros correctamente.");
                    },
                    onError: () => {
                        SwalHelper.error("Error", "No se pudo vaciar el historial.");
                    }
                });
            }
        });
    };

    const handleProcessBatch = async ({ tipo, grupo_id, ciclo_id }: any) => {
        setIsBatchProcessing(true);
        SwalHelper.loading("Generando Paquete Grupal", `Preparando ${tipo}s para todo el grupo...`);

        try {
            const response = await axios.post(route('admin.reportes.batch_data'), {
                tipo_reporte: tipo,
                grupo_id,
                ciclo_id
            }, {
                timeout: 300000 // 5 minutos de espera en el cliente
            });

            const { items, count } = response.data;

            if (count === 0) {
                SwalHelper.alert("Sin datos", "No hay alumnos inscritos en este grupo para el ciclo seleccionado.", "warning");
                setIsBatchProcessing(false);
                return;
            }

            // Crear el iframe de lote
            let iframe = document.getElementById('batch-print-iframe') as HTMLIFrameElement;
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'batch-print-iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            // Generar contenido concatenado
            // Cada generador devuelve un <html>...</html>.
            // Para simplificar, vamos a extraer el contenido del body o simplemente envolverlos.
            // Los navegadores modernos manejan bien múltiples <html> en un iframe, pero por orden:
            let fullHtml = `<html><head><style>@media print { .page-break { page-break-after: always; } }</style></head><body>`;

            items.forEach((data: any, idx: number) => {
                let reportHtml = '';
                if (tipo === 'boleta') reportHtml = generateGradeReportHTML(data);
                else if (tipo === 'constancia') reportHtml = generateCertificateHTML(data);
                else reportHtml = generateAttendanceHTML(data);

                // Envolver cada reporte en un div con salto de página
                fullHtml += `<div class="${idx < items.length - 1 ? 'page-break' : ''}">${reportHtml}</div>`;
            });

            fullHtml += `</body></html>`;

            const doc = iframe.contentWindow?.document || iframe.contentDocument;
            if (doc) {
                doc.open();
                doc.write(fullHtml);
                doc.close();

                setTimeout(() => {
                    SwalHelper.success("¡Paquete Generado!", `Se han preparado ${count} documentos exitosamente.`);
                    const groupName = groups.find(g => g.id.toString() === grupo_id)?.nombre || 'GRUPO';
                    logDownload('lote', `${tipo.toUpperCase()}S - ${groupName}`, { grupo_id, ciclo_id, count, tipo_reporte: tipo });
                    setIsBatchProcessing(false);
                    setIsBatchModalOpen(false);
                    setTimeout(() => {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();
                    }, 1000);
                }, 500);
            }
        } catch (error) {
            console.error(error);
            SwalHelper.error("Error", "No se pudo procesar la descarga por lote.");
            setIsBatchProcessing(false);
        }
    };

    const handleGroupChange = (newGroupId: string) => {
        setGroupFilter(newGroupId);
        const firstStudentOfGroup = students.find(s => s.grupo_id?.toString() === newGroupId);
        if (firstStudentOfGroup) {
            setSelectedStudentMatricula(firstStudentOfGroup.matricula);
        } else {
            setSelectedStudentMatricula('');
        }
    };

    const handleDownloadReport = async () => {
        if (!selectedReport) {
            SwalHelper.alert('Selección requerida', 'Por favor, selecciona primero el tipo de documento que deseas generar.', 'warning');
            return;
        }

        const effectivePeriodId = periodFilter || defaultPeriodId?.toString() || '';

        // VALIDACIÓN ESPECÍFICA POR REPORTE
        if (selectedReport === 'asistencia') {
            if (!groupFilter) {
                SwalHelper.alert('Filtro requerido', 'Debes seleccionar un Grupo para generar la lista de asistencia.', 'warning');
                return;
            }
        } else if (selectedReport === 'constancia' || selectedReport === 'kardex') {
            if (!selectedStudentMatricula) {
                SwalHelper.alert('Alumno requerido', 'Por favor, selecciona a un alumno para generar este documento.', 'warning');
                return;
            }
        } else if (selectedReport === 'boleta') {
            if (!selectedStudentMatricula || !effectivePeriodId) {
                SwalHelper.alert('Filtros requeridos', 'Debes seleccionar un alumno y un periodo para generar este documento.', 'warning');
                return;
            }
        }

        const groupName = groups.find(g => g.id.toString() === groupFilter)?.nombre || 'Desconocido';
        const periodName = periods.find(p => p.id.toString() === effectivePeriodId)?.nombre || 'Desconocido';

        if (selectedReport === 'asistencia') {
            SwalHelper.loading("Generando Reporte", "Preparando lista de asistencia oficial...");

            try {
                const response = await axios.get(route('admin.reportes.asistencia_data', {
                    grupo_id: groupFilter,
                    ciclo_id: effectivePeriodId
                }));

                const { group, period, enrollments, generated_at } = response.data;

                // EL SECRETO: Usar un iframe oculto para renderizado perfecto en cliente
                let iframe = document.getElementById('attendance-print-iframe') as HTMLIFrameElement;
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'attendance-print-iframe';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }

                const htmlContent = generateAttendanceHTML({ group, period, enrollments, generated_at });

                const doc = iframe.contentWindow?.document || iframe.contentDocument;
                if (doc) {
                    doc.open();
                    doc.write(htmlContent);
                    doc.close();

                    setTimeout(() => {
                        SwalHelper.success("¡Documento Generado!", "La lista de asistencia se ha procesado correctamente.");
                        logDownload('asistencia', group.nombre, { grupo_id: groupFilter, ciclo_id: periodFilter });
                        setTimeout(() => {
                            iframe.contentWindow?.focus();
                            iframe.contentWindow?.print();
                        }, 1000);
                    }, 500);
                }
            } catch (error) {
                console.error(error);
                SwalHelper.error("Error", "No se pudo obtener la información de asistencia.");
            }
        } else if (selectedReport === 'constancia') {
            const student = students.find(s => s.matricula === selectedStudentMatricula);
            if (!student) return SwalHelper.error('Error', 'Debe seleccionar un alumno válido.');

            SwalHelper.loading("Generando Constancia", "Preparando constancia de estudios oficial...");

            try {
                const response = await axios.get(route('admin.reportes.constancia_data', {
                    matricula: selectedStudentMatricula
                }));

                const data = response.data;

                let iframe = document.getElementById('certificate-print-iframe') as HTMLIFrameElement;
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'certificate-print-iframe';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }

                const htmlContent = generateCertificateHTML(data);

                const doc = iframe.contentWindow?.document || iframe.contentDocument;
                if (doc) {
                    doc.open();
                    doc.write(htmlContent);
                    doc.close();

                    setTimeout(() => {
                        SwalHelper.success("¡Documento Generado!", "La constancia se ha procesado correctamente.");
                        logDownload('constancia', data.student.nombre, { matricula: selectedStudentMatricula });
                        setTimeout(() => {
                            iframe.contentWindow?.focus();
                            iframe.contentWindow?.print();
                        }, 1000);
                    }, 500);
                }
            } catch (error) {
                console.error(error);
                SwalHelper.error("Error", "No se pudo obtener la información del alumno.");
            }
        } else if (selectedReport === 'boleta') {
            const student = students.find(s => s.matricula === selectedStudentMatricula);
            if (!student) return SwalHelper.error('Error', 'Debe seleccionar un alumno válido.');

            if (!effectivePeriodId) {
                SwalHelper.alert('Periodo requerido', 'No se ha detectado un ciclo escolar activo.', 'warning');
                return;
            }

            SwalHelper.loading("Generando Boleta", "Preparando boleta de calificaciones oficial...");

            try {
                const response = await axios.get(route('admin.reportes.boleta_data', {
                    matricula: selectedStudentMatricula,
                    periodId: effectivePeriodId
                }));

                const data = response.data;

                let iframe = document.getElementById('report-print-iframe') as HTMLIFrameElement;
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'report-print-iframe';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }

                const htmlContent = generateGradeReportHTML(data);

                const doc = iframe.contentWindow?.document || iframe.contentDocument;
                if (doc) {
                    doc.open();
                    doc.write(htmlContent);
                    doc.close();

                    setTimeout(() => {
                        SwalHelper.success("¡Documento Generado!", "La boleta de calificaciones se ha generado correctamente.");
                        logDownload('boleta', data.student.nombre, { matricula: selectedStudentMatricula, ciclo_id: effectivePeriodId });
                        setTimeout(() => {
                            iframe.contentWindow?.focus();
                            iframe.contentWindow?.print();
                        }, 1000);
                    }, 500);
                }
            } catch (error) {
                console.error(error);
                SwalHelper.error("Error", "No se pudo obtener el historial de calificaciones.");
            }
        } else if (selectedReport === 'kardex') {
            const student = students.find(s => s.matricula === selectedStudentMatricula);
            if (!student) return SwalHelper.error('Error', 'Debe seleccionar un alumno válido.');

            SwalHelper.loading("Generando Historial", "Preparando historial académico oficial...");

            try {
                const response = await axios.get(route('admin.reportes.kardex_data_full', {
                    matricula: selectedStudentMatricula
                }));

                const data = response.data;

                let iframe = document.getElementById('kardex-print-iframe') as HTMLIFrameElement;
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'kardex-print-iframe';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }

                const htmlContent = generateKardexHTML(data);

                const doc = iframe.contentWindow?.document || iframe.contentDocument;
                if (doc) {
                    doc.open();
                    doc.write(htmlContent);
                    doc.close();

                    setTimeout(() => {
                        SwalHelper.success("¡Documento Generado!", "El historial académico se ha generado correctamente.");
                        logDownload('historial', data.student.nombre, { matricula: selectedStudentMatricula });
                        setTimeout(() => {
                            iframe.contentWindow?.focus();
                            iframe.contentWindow?.print();
                        }, 1000);
                    }, 500);
                }
            } catch (error) {
                console.error(error);
                SwalHelper.error("Error", "No se pudo obtener el historial académico.");
            }
        }
    };

    const handleReportChange = (report: 'asistencia' | 'constancia' | 'boleta' | 'kardex' | null) => {
        setSelectedReport(report);
        setGroupFilter('');
        setSelectedStudentMatricula('');
        setPeriodFilter(defaultPeriodId?.toString() ?? '');
    };

    const handleReset = () => {
        setGroupFilter('');
        setSelectedStudentMatricula('');
        setPeriodFilter(defaultPeriodId?.toString() ?? '');
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
                { code: "T1", label: "Descargas totales", value: stats ? (stats?.total || 0) : 0 },
                { code: "T2", label: "Asistencia", value: stats ? (stats?.asistencia || 0) : 0 },
                { code: "T3", label: "Boletas", value: stats ? (stats?.boleta || 0) : 0 },
                { code: "T4", label: "Constancias", value: stats ? (stats?.constancia || 0) : 0 }
            ]}
            isLoading={stats === null || stats === undefined}
            quickActions={[
                {
                    label: "Descarga por Lote",
                    onClick: () => setIsBatchModalOpen(true),
                    icon: Download
                },
                {
                    label: "Panel de Control",
                    onClick: () => router.visit(route('admin.dashboard')),
                    icon: Home
                },
                {
                    label: "Control de Alumnos",
                    onClick: () => router.visit(route('admin.alumnos.index')),
                    icon: Users
                }
            ]}
            donutChartTitle="Formato de Descargas"
            donutChartLabel="archivos"
            donutChartSegments={[
                { name: "Asistencia", count: stats?.asistencia || 0, color: "#0266E0", bulletClass: "bg-[#0266E0]" },
                { name: "Boletas", count: stats?.boleta || 0, color: "#e2e8f0", bulletClass: "bg-slate-200" },
                { name: "Constancias", count: stats?.constancia || 0, color: "#94a3b8", bulletClass: "bg-slate-400" },
                { name: "Historiales", count: stats?.historial || 0, color: "#64748b", bulletClass: "bg-slate-500" }
            ]}
        >
            <div className="flex-1 flex flex-col py-2 animate-in fade-in duration-500 h-full">

                {/* Header Pestañas */}
                <div className="flex items-center gap-8 border-b border-slate-100 mb-10 pb-0.5 select-none">
                    <button
                        onClick={() => setActiveTab('generador')}
                        className={cn(
                            "flex items-center gap-2.5 pb-4 px-1 text-[13px] font-black uppercase tracking-widest transition-all relative",
                            activeTab === 'generador'
                                ? "text-[#0266E0]"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <FilePlus size={16} />
                        Generación de Documentos
                        {activeTab === 'generador' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0266E0] rounded-full animate-in slide-in-from-left-2 duration-300" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('historial')}
                        className={cn(
                            "flex items-center gap-2.5 pb-4 px-1 text-[13px] font-black uppercase tracking-widest transition-all relative",
                            activeTab === 'historial'
                                ? "text-[#0266E0]"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <History size={16} />
                        Historial de Auditoría
                        {activeTab === 'historial' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0266E0] rounded-full animate-in slide-in-from-left-2 duration-300" />
                        )}
                    </button>
                </div>

                <div className="flex-1 flex flex-col gap-10">
                    {activeTab === 'generador' ? (
                        <div className="space-y-12 animate-in fade-in zoom-in-99 duration-500">
                            <div className="text-left">
                                <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-3xl">
                                    Genera documentos oficiales del centro escolar. Selecciona el tipo de reporte, ajusta los filtros y obtén un archivo PDF listo para impresión.
                                </p>
                            </div>

                            <ReportSelector
                                selectedReport={selectedReport}
                                setSelectedReport={handleReportChange}
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
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <AuditHistory
                                downloads={recentDownloads}
                                onViewItem={handleViewHistoryItem}
                                onDeleteItem={handleDeleteDownload}
                                onClearHistory={handleClearHistory}
                            />
                        </div>
                    )}

                    <div className="flex-1" />
                </div>
            </div>

            <BatchDownloadModal
                isOpen={isBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
                groups={groups}
                periods={periods}
                processing={isBatchProcessing}
                onProcess={handleProcessBatch}
            />
        </AdminPageLayout>
    );
}

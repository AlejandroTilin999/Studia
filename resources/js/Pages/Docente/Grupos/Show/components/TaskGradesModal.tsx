import React from 'react';
import { Calendar, FileText, ChevronRight, ChevronLeft, ExternalLink, Image as ImageIcon, FileSpreadsheet, FileArchive, Globe, ChevronDown } from 'lucide-react';
import PdfIcon from '@/Components/ui/PdfIcon';
import { Task, StudentGrade } from '../services/constants';
import GradeSelector from './GradeSelector';
import BackButton from '@/Components/common/BackButton';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import { SwalHelper } from '@/utils/SwalHelper';

const getFileIcon = (filename: string = '') => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
        return <ImageIcon size={16} className="text-emerald-500 shrink-0" />;
    }
    if (['pdf'].includes(ext)) {
        return <PdfIcon size={18} className="shrink-0" />;
    }
    if (['doc', 'docx'].includes(ext)) {
        return <FileText size={16} className="text-blue-600 shrink-0" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return <FileSpreadsheet size={16} className="text-emerald-600 shrink-0" />;
    }
    if (['zip', 'rar', '7z'].includes(ext)) {
        return <FileArchive size={16} className="text-amber-500 shrink-0" />;
    }
    return <Globe size={16} className="text-[#0266E0] shrink-0" />;
};

const formatHumanDate = (dateStr?: string) => {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 1 && diffDays < 7) {
        return date.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^\w/, (c) => c.toUpperCase());
    }

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

interface TaskGradesModalProps {
    selectedTaskId: number;
    setSelectedTaskId: (id: number | null) => void;
    tasks: Task[];
    studentGrades: StudentGrade[];
    selectedStudentId: number | null;
    setSelectedStudentId: (id: number | null) => void;
    isPdfModalOpen: boolean;
    setIsPdfModalOpen: (open: boolean) => void;
    saveTasks: (newTasks: Task[]) => void;
    returnTaskGrade: (taskId: number, studentId: number, score: string) => Promise<any>;
    isReadOnly?: boolean;
    themeKey?: string;
}

export default function TaskGradesModal({
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    studentGrades,
    selectedStudentId,
    setSelectedStudentId,
    isPdfModalOpen,
    setIsPdfModalOpen,
    saveTasks,
    returnTaskGrade,
    isReadOnly = false,
    themeKey = 'blue'
}: TaskGradesModalProps) {
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;
    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    if (!selectedTask) return null;

    const [isReturning, setIsReturning] = React.useState(false);
    const [returnedScores, setReturnedScores] = React.useState<Record<number, string>>({});
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = React.useState(false);
    const [studentSort, setStudentSort] = React.useState<'status' | 'name'>('status');
    const studentDropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
                setIsStudentDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        setReturnedScores({});
    }, [selectedTaskId]);

    const currentStudentId = selectedStudentId || (studentGrades[0]?.id);
    const currentIndex = studentGrades.findIndex(s => s.id === currentStudentId);
    const activeStudent = studentGrades[currentIndex] || studentGrades[0];
    const currentScore = activeStudent ? String(selectedTask.calificaciones?.[activeStudent.id] ?? '') : '';
    const wasReturned = activeStudent ? returnedScores[activeStudent.id] === currentScore : false;

    const getStudentStatus = (studentId: number) => {
        const grade = selectedTask.calificaciones?.[studentId];
        const hasGrade = grade !== '' && grade !== undefined && grade !== null;
        const delivery = selectedTask.archivos?.[studentId] as any;
        const hasDelivery = Boolean(delivery && (delivery.url || delivery.raw_url || delivery));

        if (hasGrade) return { label: 'Calificado', order: 0, grade };
        if (hasDelivery) return { label: 'Entregada', order: 1, grade: null };
        return { label: 'Sin entregar', order: 2, grade: null };
    };

    const orderedStudents = [...studentGrades].sort((a, b) => {
        if (studentSort === 'name') return a.nombre.localeCompare(b.nombre, 'es');
        const byStatus = getStudentStatus(a.id).order - getStudentStatus(b.id).order;
        return byStatus || a.nombre.localeCompare(b.nombre, 'es');
    });

    const studentFileRaw = activeStudent ? selectedTask.archivos?.[activeStudent.id] : null;
    
    // Parsear entrega de archivos (individual o multiple en JSON)
    const studentFilesList: Array<{ url: string; nombre?: string }> = React.useMemo(() => {
        if (!studentFileRaw) return [];

        const targetStr = (typeof studentFileRaw === 'object' && studentFileRaw.raw_url)
            ? studentFileRaw.raw_url
            : (typeof studentFileRaw === 'object' && studentFileRaw.url ? studentFileRaw.url : studentFileRaw);

        if (typeof targetStr === 'string') {
            try {
                const parsed = JSON.parse(targetStr);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }

        if (typeof studentFileRaw === 'object' && studentFileRaw.url) {
            return [studentFileRaw];
        }

        if (typeof targetStr === 'string' && targetStr.trim().length > 0) {
            return [{ url: targetStr, nombre: targetStr.split('/').pop() }];
        }

        return [];
    }, [studentFileRaw]);

    const studentFile = studentFilesList[0] || null;

    const fileNames = ["Resolucion_Algebra.pdf", "Ejercicios_Geometria.pdf", "Entregable_Final.pdf"];
    const selectedFileName = fileNames[currentIndex !== -1 ? currentIndex % fileNames.length : 0];

    function handleTaskGradeChange(taskId: number, studentId: number, scoreVal: string) {
        const targetTask = tasks.find(t => t.id === taskId);
        const maxPoints = targetTask?.puntos ?? 10;
        const score = parseFloat(scoreVal);
        if (scoreVal !== "" && (isNaN(score) || score < 0 || score > maxPoints)) return;

        saveTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    calificaciones: { ...t.calificaciones, [studentId]: scoreVal }
                };
            }
            return t;
        }));
    }

    const goToNext = () => {
        if (currentIndex < studentGrades.length - 1) {
            setSelectedStudentId(studentGrades[currentIndex + 1].id);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setSelectedStudentId(studentGrades[currentIndex - 1].id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <BackButton
                    onClick={() => setSelectedTaskId(null)}
                    label="Volver al Muro"
                    icon="chevron"
                />

                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    Calificando: {selectedTask.nombre}
                </div>
            </div>

            {/* BARRA DE NAVEGACIÓN ESTILO GOOGLE CLASSROOM (Líneas finas, responsiva a todo el ancho en móvil) */}
            <div className="sticky top-0 z-20 bg-white border-b border-slate-200/90 pb-3.5 pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">

                {/* Controles de Navegación + Contador de Alumno (Alineados a todo el ancho en móvil) */}
                <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0">
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
                        title="Alumno anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ALUMNO</span>
                        <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                            {currentIndex + 1} <span className="text-slate-400 font-normal">/</span> {studentGrades.length}
                        </span>
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={currentIndex === studentGrades.length - 1}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
                        title="Alumno siguiente"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Selector de Alumno (Estilo Google Classroom, 100% de ancho en móvil) */}
                <div className="w-full sm:flex-1 sm:min-w-[280px] max-w-full">
                    <div className="relative group w-full" ref={studentDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                            className="w-full h-11 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 border-b-2 focus:border-blue-500 flex items-center justify-between gap-2.5 transition-all select-none cursor-pointer outline-none"
                        >
                            <span className="truncate text-left font-semibold text-slate-800">
                                {activeStudent?.nombre || 'Seleccionar alumno...'}
                            </span>
                            <ChevronDown size={14} className={`text-slate-600 shrink-0 transition-transform ${isStudentDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Menú Flotante de Alumnos */}
                        {isStudentDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden text-xs">
                                <div className="flex items-center justify-end px-3 py-2 bg-slate-50 border-b border-slate-200">
                                    <label className="sr-only" htmlFor="student-status-sort">Ordenar alumnos</label>
                                    <select
                                        id="student-status-sort"
                                        value={studentSort}
                                        onChange={(event) => setStudentSort(event.target.value as 'status' | 'name')}
                                        className="bg-transparent text-[11px] font-semibold text-slate-600 outline-none cursor-pointer"
                                    >
                                        <option value="status">Ordenar por estado</option>
                                        <option value="name">Ordenar por nombre</option>
                                    </select>
                                </div>
                                <div className="overflow-y-auto max-h-[min(20rem,calc(100vh-13rem))] py-1">
                                {orderedStudents.map((s, idx) => {
                                    const status = getStudentStatus(s.id);
                                    const isSelected = s.id === currentStudentId;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedStudentId(s.id);
                                                setIsStudentDropdownOpen(false);
                                            }}
                                            style={isSelected ? { backgroundColor: `${activeTheme.strokeColor}15`, color: activeTheme.strokeColor } : undefined}
                                            className={`w-full text-left px-4 py-3 transition-colors font-medium flex items-center justify-between ${
                                                isSelected
                                                    ? 'font-bold'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[10px] text-slate-400 font-mono w-4 shrink-0 text-right">{idx + 1}.</span>
                                                <span className="truncate max-w-[200px]">{s.nombre}</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-500 shrink-0 ml-2">
                                                {status.grade !== null ? `${status.grade} / ${selectedTask.puntos || 10}` : status.label}
                                            </span>
                                        </button>
                                    );
                                })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* 1. Instrucciones de la Actividad (Arriba a la Izquierda en Desktop, Primero en Móvil) */}
                <div className="lg:col-span-7 order-1 space-y-6">
                    <div className="bg-white border border-slate-100 p-5 sm:p-6 rounded-2xl space-y-4">
                        <div className="space-y-1 text-left">
                            <span 
                                style={{ color: activeTheme.strokeColor }}
                                className="text-[9px] font-black uppercase tracking-widest block"
                            >
                                Actividad
                            </span>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedTask.nombre}</h4>
                        </div>
                        <div className="flex flex-wrap gap-3.5 text-xs text-slate-455 font-normal uppercase tracking-wide">
                            <span className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /> Límite: {formatHumanDate(selectedTask.fecha_entrega)}</span>
                            <span className="text-slate-200">|</span>
                            <span className="flex items-center gap-1"><FileText size={13} className="text-slate-400" /> Valor: {selectedTask.puntos || 10} pts</span>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-slate-100 text-left">
                            <div 
                                style={{ borderColor: activeTheme.strokeColor }}
                                className="border-l-4 pl-4 py-1 text-slate-655 text-sm font-normal text-justify leading-relaxed whitespace-pre-line"
                            >
                                {selectedTask.descripcion || 'Sin instrucciones adicionales.'}
                            </div>
                        </div>

                        {/* Materiales y Recursos Adjuntos de la Actividad (Sección de Detalles) */}
                        {(() => {
                            const rawFiles = selectedTask.attachments || (selectedTask as any).archivos_adjuntos || (selectedTask as any).materiales;
                            let filesList: any[] = [];

                            if (Array.isArray(rawFiles)) {
                                filesList = rawFiles;
                            } else if (typeof rawFiles === 'string') {
                                try {
                                    const parsed = JSON.parse(rawFiles);
                                    if (Array.isArray(parsed)) filesList = parsed;
                                    else if (parsed) filesList = [parsed];
                                } catch {
                                    if (rawFiles.trim().length > 0) filesList = [rawFiles];
                                }
                            } else if (rawFiles && typeof rawFiles === 'object') {
                                filesList = [rawFiles];
                            }

                            if (!filesList || filesList.length === 0) return null;

                            const getFileUrl = (f: any): string => {
                                if (!f) return '#';
                                if (typeof f === 'string') {
                                    const trimmed = f.trim();
                                    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) return trimmed;
                                    try {
                                        const parsed = JSON.parse(trimmed);
                                        return getFileUrl(parsed);
                                    } catch {
                                        return trimmed;
                                    }
                                }
                                return f.url || f.google_drive_url || f.archivo_url || f.raw_url || f.path || f.link || f.href || '#';
                            };

                            return (
                                <div className="pt-4 border-t border-slate-100 text-left space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                        Materiales y Recursos Adjuntos
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {filesList.map((file: any, idx: number) => {
                                            const fileUrl = getFileUrl(file);
                                            const rawName = (typeof file === 'object' && (file?.name || file?.nombre)) ? (file.name || file.nombre) : (typeof file === 'string' && !file.startsWith('http') ? file : '');
                                            const fileName = rawName || (fileUrl !== '#' ? fileUrl.split('/').pop()?.split('?')[0] : 'Archivo adjunto');
                                            const isPdf = fileName.toLowerCase().endsWith('.pdf') || (typeof file === 'object' && (file?.type || '').toLowerCase().includes('pdf'));
                                            const hasValidUrl = fileUrl !== '#' && fileUrl.length > 1;

                                            return (
                                                <a
                                                    key={idx}
                                                    href={hasValidUrl ? fileUrl : '#'}
                                                    target={hasValidUrl ? "_blank" : "_self"}
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (hasValidUrl) {
                                                            window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                                        } else {
                                                            SwalHelper.toast('Este archivo fue creado sin enlace previo. Vuelve a adjuntarlo para vincularlo a Google Drive.', 'info');
                                                        }
                                                    }}
                                                    className="flex items-center justify-between bg-white border border-slate-200/90 hover:bg-slate-50/80 hover:border-slate-300 px-3.5 py-2.5 rounded-md transition-all shadow-2xs group cursor-pointer select-none"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0 mr-2">
                                                        <div className="shrink-0 flex items-center justify-center">
                                                            {getFileIcon(fileName)}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-900 group-hover:underline truncate">
                                                            {fileName}
                                                        </span>
                                                    </div>
                                                    <ExternalLink size={16} className="text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* 2. Detalle de Calificación y Entregas (Columna Derecha en Desktop, Segundo en Móvil) */}
                <div className="lg:col-span-5 order-2 lg:row-span-2 space-y-6">
                    <div className="bg-white border border-slate-100 p-5 sm:p-6 rounded-2xl space-y-5">
                        {(() => {
                            const studentGradeVal = activeStudent ? selectedTask.calificaciones[activeStudent.id] : undefined;
                            const hasGrade = studentGradeVal !== "" && studentGradeVal !== undefined && studentGradeVal !== null;
                            const studentFile = activeStudent ? selectedTask.archivos?.[activeStudent.id] : null;
                            const hasDelivery = Boolean(studentFile && (studentFile.url || studentFile.raw_url));

                            let statusText = 'Sin entregar';
                            let statusClasses = 'text-amber-600 bg-amber-50';

                            if (hasGrade) {
                                statusText = 'Calificado';
                                statusClasses = 'text-blue-600 bg-blue-50';
                            } else if (hasDelivery) {
                                statusText = 'Entregado';
                                statusClasses = 'text-emerald-600 bg-emerald-50';
                            }

                            return (
                                <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${statusClasses}`}>
                                        {statusText}
                                    </span>
                                </div>
                            );
                        })()}
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Detalle de Calificación</span>
                            <div className="flex items-center justify-between gap-4 pt-2">
                                <span className="text-xs font-black text-slate-655 uppercase">Calificación Obtenida</span>
                                <div className="flex items-center gap-0">
                                    <GradeSelector
                                        initialValue={activeStudent ? (selectedTask.calificaciones[activeStudent.id] ?? '') : ''}
                                        max={selectedTask.puntos || 10}
                                        disabled={isReadOnly || isReturning}
                                        onChange={(val) => activeStudent && handleTaskGradeChange(selectedTask.id, activeStudent.id, val)}
                                    />
                                    <span className="text-sm font-normal text-slate-400">/{selectedTask.puntos || 10}</span>
                                </div>
                            </div>

                            {/* Botón Devolver Calificación */}
                            {!isReadOnly && activeStudent && (
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        style={selectedTask.calificaciones[activeStudent.id] ? { backgroundColor: activeTheme.strokeColor } : undefined}
                                        disabled={isReturning || wasReturned || !selectedTask.calificaciones[activeStudent.id]}
                                        onClick={() => {
                                            if (isReturning || wasReturned) return;
                                            setIsReturning(true);
                                            returnTaskGrade(selectedTask.id, activeStudent.id, currentScore)
                                                .then(() => {
                                                    setReturnedScores((current) => ({ ...current, [activeStudent.id]: currentScore }));
                                                })
                                                .finally(() => setIsReturning(false));
                                        }}
                                        className={`w-full py-3 rounded-xl font-extrabold text-xs text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                                            isReturning || wasReturned || !selectedTask.calificaciones[activeStudent.id]
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : 'hover:opacity-90'
                                        }`}
                                    >
                                        <ChevronLeft size={16} />
                                        <span>{isReturning ? 'DEVOLVIENDO...' : wasReturned ? 'CALIFICACIÓN DEVUELTA' : 'DEVOLVER CALIFICACIÓN'}</span>
                                    </button>
                                    <p className="text-[9px] text-slate-400 font-medium text-center mt-2 px-4 leading-tight">
                                        Al devolver, se notificará al alumno y se actualizará su promedio oficial.
                                    </p>
                                </div>
                            )}
                            <div className="pt-4 border-t border-slate-100 mt-4 space-y-2 text-left">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                    {studentFilesList.length > 1 ? `Entregas del Alumno (${studentFilesList.length})` : 'Entrega del Alumno'}
                                </span>
                                {studentFilesList.length > 0 ? (
                                    <div className="space-y-2">
                                        {studentFilesList.map((fileItem, idx) => (
                                            <a
                                                key={idx}
                                                href={fileItem.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="border border-slate-200 bg-slate-50/60 rounded-lg p-3 flex items-center justify-between gap-3 transition-all group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {getFileIcon(fileItem.nombre || fileItem.url)}
                                                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#0266E0] truncate max-w-[220px] transition-colors">
                                                        {fileItem.nombre || fileItem.url}
                                                    </span>
                                                </div>
                                                <ExternalLink size={14} className="text-slate-400 group-hover:text-[#0266E0] shrink-0 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin entrega disponible</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

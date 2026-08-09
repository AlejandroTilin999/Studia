import React from 'react';
import { ArrowLeft, Calendar, FileText, ChevronRight, ChevronLeft, X, UserCircle2, ExternalLink, Image as ImageIcon, FileSpreadsheet, FileCode, FileArchive, Globe } from 'lucide-react';
import PdfIcon from '@/Components/ui/PdfIcon';
import { Task, StudentGrade } from '../services/constants';
import GradeSelector from './GradeSelector';
import StudiaPDFViewer from './StudiaPDFViewer';
import BackButton from '@/Components/common/BackButton';
import { COLOR_THEMES } from '@/constants/ColorThemes';

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
    privateMessages: Record<string, { sender: 'alumno' | 'docente', senderName: string, text: string, timestamp: string }[]>;
    chatInputText: string;
    setChatInputText: (text: string) => void;
    sendPrivateMessage: (key: string) => void;
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
    privateMessages,
    chatInputText,
    setChatInputText,
    sendPrivateMessage,
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
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = React.useState(false);
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

    const currentStudentId = selectedStudentId || (studentGrades[0]?.id);
    const currentIndex = studentGrades.findIndex(s => s.id === currentStudentId);
    const activeStudent = studentGrades[currentIndex] || studentGrades[0];

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

    const chatKey = `${selectedTask.id}:${currentStudentId}`;
    const chatList = privateMessages[chatKey] || [];

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

            {/* BARRA DE NAVEGACIÓN "ZEN" Plano con líneas nítidas finas */}
            <div className="bg-transparent border-y border-slate-300 py-3 px-1 flex items-center justify-between gap-4">

                {/* Navegación Izquierda */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Alumno</span>
                        <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{currentIndex + 1} / {studentGrades.length}</span>
                    </div>
                </div>

                {/* Selector Integrado de Alumno Estilizado con Ancho Uniforme */}
                <div className="flex-1 flex justify-end px-2">
                    <div className="relative group w-64" ref={studentDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                            className="w-full h-10 px-4 bg-[#e5e7eb]/80 hover:bg-[#d1d5db]/80 text-slate-700 text-xs font-semibold rounded-t-lg rounded-b-none border-b-2 border-slate-400/60 flex items-center justify-between gap-3 transition-all select-none cursor-pointer outline-none"
                        >
                            <span className="truncate max-w-[200px]">
                                {activeStudent?.nombre || 'Seleccionar alumno...'}
                            </span>
                            <svg
                                className={`w-3.5 h-3.5 text-slate-700 shrink-0 transition-transform ${isStudentDropdownOpen ? 'rotate-180' : ''}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Menú Flotante de Alumnos con el mismo ancho w-full */}
                        {isStudentDropdownOpen && (
                            <div className="absolute right-0 top-full w-full bg-white border border-slate-200/90 rounded-b-lg shadow-xl py-1 z-50 overflow-y-auto max-h-64 text-xs">
                                {studentGrades.map((s) => {
                                    const gradeValue = selectedTask.calificaciones[s.id];
                                    const hasGrade = gradeValue !== "" && gradeValue !== undefined;
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
                                            className={`w-full text-left px-4 py-2.5 transition-colors font-semibold flex items-center justify-between ${
                                                isSelected
                                                    ? 'font-bold'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                        >
                                            <span className="truncate max-w-[170px]">{s.nombre}</span>
                                            <span className="text-[10px] font-black opacity-70">
                                                {hasGrade ? `(${gradeValue})` : '—'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navegación Derecha */}
                <div className="flex items-center">
                    <button
                        onClick={goToNext}
                        disabled={currentIndex === studentGrades.length - 1}
                        className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4">
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
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">Comentarios Privados</h3>

                        {chatList.length > 0 && (
                            <div className="bg-slate-50 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-3.5 border border-slate-100/50">
                                {chatList.map((msg, mIdx) => (
                                    <div key={mIdx} className={`flex flex-col max-w-[85%] ${msg.sender === 'docente' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                        <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{msg.senderName} · {msg.timestamp}</span>
                                        <div 
                                            style={msg.sender === 'docente' ? { backgroundColor: activeTheme.strokeColor } : undefined}
                                            className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${msg.sender === 'docente' ? 'text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isReadOnly ? (
                            <form onSubmit={e => { e.preventDefault(); currentStudentId && sendPrivateMessage(chatKey); }} className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInputText}
                                    onChange={e => setChatInputText(e.target.value)}
                                    placeholder="Añadir un comentario para el alumno..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                                <button 
                                    type="submit" 
                                    style={{ backgroundColor: activeTheme.strokeColor }}
                                    className="text-white px-5 rounded-xl font-extrabold text-xs transition-all hover:opacity-90"
                                >
                                    Enviar
                                </button>
                            </form>
                        ) : (
                            <div className="p-3 bg-slate-50 rounded-xl text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-100/50">El foro de mensajes está cerrado</div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-5">
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
                                        disabled={isReturning || !selectedTask.calificaciones[activeStudent.id]}
                                        onClick={() => {
                                            setIsReturning(true);
                                            returnTaskGrade(selectedTask.id, activeStudent.id, selectedTask.calificaciones[activeStudent.id])
                                                .then(() => {
                                                    import('@/utils/SwalHelper').then(({ SwalHelper }) => {
                                                        SwalHelper.success('¡Enviado!', 'La calificación ha sido devuelta al alumno.');
                                                    });
                                                })
                                                .finally(() => setIsReturning(false));
                                        }}
                                        className={`w-full py-3 rounded-xl font-extrabold text-xs text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                                            isReturning || !selectedTask.calificaciones[activeStudent.id]
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : 'hover:opacity-90'
                                        }`}
                                    >
                                        <ChevronLeft size={16} />
                                        <span>DEVOLVER CALIFICACIÓN</span>
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

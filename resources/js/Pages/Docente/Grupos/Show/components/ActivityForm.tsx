import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Plus, Pencil, Paperclip, Upload, Loader2, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { Task } from '../services/constants';
import DatePickerEs from '@/Components/ui/DatePickerEs';
import DeadlineTimeInput, { normalizeDeadlineTime } from '@/Components/ui/DeadlineTimeInput';
import PdfIcon from '@/Components/ui/PdfIcon';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import { SwalHelper } from '@/utils/SwalHelper';
import { getDocenteClassRoute } from '@/utils/docenteClassUrl';

type Attachment = {
    name: string;
    size: string;
    type: string;
    url?: string;
    google_drive_url?: string | null;
    google_drive_file_id?: string | null;
};

export interface ActivityFormProps {
    editingTask: Task | null;
    onSave: (taskData: {
        nombre: string;
        descripcion: string;
        type: 'task' | 'material';
        attachments: Attachment[];
        fecha_entrega?: string;
        hora_entrega?: string;
        puntos?: number;
    }) => void;
    onCancelEdit: () => void;
    themeKey?: string;
    classInfo?: any;
}

export default function ActivityForm({ editingTask, onSave, onCancelEdit, themeKey = 'blue', classInfo: propClassInfo }: ActivityFormProps) {
    const { classInfo: pageClassInfo } = usePage().props as any;
    const classInfo = propClassInfo || pageClassInfo;
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;
    const [activityType, setActivityType] = useState<'task' | 'material'>('task');
    const [nombre, setNombre] = useState('');
    const [fecha_entrega, setFechaEntrega] = useState('');
    const [hora_entrega, setHoraEntrega] = useState('');
    const [puntos, setPuntos] = useState<string>('');
    const [descripcion, setDescripcion] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    
    // Estado de errores Inline (Estilo Google Classroom)
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setErrors({});
        if (editingTask) {
            setActivityType(editingTask.type || 'task');
            setNombre(editingTask.nombre);
            if (editingTask.fecha_entrega) {
                const parts = editingTask.fecha_entrega.split(' ');
                setFechaEntrega(parts[0].split('T')[0]);
                if (editingTask.hora_entrega) {
                    setHoraEntrega(normalizeDeadlineTime(editingTask.hora_entrega));
                } else if (parts[1]) {
                    setHoraEntrega(normalizeDeadlineTime(parts[1]));
                } else {
                    setHoraEntrega('');
                }
            } else {
                setFechaEntrega('');
                setHoraEntrega('');
            }
            setPuntos(editingTask.puntos ? editingTask.puntos.toString() : '');
            setDescripcion(editingTask.descripcion || '');
            setAttachments(editingTask.attachments || []);
        } else {
            resetForm();
        }
    }, [editingTask]);

    const resetForm = () => {
        setNombre('');
        setFechaEntrega('');
        setHoraEntrega('');
        setPuntos('');
        setDescripcion('');
        setAttachments([]);
        setErrors({});
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.currentTarget.files || []);
        // Se limpia de inmediato para que este control nunca participe en un
        // envío nativo del formulario y permita volver a elegir el mismo archivo.
        e.currentTarget.value = '';
        if (selectedFiles.length === 0) return;

        // Obtener UUID de la clase actual desde props o URL
        const classUuid = classInfo?.id || classInfo?.uuid || getDocenteClassRoute().classId;

        setIsUploading(true);
        SwalHelper.toastLoading(selectedFiles.length > 1
            ? `Subiendo ${selectedFiles.length} archivos a Google Drive...`
            : `Subiendo ${selectedFiles[0].name} a Google Drive...`);
        let uploadedFiles = 0;
        const failedFiles: string[] = [];

        for (const file of selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('archivo', file);

                const targetUuid = classUuid || 'general';
                const res = await axios.post(`/docente/clases/${targetUuid}/upload-material`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const uploadedUrl = res.data?.url || res.data?.google_drive_url;

                if (res.data && uploadedUrl) {
                    uploadedFiles += 1;
                    setAttachments(prev => [...prev, {
                        name: res.data.name || file.name,
                        url: uploadedUrl,
                        google_drive_url: res.data.google_drive_url || uploadedUrl,
                        google_drive_file_id: res.data.google_drive_file_id || null,
                        size: res.data.size || (file.size / 1024 / 1024).toFixed(2) + ' MB',
                        type: res.data.type || file.type || 'application/pdf'
                    }]);
                } else {
                    failedFiles.push(file.name);
                }
            } catch (err: any) {
                console.error('Error al subir material de apoyo:', err);
                failedFiles.push(file.name);
            }
        }

        setIsUploading(false);
        SwalHelper.close();
        if (uploadedFiles > 0) {
            SwalHelper.toast(uploadedFiles === 1
                ? 'Archivo adjuntado correctamente.'
                : `${uploadedFiles} archivos adjuntados correctamente.`, 'success');
        }
        if (failedFiles.length > 0) {
            SwalHelper.toast(failedFiles.length === 1
                ? `No se pudo subir ${failedFiles[0]}.`
                : `No se pudieron subir ${failedFiles.length} archivos.`, 'error');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!nombre.trim()) {
            newErrors.nombre = 'El título de la tarea es obligatorio';
        }
        if (!fecha_entrega) {
            newErrors.fecha_entrega = 'Selecciona la fecha límite';
        }
        if (!hora_entrega) {
            newErrors.hora_entrega = 'Selecciona la hora límite';
        }
        if (!puntos || Number(puntos) <= 0) {
            newErrors.puntos = 'El puntaje debe ser mayor a 0';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.nombre) {
                titleInputRef.current?.focus();
            }
            return;
        }

        const fullFechaEntrega = (fecha_entrega && hora_entrega)
            ? `${fecha_entrega} ${hora_entrega.length === 5 ? hora_entrega + ':00' : hora_entrega}`
            : fecha_entrega;

        setErrors({});
        onSave({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            type: 'task',
            attachments,
            fecha_entrega: fullFechaEntrega,
            hora_entrega: hora_entrega,
            puntos: Number(puntos) || 10,
        });

        resetForm();
    };

    return (
        <div className="space-y-6 pt-2 w-full">
            {/* Header del Formulario (Título + Botón de Cancelar) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                    {editingTask !== null ? (
                        <Pencil size={20} style={{ color: activeTheme.strokeColor }} />
                    ) : (
                        <Plus size={20} style={{ color: activeTheme.strokeColor }} />
                    )}
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        {editingTask !== null ? 'Editar Tarea' : 'Crear Tarea'}
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={onCancelEdit}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
                >
                    Cancelar
                </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Columna Izquierda (2/3 de ancho): Detalles (Título, Instrucciones, Adjuntos) */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Título de la tarea <span className="text-rose-500">*</span>
                        </label>
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={nombre}
                            placeholder="Ej. Examen Parcial, Tarea de Ecuaciones..."
                            onChange={e => {
                                setNombre(e.target.value);
                                if (errors.nombre) setErrors(prev => ({ ...prev, nombre: '' }));
                            }}
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all ${
                                errors.nombre
                                    ? 'bg-rose-50/40 border-rose-400 focus:ring-1 focus:ring-rose-400 text-slate-800'
                                    : 'bg-slate-50/60 border-slate-200/90 focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] text-slate-800'
                            }`}
                        />
                        {errors.nombre && (
                            <span className="text-[11px] font-semibold text-rose-500 mt-1 block animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.nombre}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Instrucciones o descripción <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <textarea
                            rows={4}
                            value={descripcion}
                            placeholder="Instrucciones detalladas para los alumnos..."
                            onChange={e => setDescripcion(e.target.value)}
                            className="w-full bg-slate-50/60 border border-slate-200/90 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                            Material de apoyo <span className="text-slate-400 font-normal">(Archivos adjuntos, guías, PDFs)</span>
                        </label>
                        
                        <button
                            type="button"
                            disabled={isUploading}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isUploading) fileInputRef.current?.click();
                            }}
                            className="w-full border-2 border-dashed border-slate-250 hover:border-[#1e88e5] hover:bg-blue-50/20 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none group"
                        >
                            {isUploading ? (
                                <Loader2 size={24} className="text-[#1e88e5] animate-spin" />
                            ) : (
                                <Upload size={22} className="text-slate-400 group-hover:text-[#1e88e5] transition-colors" />
                            )}
                            <span className="text-xs font-bold text-slate-600 group-hover:text-[#1e88e5] transition-colors">
                                {isUploading ? 'Subiendo material a Google Drive...' : 'Adjuntar archivos o documentos PDF'}
                            </span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />

                        {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {attachments.map((file, index) => {
                                    const fileUrl = (file as any).url || (file as any).google_drive_url;
                                    const fileName = file.name || 'Documento adjunto';
                                    const isPdf = fileName.toLowerCase().endsWith('.pdf') || (file as any).type?.toLowerCase().includes('pdf');

                                    return (
                                        <div 
                                            key={index} 
                                            className="flex items-center justify-between bg-white border border-slate-200/90 px-3.5 py-2.5 rounded-md text-xs shadow-2xs transition-all hover:border-slate-300"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                                                {isPdf ? (
                                                    <PdfIcon size={20} className="shrink-0" />
                                                ) : (
                                                    <FileText size={18} className="text-slate-700 shrink-0" />
                                                )}
                                                
                                                {fileUrl ? (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-bold text-slate-900 hover:underline truncate text-xs"
                                                    >
                                                        {fileName}
                                                    </a>
                                                ) : (
                                                    <span className="font-bold text-slate-900 truncate text-xs">{fileName}</span>
                                                )}

                                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Google Drive
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {fileUrl && (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                                                        title="Abrir enlace"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveAttachment(index)} 
                                                    className="text-slate-400 hover:text-rose-500 font-bold text-xs p-1 transition-colors"
                                                >
                                                    Quitar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha (1/3 de ancho): Ajustes (Puntos, Fecha Límite, Hora Límite, Publicar) */}
                <div className="space-y-6 lg:border-l lg:border-slate-200 lg:pl-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Puntos máximos <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={puntos}
                                placeholder="Ej. 100"
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setPuntos(val);
                                    if (errors.puntos) setErrors(prev => ({ ...prev, puntos: '' }));
                                }}
                                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 font-semibold outline-none transition-all ${
                                    errors.puntos
                                        ? 'bg-rose-50/40 border-rose-400 focus:ring-1 focus:ring-rose-400'
                                        : 'bg-slate-50/60 border-slate-200/90 focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5]'
                                }`}
                            />
                            {errors.puntos && (
                                <span className="text-[11px] font-semibold text-rose-500 mt-1 block animate-in fade-in slide-in-from-top-1 duration-200">
                                    {errors.puntos}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Fecha límite <span className="text-rose-500">*</span>
                            </label>
                            <DatePickerEs
                                value={fecha_entrega}
                                onChange={val => {
                                    setFechaEntrega(val);
                                    if (errors.fecha_entrega) setErrors(prev => ({ ...prev, fecha_entrega: '' }));
                                }}
                                hasError={!!errors.fecha_entrega}
                            />
                            {errors.fecha_entrega && (
                                <span className="text-[11px] font-semibold text-rose-500 mt-1 block animate-in fade-in slide-in-from-top-1 duration-200">
                                    {errors.fecha_entrega}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Hora límite <span className="text-rose-500">*</span>
                            </label>
                            <DeadlineTimeInput
                                value={hora_entrega}
                                onChange={value => {
                                    setHoraEntrega(value);
                                    if (errors.hora_entrega) setErrors(prev => ({ ...prev, hora_entrega: '' }));
                                }}
                                hasError={!!errors.hora_entrega}
                            />
                            {errors.hora_entrega && (
                                <span className="text-[11px] font-semibold text-rose-500 mt-1 block animate-in fade-in slide-in-from-top-1 duration-200">
                                    {errors.hora_entrega}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-2">
                        <button
                            type="submit"
                            style={{ backgroundColor: activeTheme.strokeColor }}
                            className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] shadow-sm hover:brightness-105"
                        >
                            {editingTask !== null ? <Pencil size={15} /> : <Plus size={15} />}
                            {editingTask !== null ? 'Guardar Cambios' : 'Publicar Tarea'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

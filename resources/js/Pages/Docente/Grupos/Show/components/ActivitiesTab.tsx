import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, ChevronRight, Paperclip, Download, Bell, Upload, Clock, Pencil } from 'lucide-react';
import { Task } from '../services/constants';
import { SwalHelper } from '@/utils/SwalHelper';
import { cn } from '@/lib/utils';
import DatePickerEs from '@/Components/ui/DatePickerEs';
import SwalTooltip from '@/Components/ui/SwalTooltip';
import { COLOR_THEMES } from '../../ColorThemes';

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

interface ActivityFormProps {
    editingTask: Task | null;
    onSave: (taskData: {
        nombre: string;
        descripcion: string;
        type: 'task' | 'material';
        attachments: { name: string; size: string; type: string }[];
        fecha_entrega?: string;
        hora_entrega?: string;
        puntos?: number;
    }) => void;
    onCancelEdit: () => void;
}

function ActivityForm({ editingTask, onSave, onCancelEdit }: ActivityFormProps) {
    const [activityType, setActivityType] = useState<'task' | 'material'>('task');
    const [nombre, setNombre] = useState('');
    const [fecha_entrega, setFechaEntrega] = useState('');
    const [hora_entrega, setHoraEntrega] = useState('');
    const [puntos, setPuntos] = useState<string>('');
    const [descripcion, setDescripcion] = useState('');
    const [attachments, setAttachments] = useState<{ name: string; size: string; type: string }[]>([]);
    
    // Estado de errores Inline (Estilo Google Classroom)
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setErrors({});
        if (editingTask) {
            setActivityType(editingTask.type || 'task');
            setNombre(editingTask.nombre);
            setFechaEntrega(editingTask.fecha_entrega ? editingTask.fecha_entrega.split('T')[0] : '');
            setHoraEntrega((editingTask as any).hora_entrega || '');
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files).map(file => ({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type || 'application/pdf'
        }));
        setAttachments(prev => [...prev, ...filesArray]);
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
        if (!puntos || puntos <= 0) {
            newErrors.puntos = 'El puntaje debe ser mayor a 0';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.nombre) {
                titleInputRef.current?.focus();
            }
            return;
        }

        setErrors({});
        onSave({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            type: 'task',
            attachments,
            fecha_entrega: fecha_entrega,
            hora_entrega: hora_entrega,
            puntos: Number(puntos) || 10,
        });

        resetForm();
    };

    return (
        <div className="space-y-6 pt-2">
            {/* Header del Formulario (Título + Botón de Cancelar) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                    {editingTask !== null ? <Pencil size={20} className="text-amber-500" /> : <Plus size={20} className="text-[#1e88e5]" />}
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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda (2/3 de ancho): Título e Instrucciones */}
                <div className="lg:col-span-2 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Título <span className="text-rose-500">*</span>
                        </label>
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={nombre}
                            onChange={e => {
                                setNombre(e.target.value);
                                if (errors.nombre) setErrors(prev => ({ ...prev, nombre: '' }));
                            }}
                            placeholder="Ej. Tarea 3: Ecuaciones de primer grado"
                            className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all ${
                                errors.nombre
                                    ? 'bg-rose-50/40 border-rose-400 focus:ring-1 focus:ring-rose-400'
                                    : 'bg-slate-50/60 border-slate-200/90 focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5]'
                            }`}
                        />
                        {errors.nombre && (
                            <span className="text-xs font-semibold text-rose-500 mt-1 block animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.nombre}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Instrucciones (opcional)</label>
                        <textarea
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Escribe las instrucciones detalladas de la tarea aquí..."
                            rows={8}
                            className="w-full bg-slate-50/60 border border-slate-200/90 rounded-xl px-4 py-3 text-sm text-slate-800 font-normal outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all resize-none leading-relaxed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Material de Apoyo / Adjuntos</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-250 hover:border-[#1e88e5] hover:bg-blue-50/20 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none group"
                        >
                            <Upload size={22} className="text-slate-400 group-hover:text-[#1e88e5] transition-colors" />
                            <span className="text-xs font-bold text-slate-600 group-hover:text-[#1e88e5] transition-colors">Adjuntar archivos o documentos</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />

                        {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 text-xs">
                                        <div className="flex items-center gap-2 truncate">
                                            <Paperclip size={14} className="text-[#1e88e5] shrink-0" />
                                            <span className="font-medium text-slate-700 truncate">{file.name}</span>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-slate-400 hover:text-rose-500 font-bold text-xs">Quitar</button>
                                    </div>
                                ))}
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
                            <input
                                type="time"
                                value={hora_entrega}
                                onChange={e => {
                                    setHoraEntrega(e.target.value);
                                    if (errors.hora_entrega) setErrors(prev => ({ ...prev, hora_entrega: '' }));
                                }}
                                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium outline-none transition-all ${
                                    errors.hora_entrega
                                        ? 'bg-rose-50/40 border-rose-400 focus:ring-1 focus:ring-rose-400'
                                        : 'bg-slate-50/60 border-slate-200/90 focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5]'
                                }`}
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
                            className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] shadow-sm ${
                                editingTask !== null ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1e88e5] hover:bg-blue-600'
                            }`}
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

interface ActivityCardProps {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onSelectTask: (id: number) => void;
    isReadOnly?: boolean;
    themeKey?: string;
}

function ActivityCard({ task, index, onEdit, onDelete, onSelectTask, isReadOnly = false, themeKey = 'blue' }: ActivityCardProps) {
    const isExpired = task.fecha_entrega && new Date(task.fecha_entrega + 'T00:00:00') < new Date(new Date().setHours(0,0,0,0));
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    return (
        <div className="py-5 border-b border-slate-200/90 last:border-b-0 space-y-4">
            {/* Header Limpio (Estilo Google Classroom Directo) */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div
                        style={{ backgroundColor: `${activeTheme.strokeColor}18`, color: activeTheme.strokeColor }}
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold"
                    >
                        <FileText size={20} />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-800 tracking-tight">
                                {task.nombre}
                            </h4>
                            {isExpired && (
                                <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                                    Vencida
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-normal">
                            <span>{task.fecha_entrega ? `Fecha límite: ${formatHumanDate(task.fecha_entrega)}` : 'Sin fecha límite'}</span>
                            <span>•</span>
                            <span className={cn("font-semibold", activeTheme.text)}>{task.puntos || 10} pts</span>
                        </div>
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => onEdit(task)}
                            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-all"
                            title="Editar"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-slate-100 transition-all"
                            title="Eliminar"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Contenido / Descripción */}
            {task.descripcion && (
                <div className="pl-14 text-xs md:text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                    {task.descripcion}
                </div>
            )}

            {/* Adjuntos */}
            {task.attachments && task.attachments.length > 0 && (
                <div className="pl-14 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl">
                            <div className="flex items-center gap-2 truncate">
                                <FileText size={15} className={activeTheme.text} />
                                <span className="text-xs text-slate-700 font-medium truncate">{file.name}</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-700 p-1 transition-all">
                                <Download size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Botón Ver Entregas */}
            <div className="pl-14 pt-1 flex justify-start">
                <button
                    type="button"
                    onClick={() => onSelectTask(task.id)}
                    className={cn("flex items-center gap-1.5 text-xs font-bold transition-colors hover:underline", activeTheme.text)}
                >
                    <span>Ver Entregas y Calificar</span>
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

interface ActivitiesTabProps {
    tasks: Task[];
    saveTasks: (newTasks: Task[]) => void;
    setSelectedTaskId: (id: number | null) => void;
    grupo: string;
    materia: string;
    isReadOnly?: boolean;
    themeKey?: string;
}

export default function ActivitiesTab({
    tasks,
    saveTasks,
    setSelectedTaskId,
    isReadOnly = false,
    themeKey = 'blue'
}: ActivitiesTabProps) {
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);

    const editingTask = editingTaskId !== null ? tasks.find(t => t.id === editingTaskId) || null : null;
    const isFormOpen = isCreating || editingTaskId !== null;
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    const handleSaveTask = (taskData: any) => {
        if (editingTaskId !== null) {
            saveTasks(tasks.map(t => t.id === editingTaskId ? { ...t, ...taskData } : t));
            setEditingTaskId(null);
        } else {
            const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
            saveTasks([...tasks, { id: nextId, ...taskData, calificaciones: {} }]);
            setIsCreating(false);
        }
        SwalHelper.success('¡Hecho!', 'Actividad guardada correctamente.');
    };

    const handleDeleteTask = (id: number) => {
        SwalHelper.confirm('¿Eliminar actividad?', 'Se perderán las tareas y notas asociadas.', 'Sí, eliminar', 'No', 'warning')
            .then(res => {
                if (res.isConfirmed) {
                    SwalHelper.loading('Eliminando...', 'Sincronizando cambios en tiempo real');
                    saveTasks(tasks.filter(t => t.id !== id));
                    setTimeout(() => {
                        SwalHelper.success('Eliminado', 'La actividad fue borrada correctamente.');
                    }, 300);
                }
            });
    };

    return (
        <div className="space-y-8 text-left pb-6">
            {/* Barra Superior Minimalista */}
            {!isReadOnly && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Trabajo de Clase</h3>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">Publica y administra actividades para los estudiantes</p>
                    </div>

                    {!isFormOpen ? (
                        <button
                            type="button"
                            onClick={() => setIsCreating(true)}
                            style={{ backgroundColor: activeTheme.strokeColor }}
                            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Crear Tarea</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreating(false);
                                setEditingTaskId(null);
                            }}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs transition-all"
                        >
                            <span>Cerrar Formulario</span>
                        </button>
                    )}
                </div>
            )}

            {/* Vista Alternada: Formulario o Secciones Minimalistas */}
            {isFormOpen && !isReadOnly ? (
                <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-200 pb-4">
                    <ActivityForm
                        editingTask={editingTask}
                        onSave={handleSaveTask}
                        onCancelEdit={() => {
                            setIsCreating(false);
                            setEditingTaskId(null);
                        }}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Encabezado de Tema "Primer Parcial" estilo Google Classroom Plano (Color Dinámico) */}
                    <div className="space-y-2">
                        <div
                            style={{ borderColor: activeTheme.strokeColor }}
                            className="flex items-center justify-between border-b-2 pb-2 transition-colors"
                        >
                            <h3 style={{ color: activeTheme.strokeColor }} className="text-lg font-bold">Primer Parcial</h3>
                            <span className="text-xs font-semibold text-slate-400">
                                {tasks.length} {tasks.length === 1 ? 'actividad' : 'actividades'}
                            </span>
                        </div>

                        <div>
                            {tasks.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 font-normal text-sm space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                                        <FileText size={24} />
                                    </div>
                                    <p className="font-medium text-slate-600">No hay actividades publicadas en este parcial.</p>
                                    {!isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(true)}
                                            style={{ color: activeTheme.strokeColor }}
                                            className="inline-flex items-center gap-1.5 font-bold text-xs hover:underline"
                                        >
                                            <Plus size={14} /> Crear primera tarea
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200/80">
                                    {tasks.map((t, idx) => (
                                        <ActivityCard
                                            key={t.id}
                                            task={t}
                                            index={idx}
                                            onEdit={() => {
                                                setIsCreating(false);
                                                setEditingTaskId(t.id);
                                            }}
                                            onDelete={handleDeleteTask}
                                            onSelectTask={setSelectedTaskId}
                                            isReadOnly={isReadOnly}
                                            themeKey={themeKey}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

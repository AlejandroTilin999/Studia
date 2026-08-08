import React, { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Paperclip, Upload } from 'lucide-react';
import { Task } from '../services/constants';
import DatePickerEs from '@/Components/ui/DatePickerEs';

export interface ActivityFormProps {
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

export default function ActivityForm({ editingTask, onSave, onCancelEdit }: ActivityFormProps) {
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
            if (editingTask.fecha_entrega) {
                const parts = editingTask.fecha_entrega.split(' ');
                setFechaEntrega(parts[0].split('T')[0]);
                if (parts[1]) {
                    setHoraEntrega(parts[1].substring(0, 5));
                } else if ((editingTask as any).hora_entrega) {
                    setHoraEntrega((editingTask as any).hora_entrega);
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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
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

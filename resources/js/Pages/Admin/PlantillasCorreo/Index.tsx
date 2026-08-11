import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Mail, Plus, Edit, Trash2, Send, CheckCircle2, Code, Eye, FileText, Sparkles, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface Template {
    id: number;
    nombre: string;
    asunto: string;
    tipo: string;
    contenido_html: string;
    variables_disponibles?: string;
    activo: boolean;
}

interface UserRecipient {
    id: number;
    nombre: string;
    apellido_paterno?: string;
    email: string;
    rol: string;
}

interface EmailTemplatesIndexProps {
    templates: Template[];
    recipients: UserRecipient[];
}

export default function EmailTemplatesIndex({ templates = [], recipients = [] }: EmailTemplatesIndexProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [sendingTemplate, setSendingTemplate] = useState<Template | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [roleFilter, setRoleFilter] = useState<string>('ALL');

    const form = useForm({
        nombre: '',
        asunto: '',
        tipo: 'general',
        contenido_html: '',
        variables_disponibles: '{{nombre}}, {{email}}, {{fecha}}',
        activo: true,
    });

    const sendForm = useForm({
        template_id: 0,
        recipients: [] as string[],
    });

    const openCreateModal = () => {
        setEditingTemplate(null);
        form.reset();
        form.setData({
            nombre: '',
            asunto: '',
            tipo: 'general',
            contenido_html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #0266E0;">Hola {{nombre}},</h2>
  <p>Le notificamos sobre su documento o boleta oficial de Prepahid.</p>
  <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0266E0; margin: 20px 0;">
    <strong>Estado del trámite:</strong> Completado
  </div>
  <p>Saludos cordiales,<br><strong>Equipo de Prepahid</strong></p>
</div>`,
            variables_disponibles: '{{nombre}}, {{email}}, {{fecha}}',
            activo: true,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (tpl: Template) => {
        setEditingTemplate(tpl);
        form.setData({
            nombre: tpl.nombre,
            asunto: tpl.asunto,
            tipo: tpl.tipo,
            contenido_html: tpl.contenido_html,
            variables_disponibles: tpl.variables_disponibles || '{{nombre}}, {{email}}, {{fecha}}',
            activo: tpl.activo,
        });
        setIsCreateModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemplate) {
            form.put(route('admin.plantillas_correo.update', editingTemplate.id), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    Swal.fire('¡Plantilla Actualizada!', 'Los cambios se guardaron correctamente.', 'success');
                },
            });
        } else {
            form.post(route('admin.plantillas_correo.store'), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    Swal.fire('¡Plantilla Creada!', 'La plantilla de correo está lista para usar.', 'success');
                },
            });
        }
    };

    const handleDelete = (tpl: Template) => {
        Swal.fire({
            title: '¿Eliminar plantilla?',
            text: `Confirmar eliminación de "${tpl.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                form.delete(route('admin.plantillas_correo.destroy', tpl.id), {
                    onSuccess: () => {
                        Swal.fire('Eliminado', 'La plantilla ha sido removida.', 'success');
                    },
                });
            }
        });
    };

    const openSendModal = (tpl: Template) => {
        setSendingTemplate(tpl);
        sendForm.setData({
            template_id: tpl.id,
            recipients: [],
        });
        setSelectedEmails([]);
    };

    const handleToggleEmail = (email: string) => {
        let updated = [...selectedEmails];
        if (updated.includes(email)) {
            updated = updated.filter((e) => e !== email);
        } else {
            updated.push(email);
        }
        setSelectedEmails(updated);
        sendForm.setData('recipients', updated);
    };

    const handleSelectAllFiltered = () => {
        const filtered = filteredRecipients.map((r) => r.email);
        if (selectedEmails.length === filtered.length) {
            setSelectedEmails([]);
            sendForm.setData('recipients', []);
        } else {
            setSelectedEmails(filtered);
            sendForm.setData('recipients', filtered);
        }
    };

    const handleSendSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEmails.length === 0) {
            Swal.fire('Atención', 'Selecciona al menos un destinatario.', 'warning');
            return;
        }

        sendForm.post(route('admin.plantillas_correo.send'), {
            onSuccess: () => {
                setSendingTemplate(null);
                Swal.fire('¡Correos Enviados!', `Se enviaron los mensajes mediante Brevo a ${selectedEmails.length} destinatario(s).`, 'success');
            },
        });
    };

    const filteredRecipients = recipients.filter((r) => {
        if (roleFilter === 'ALL') return true;
        return r.rol.toUpperCase() === roleFilter;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Plantillas de Correo" />

            <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-left">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                            <Mail size={16} />
                            <span>Comunicaciones & Brevo</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Plantillas de Correo</h1>
                        <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                            Crea y gestiona formatos institucionales de correo para el envío de boletas, constancias y avisos generales a alumnos y docentes.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="relative z-10 inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm shrink-0"
                    >
                        <Plus size={18} />
                        <span>Nueva Plantilla</span>
                    </button>
                </div>

                {/* Grid de Plantillas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.length === 0 ? (
                        <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                                <FileText size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800">No hay plantillas registradas</h3>
                            <p className="text-slate-500 text-xs max-w-md mx-auto">
                                Crea la primera plantilla institucional para enviar comunicados oficiales o constancias de estudio.
                            </p>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                            >
                                <Plus size={16} />
                                <span>Crear Plantilla</span>
                            </button>
                        </div>
                    ) : (
                        templates.map((tpl) => (
                            <div
                                key={tpl.id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                            {tpl.tipo}
                                        </span>
                                        <span className={`w-2.5 h-2.5 rounded-full ${tpl.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} title={tpl.activo ? 'Activo' : 'Inactivo'} />
                                    </div>

                                    <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-1">{tpl.nombre}</h3>
                                    <p className="text-slate-500 text-xs line-clamp-1 mt-1 font-medium">
                                        <span className="text-slate-400">Asunto:</span> {tpl.asunto}
                                    </p>

                                    <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 font-mono text-[11px] max-h-24 overflow-hidden relative">
                                        <div className="line-clamp-3">{tpl.contenido_html.replace(/<[^>]*>?/gm, '')}</div>
                                        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-50 to-transparent" />
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setPreviewHtml(tpl.contenido_html)}
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Previsualizar"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(tpl)}
                                            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tpl)}
                                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => openSendModal(tpl)}
                                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        <Send size={14} />
                                        <span>Enviar</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Crear / Editar */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla de Correo'}
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre de la Plantilla</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.data.nombre}
                                        onChange={(e) => form.setData('nombre', e.target.value)}
                                        placeholder="Ej: Envio de Boleta Oficial"
                                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tipo / Categoría</label>
                                    <select
                                        value={form.data.tipo}
                                        onChange={(e) => form.setData('tipo', e.target.value)}
                                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="general">General / Aviso</option>
                                        <option value="boleta">Boleta de Calificaciones</option>
                                        <option value="constancia">Constancia de Estudios</option>
                                        <option value="bienvenida">Bienvenida</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Asunto del Correo</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.asunto}
                                    onChange={(e) => form.setData('asunto', e.target.value)}
                                    placeholder="Ej: Notificación Oficial de Prepahid - {{nombre}}"
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Contenido HTML</label>
                                    <span className="text-[11px] text-blue-600 font-medium">Variables: &#123;&#123;nombre&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;fecha&#125;&#125;</span>
                                </div>
                                <textarea
                                    required
                                    rows={10}
                                    value={form.data.contenido_html}
                                    onChange={(e) => form.setData('contenido_html', e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl p-3.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-900 text-slate-100"
                                />
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-700">
                                <Sparkles size={16} className="shrink-0" />
                                <span>Las variables encerradas en dobles llaves se reemplazarán automáticamente con la información del alumno o docente al enviar.</span>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
                                >
                                    {form.processing ? 'Guardando...' : editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Previsualización */}
            {previewHtml !== null && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <Eye size={16} className="text-blue-600" />
                                Vista Previa de la Plantilla
                            </h3>
                            <button onClick={() => setPreviewHtml(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                </div>
            )}

            {/* Modal Enviar Masivo */}
            {sendingTemplate && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] text-left">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Enviar: {sendingTemplate.nombre}</h3>
                                <p className="text-xs text-slate-500">Selecciona los alumnos o profesores destinatarios para Brevo</p>
                            </div>
                            <button onClick={() => setSendingTemplate(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSendSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Filtros */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    {['ALL', 'ALUMNO', 'DOCENTE'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRoleFilter(r)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                                roleFilter === r
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {r === 'ALL' ? 'Todos' : r}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSelectAllFiltered}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                >
                                    {selectedEmails.length === filteredRecipients.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                </button>
                            </div>

                            {/* Lista de Destinatarios */}
                            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                                {filteredRecipients.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-400">No hay usuarios disponibles con este rol.</div>
                                ) : (
                                    filteredRecipients.map((r) => {
                                        const isSelected = selectedEmails.includes(r.email);
                                        return (
                                            <div
                                                key={r.id}
                                                onClick={() => handleToggleEmail(r.email)}
                                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                                                    isSelected
                                                        ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                                                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                                                        {isSelected && <CheckCircle2 size={12} />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold truncate">{r.nombre} {r.apellido_paterno || ''}</p>
                                                        <p className="text-[11px] text-slate-400 truncate">{r.email}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                                    {r.rol}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">
                                    {selectedEmails.length} seleccionado(s)
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSendingTemplate(null)}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sendForm.processing || selectedEmails.length === 0}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Send size={14} />
                                        <span>{sendForm.processing ? 'Enviando...' : 'Confirmar Envío'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

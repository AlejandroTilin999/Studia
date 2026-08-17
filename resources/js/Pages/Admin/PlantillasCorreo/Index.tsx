import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Mail, Plus, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

import TemplateCard, { Template } from './components/TemplateCard';
import EmailPreviewModal from './components/EmailPreviewModal';
import SendEmailModal, { Recipient } from './components/SendEmailModal';
import TemplateFormModal from './components/TemplateFormModal';

import AdminPageLayout from '@/Components/AdminPageLayout';

interface Props {
    templates: Template[];
    recipients: Recipient[];
}

export default function Index({ templates = [], recipients = [] }: Props) {
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
        template_id: null as number | null,
        recipients: [] as string[],
        dia_suspension: '',
    });

    const openCreateModal = () => {
        setEditingTemplate(null);
        form.reset();
        form.setData({
            nombre: '',
            asunto: '',
            tipo: 'general',
            contenido_html: `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px;">
  <!-- Encabezado Azul Rectangular con Logo Blanco -->
  <div style="background-color: #0266E0; padding: 24px 30px; text-align: center; border-radius: 0px;">
    <img src="https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/logo-ph-blanco.png" alt="Prepahid" style="max-height: 48px; width: auto; display: inline-block;" />
  </div>

  <!-- Cuerpo del Correo -->
  <div style="padding: 30px 25px; color: #334155;">
    <h2 style="color: #0266E0; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">Estimado(a) {{nombre}},</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Le informamos que se ha emitido un aviso oficial / documento académico desde la plataforma de Prepahid.</p>
    
    <div style="background-color: #f8fafc; padding: 18px; border-left: 4px solid #0266E0; border-radius: 0px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #1e293b;"><strong>Detalle:</strong> {{asunto}}</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b;"><strong>Fecha:</strong> {{fecha}}</p>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Si tiene dudas o requiere apoyo adicional, por favor comuníquese a Servicios Escolares.</p>
  </div>

  <!-- Pie de página Rectangular -->
  <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0px;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© 2026 Preparatoria Hidalgo · Prepahid. Todos los derechos reservados.</p>
  </div>
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
        sendForm.setData('template_id', tpl.id);
        setSelectedEmails([]);
    };

    const handleToggleEmail = (email: string) => {
        if (selectedEmails.includes(email)) {
            setSelectedEmails(selectedEmails.filter((e) => e !== email));
        } else {
            setSelectedEmails([...selectedEmails, email]);
        }
    };

    const handleSelectAllFiltered = () => {
        const filtered = recipients.filter((r) => {
            if (roleFilter === 'ALL') return true;
            return (r.rol || '').toUpperCase() === roleFilter;
        });

        const filteredEmails = filtered.map((r) => r.email);
        const allSelected = filteredEmails.every((e) => selectedEmails.includes(e));

        if (allSelected) {
            setSelectedEmails(selectedEmails.filter((e) => !filteredEmails.includes(e)));
        } else {
            const combined = Array.from(new Set([...selectedEmails, ...filteredEmails]));
            setSelectedEmails(combined);
        }
    };

    const handleSendSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEmails.length === 0) {
            Swal.fire('Atención', 'Selecciona al menos un destinatario.', 'warning');
            return;
        }

        sendForm.transform((data) => ({
            ...data,
            recipients: selectedEmails,
        }));

        sendForm.post(route('admin.plantillas_correo.send'), {
            onSuccess: () => {
                setSendingTemplate(null);
                Swal.fire('¡Correos Enviados!', `Se enviaron los mensajes exitosamente a ${selectedEmails.length} destinatario(s).`, 'success');
            },
            onError: () => {
                Swal.fire('Error', 'Hubo un problema al procesar el envío de correos.', 'error');
            }
        });
    };

    return (
        <AdminPageLayout
            headTitle="Plantillas de Correo"
            title="Plantillas de Correo"
            subtitle="Crea y gestiona formatos institucionales de correo."
            breadcrumb="Comunicaciones"
            metrics={[]}
            quickActions={[]}
        >
            <div className="space-y-6 text-left">
                <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Catálogo de Plantillas</h2>
                        <p className="text-xs text-slate-500">Formatos disponibles para notificaciones automáticas y envíos masivos</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-[#0266E0] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        <Plus size={16} />
                        <span>Nueva Plantilla</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.length === 0 ? (
                        <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                                <FileText size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800">No hay plantillas registradas</h3>
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
                            <TemplateCard
                                key={tpl.id}
                                template={tpl}
                                onPreview={(t) => setPreviewHtml(t.contenido_html)}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                                onSend={openSendModal}
                            />
                        ))
                    )}
                </div>
            </div>

            <TemplateFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode={editingTemplate ? 'edit' : 'create'}
                template={editingTemplate}
                data={form.data}
                setData={form.setData}
                processing={form.processing}
                onSubmit={handleSubmit}
            />

            <EmailPreviewModal
                isOpen={previewHtml !== null}
                htmlContent={previewHtml}
                onClose={() => setPreviewHtml(null)}
            />

            <SendEmailModal
                template={sendingTemplate}
                recipients={recipients}
                selectedEmails={selectedEmails}
                roleFilter={roleFilter}
                diaSuspension={sendForm.data.dia_suspension}
                onDiaSuspensionChange={(val) => sendForm.setData('dia_suspension', val)}
                onRoleFilterChange={setRoleFilter}
                onSelectAllFiltered={handleSelectAllFiltered}
                onToggleEmail={handleToggleEmail}
                onSubmit={handleSendSubmit}
                onClose={() => setSendingTemplate(null)}
                isProcessing={sendForm.processing}
            />
        </AdminPageLayout>
    );
}

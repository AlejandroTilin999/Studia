import React from 'react';
import BaseModal from '@/Components/BaseModal';
import { Sparkles, X } from 'lucide-react';
import { Template } from './TemplateCard';

interface TemplateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    template: Template | null;
    data: {
        nombre: string;
        asunto: string;
        tipo: string;
        contenido_html: string;
        variables_disponibles?: string;
        activo?: boolean;
    };
    setData: (key: any, value?: any) => void;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function TemplateFormModal({
    isOpen,
    onClose,
    mode,
    template,
    data,
    setData,
    processing,
    onSubmit,
}: TemplateFormModalProps) {
    const [activeTab, setActiveTab] = React.useState<'preview' | 'editor'>('preview');

    if (!isOpen) return null;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            subtitle=""
            maxWidthClass="max-w-3xl"
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[480px] max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible h-full text-left relative">
                {/* Windows Close button relative to the entire grid modal container */}
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed md:absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Info Panel (col-span-2) - Solid Blue #0266E0 */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.webp" alt="Prepa Hidalgo" className="h-8 md:h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                                {mode === 'create' ? 'Nueva Plantilla de Correo' : 'Modificar Plantilla de Correo'}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                Configura el formato HTML institucional para avisos generales, comunicados y credenciales de acceso por correo masivo.
                            </p>

                            <div className="p-3 bg-white/10 rounded-xl border border-white/15 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Variables Dinámicas</span>
                                <p className="text-[11px] text-white font-mono">&#123;&#123;nombre&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;fecha&#125;&#125;</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block mt-6 uppercase tracking-widest">
                        Prepahid · Servicio Institucional
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <div className="col-span-1 md:col-span-3 p-5 md:p-6 flex flex-col justify-between min-h-0 md:min-h-[460px] relative bg-white rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
                    <form onSubmit={onSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        placeholder="Ej: Aviso General Importante"
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Categoría</label>
                                    <select
                                        value={data.tipo}
                                        onChange={(e) => {
                                            const newTipo = e.target.value;
                                            setData('tipo', newTipo);

                                            // Si es creación nueva y no se ha personalizado profundamente, autogenerar sugerencia visual
                                            if (mode === 'create') {
                                                if (newTipo === 'bienvenida') {
                                                    setData('nombre', 'Bienvenida de Alumnos');
                                                    setData('asunto', '¡Bienvenido(a) a Preparatoria Hidalgo! - {{nombre}}');
                                                    setData('contenido_html', `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px;"><div style="background-color: #0266E0; padding: 24px 30px; text-align: center;"><img src="https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/logo-ph-blanco.png" alt="Prepahid" style="max-height: 48px; width: auto; display: inline-block;" /></div><div style="padding: 30px 25px; color: #334155;"><h2 style="color: #0266E0; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">¡Bienvenido(a) a la Comunidad Prepahid!</h2><p style="font-size: 14px; line-height: 1.6; color: #475569;">Estimado(a) <strong>{{nombre}}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #475569;">Nos alegra darte la más cordial bienvenida a nuestra institución educativa. Tu cuenta escolar se encuentra lista para acceder al portal oficial.</p></div><div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0;"><p style="font-size: 11px; color: #94a3b8; margin: 0;">© 2026 Preparatoria Hidalgo · Prepahid.</p></div></div>`);
                                                } else if (newTipo === 'suspension') {
                                                    setData('nombre', 'Aviso de Suspensión de Clases');
                                                    setData('asunto', 'AVISO IMPORTANTE: Suspensión de Labores Escolares - Prepahid');
                                                    setData('contenido_html', `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px;"><div style="background-color: #0266E0; padding: 24px 30px; text-align: center;"><img src="https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/logo-ph-blanco.png" alt="Prepahid" style="max-height: 48px; width: auto; display: inline-block;" /></div><div style="padding: 30px 25px; color: #334155;"><h2 style="color: #0266E0; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">Aviso Oficial de Suspensión de Clases</h2><p style="font-size: 14px; line-height: 1.6; color: #475569;">Estimada comunidad escolar (Padres de Familia, Alumnos y Docentes),</p><p style="font-size: 14px; line-height: 1.6; color: #475569;">Por medio del presente comunicado, la Dirección de Preparatoria Hidalgo informa que las actividades académicas y administrativas quedarán suspendidas oficialmente durante la siguiente fecha:</p><div style="background-color: #fff1f2; padding: 20px; border-left: 4px solid #e11d48; border-radius: 0px; margin: 24px 0;"><p style="margin: 0; font-size: 14px; color: #9f1239; font-weight: bold;">Día de Suspensión:</p><p style="margin: 6px 0 0 0; font-size: 16px; color: #e11d48; font-weight: 900;">{{dia_suspension}}</p></div><p style="font-size: 13px; color: #64748b; line-height: 1.5;">Las labores y clases se reanudarán de manera habitual en el horario regular al día hábil siguiente.</p></div><div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0;"><p style="font-size: 11px; color: #94a3b8; margin: 0;">© 2026 Preparatoria Hidalgo · Dirección General.</p></div></div>`);
                                                }
                                            }
                                        }}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                    >
                                        <option value="general">Aviso General</option>
                                        <option value="bienvenida">Bienvenida</option>
                                        <option value="suspension">Suspensión de Clases</option>
                                        <option value="institucional">Notificación Institucional</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Asunto del Correo</label>
                                <input
                                    type="text"
                                    required
                                    value={data.asunto}
                                    onChange={(e) => {
                                        const newAsunto = e.target.value;
                                        setData('asunto', newAsunto);

                                        // Si existe una etiqueta de asunto en el HTML de la vista previa, actualizarla en vivo
                                        if (data.contenido_html) {
                                            const updatedHtml = data.contenido_html.replace(
                                                /(<strong>Detalle:<\/strong>\s*)([^<]*)/i,
                                                `$1${newAsunto || '{{asunto}}'}`
                                            );
                                            if (updatedHtml !== data.contenido_html) {
                                                setData('contenido_html', updatedHtml);
                                            }
                                        }
                                    }}
                                    placeholder="Ej: Notificación Oficial de Prepahid - {{nombre}}"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Selector Editor / Vista Previa */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('preview')}
                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Vista Previa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('editor')}
                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${activeTab === 'editor' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Código HTML (Avanzado)
                                        </button>
                                    </div>
                                </div>

                                {activeTab === 'preview' ? (
                                    <div className="border border-slate-200 rounded-none p-3 bg-slate-50 max-h-60 overflow-y-auto">
                                        <div className="bg-white border border-slate-200 shadow-xs relative group">
                                            <div className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 border-b border-amber-100 flex items-center gap-1 font-medium">
                                                <Sparkles size={12} />
                                                <span>Puedes hacer clic en cualquier texto del correo para editarlo visualmente:</span>
                                            </div>
                                            <div
                                                contentEditable={true}
                                                suppressContentEditableWarning={true}
                                                onInput={(e) => setData('contenido_html', e.currentTarget.innerHTML)}
                                                className="outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset p-1 min-h-[120px]"
                                                dangerouslySetInnerHTML={{ __html: data.contenido_html || '<p class="text-xs text-slate-400 p-4">Sin contenido HTML...</p>' }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <textarea
                                        required
                                        rows={8}
                                        value={data.contenido_html}
                                        onChange={(e) => setData('contenido_html', e.target.value)}
                                        className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-900 text-slate-100"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#0266E0] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'Guardando...' : mode === 'edit' ? 'Guardar Cambios' : 'Crear Plantilla'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </BaseModal>
    );
}

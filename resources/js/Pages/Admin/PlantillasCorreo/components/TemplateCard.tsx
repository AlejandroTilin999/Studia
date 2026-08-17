import React from 'react';
import { Eye, Edit, Trash2, Send } from 'lucide-react';

export interface Template {
    id: number;
    nombre: string;
    asunto: string;
    contenido_html: string;
    tipo: string;
    variables_disponibles?: string;
    activo: boolean;
}

interface TemplateCardProps {
    template: Template;
    onPreview: (template: Template) => void;
    onEdit: (template: Template) => void;
    onDelete: (template: Template) => void;
    onSend: (template: Template) => void;
}

export default function TemplateCard({
    template,
    onPreview,
    onEdit,
    onDelete,
    onSend,
}: TemplateCardProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between text-left">
            <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {template.tipo}
                    </span>
                </div>

                <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-1">{template.nombre}</h3>
                <p className="text-slate-500 text-xs line-clamp-1 mt-1 font-medium">
                    <span className="text-slate-400">Asunto:</span> {template.asunto}
                </p>

                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 font-mono text-[11px] max-h-24 overflow-hidden relative">
                    <div className="line-clamp-3">{template.contenido_html.replace(/<[^>]*>?/gm, '')}</div>
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-50 to-transparent" />
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPreview(template)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Previsualizar"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(template)}
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(template)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {template.tipo === 'recuperacion' ? (
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        Plantilla de Sistema
                    </span>
                ) : (
                    <button
                        onClick={() => onSend(template)}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        <Send size={14} />
                        <span>Enviar</span>
                    </button>
                )}
            </div>
        </div>
    );
}

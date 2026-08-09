import React from 'react';
import { Paperclip, ExternalLink } from 'lucide-react';

interface AssignmentMaterialsProps {
    desc: string;
    attachments?: any[];
    materialUrl?: string;
    strokeColor: string;
}

export default function AssignmentMaterials({
    desc,
    attachments,
    materialUrl,
    strokeColor
}: AssignmentMaterialsProps) {
    const hasMaterials = (attachments && attachments.length > 0) || Boolean(materialUrl);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Instrucciones
                </span>
                <div 
                    style={{ borderColor: strokeColor }}
                    className="border-l-4 pl-5 py-1 text-slate-600 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line"
                >
                    {desc || 'Sin instrucciones adicionales.'}
                </div>
            </div>

            {hasMaterials && (
                <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Materiales y Recursos Adjuntos
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attachments?.map((file: any, idx: number) => (
                            <a
                                key={idx}
                                href={file.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Paperclip size={16} style={{ color: strokeColor }} className="shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 block truncate">
                                            {file.name || file.nombre || 'Material de apoyo'}
                                        </span>
                                        {file.size && (
                                            <span className="text-[9px] text-slate-400 font-semibold block">
                                                {file.size}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                            </a>
                        ))}
                        {!attachments?.length && materialUrl && (
                            <a
                                href={materialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Paperclip size={16} style={{ color: strokeColor }} className="shrink-0" />
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                                        Material de estudio adjunto
                                    </span>
                                </div>
                                <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

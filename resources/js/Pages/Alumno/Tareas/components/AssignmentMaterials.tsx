import React from 'react';
import { ExternalLink, Paperclip } from 'lucide-react';
import { getFileIcon } from '@/utils/FileHelper';

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
        <div className="space-y-7">
            <section className="border-b border-slate-200 pt-3 pb-6">
                <div className="pb-3 flex items-center gap-2">
                    <span style={{ backgroundColor: strokeColor }} className="w-1.5 h-4 rounded-full" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detalles de la actividad</span>
                </div>
                <div className="pt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Instrucciones</span>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                        {desc || 'El docente no agregó instrucciones adicionales para esta actividad.'}
                    </p>
                </div>
            </section>

            <section className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                    <Paperclip size={15} style={{ color: strokeColor }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                        Material de apoyo
                    </span>
                </div>

                {hasMaterials ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attachments?.map((file: any, idx: number) => {
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

                            const fileUrl = getFileUrl(file);
                            const rawName = (typeof file === 'object' && (file?.name || file?.nombre)) ? (file.name || file.nombre) : (typeof file === 'string' && !file.startsWith('http') ? file : '');
                            const fileName = rawName || (fileUrl !== '#' ? fileUrl.split('/').pop()?.split('?')[0] : 'Material de apoyo');
                            const isPdf = fileName.toLowerCase().endsWith('.pdf') || (typeof file === 'object' && (file?.type || '').toLowerCase().includes('pdf'));
                            const hasValidUrl = fileUrl !== '#' && fileUrl.length > 1;

                            return (
                                <a
                                    key={idx}
                                    href={hasValidUrl ? fileUrl : '#'}
                                    target={hasValidUrl ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className="border border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300 px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 mr-1">
                                        <div className="shrink-0 flex items-center justify-center">
                                            {getFileIcon(fileName)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-xs font-bold text-slate-900 group-hover:underline block truncate">
                                                {fileName}
                                            </span>
                                        </div>
                                    </div>
                                    <ExternalLink size={16} className="text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
                                </a>
                            );
                        })}
                        {!attachments?.length && materialUrl && (
                            <a
                                href={materialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300 px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 min-w-0 mr-1">
                                    <div className="shrink-0 flex items-center justify-center">
                                        {getFileIcon(materialUrl)}
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 group-hover:underline truncate">
                                        Material de estudio adjunto
                                    </span>
                                </div>
                                <ExternalLink size={16} className="text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="border-l-2 border-slate-200 px-4 py-1 flex items-center gap-3 bg-white">
                        <div className="w-8 h-8 bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Paperclip size={15} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-600">Sin archivos adjuntos</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Esta actividad no requiere material de apoyo adicional.</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

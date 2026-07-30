import React, { useState, useEffect } from 'react';
import { FileText, Download, X, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface StudiaPDFViewerProps {
    url: string;
    filename: string;
    onClose: () => void;
}

/**
 * [VISOR PRO v6.8] Motor de visualización universal.
 * Detecta links de Google Drive y aplica la transformación /preview para visualización directa.
 */
export default function StudiaPDFViewer({ url, filename, onClose }: StudiaPDFViewerProps) {
    const [isLoading, setIsLoading] = useState(true);

    // [INTELIGENCIA] Transformar link de Drive para que sea embebible
    const getEmbedUrl = (rawUrl: string) => {
        try {
            if (rawUrl.includes('drive.google.com')) {
                // Convertir /view o /edit en /preview
                let cleanUrl = rawUrl.split('?')[0]; // Quitar parámetros de compartir
                if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

                if (cleanUrl.includes('/file/d/')) {
                    const fileId = cleanUrl.split('/file/d/')[1].split('/')[0];
                    return `https://drive.google.com/file/d/${fileId}/preview`;
                }

                return cleanUrl.replace(/\/view$/, '/preview').replace(/\/edit$/, '/preview');
            }
            return rawUrl;
        } catch (e) {
            return rawUrl;
        }
    };

    const embedUrl = getEmbedUrl(url);
    const isDrive = url.includes('drive.google.com');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1a1a1a] w-full max-w-6xl h-full sm:h-[95vh] shadow-2xl flex flex-col overflow-hidden border border-white/10 sm:rounded-3xl relative">

                {/* CABECERA */}
                <div className="bg-[#222] px-6 py-4 border-b border-white/5 flex items-center justify-between z-20 shadow-lg">
                    <div className="flex items-center gap-4 text-left min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                            <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white leading-none truncate max-w-[200px] sm:max-w-md">
                                {isDrive ? 'Documento de Google Drive' : filename}
                            </h4>
                            <span className="text-[10px] font-medium text-slate-500 mt-1 block uppercase tracking-widest">
                                Visor de Tareas Studia
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 hover:text-white transition-all px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/20"
                        >
                            <ExternalLink size={14} />
                            Abrir Original
                        </a>
                        <button onClick={onClose} className="text-slate-400 hover:bg-white/10 p-2.5 rounded-xl transition-all hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* AREA DE RENDERIZADO */}
                <div className="flex-1 relative bg-[#111] overflow-hidden flex justify-center">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 bg-[#111]">
                            <Loader2 size={40} className="text-blue-500 animate-spin opacity-50" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando vista previa...</p>
                        </div>
                    )}

                    <div className="w-full h-full flex items-center justify-center p-0 sm:p-2">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full border-0 rounded-lg bg-white shadow-inner"
                            title="Visor"
                            onLoad={() => setIsLoading(false)}
                        />
                    </div>
                </div>

                <div className="bg-[#1a1a1a] px-6 py-3 border-t border-white/5 flex items-center justify-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Studia Link-Viewer Engine · {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}

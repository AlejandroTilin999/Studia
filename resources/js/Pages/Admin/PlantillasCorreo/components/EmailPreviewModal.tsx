import React from 'react';
import { X } from 'lucide-react';

interface EmailPreviewModalProps {
    isOpen: boolean;
    htmlContent: string | null;
    onClose: () => void;
}

export default function EmailPreviewModal({ isOpen, htmlContent, onClose }: EmailPreviewModalProps) {
    if (!isOpen || htmlContent === null) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-none shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                {/* Modal Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Vista Previa del Correo</h3>
                        <p className="text-[11px] text-slate-400">Simulación del diseño que recibirá el destinatario final</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-none hover:bg-slate-200 transition-colors"
                        title="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body / Client Simulator */}
                <div className="p-4 md:p-8 overflow-y-auto max-h-[80vh] bg-slate-100/80 flex justify-center custom-scrollbar">
                    <div className="w-full max-w-2xl bg-white rounded-none shadow-sm border border-slate-200/80 overflow-y-auto max-h-[70vh]">
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

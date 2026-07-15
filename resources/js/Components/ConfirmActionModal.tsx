import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;      // Optional: First string to type (e.g. matricula)
    confirmTextLabel?: string;  // Optional
    actionPhrase?: string;     // Optional: Second string to type (e.g. "dar de baja")
    actionPhraseLabel?: string; // Optional
    warningMessage?: string;   // Optional warning banner
    confirmLabel?: string;     // Button text (defaults to 'Confirmar')
    confirmButtonVariant?: 'danger' | 'primary';
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
    processingLabel?: string;
    successLabel?: string;
    errorLabel?: string;       // 👈 Permite mostrar un mensaje específico de error de base de datos
}

export default function ConfirmActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    confirmTextLabel,
    actionPhrase,
    actionPhraseLabel,
    warningMessage,
    confirmLabel = 'Confirmar',
    confirmButtonVariant = 'danger',
    saveStatus,
    processingLabel,
    successLabel,
    errorLabel,
}: ConfirmActionModalProps) {
    const [firstInput, setFirstInput] = useState('');
    const [secondInput, setSecondInput] = useState('');

    const currentStatus = saveStatus || 'idle';

    // Reset inputs when opened/closed
    useEffect(() => {
        if (!isOpen) {
            setFirstInput('');
            setSecondInput('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Check matches only if verification fields are passed
    const requiresVerification = !!(confirmText && actionPhrase);
    const isMatch = !requiresVerification || (
        firstInput.trim() === confirmText &&
        secondInput.trim().toLowerCase() === actionPhrase.toLowerCase()
    );

    const handleConfirmSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isMatch && currentStatus === 'idle') {
            onConfirm();
            if (saveStatus === undefined) {
                onClose();
            }
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && currentStatus === 'idle') {
            onClose();
        }
    };

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200"
        >
            <div className="bg-white w-full max-w-md rounded-[24px] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative">

                {currentStatus !== 'idle' ? (
                    <div className="p-6">
                        {currentStatus === 'saving' && (
                            <div className="flex flex-col items-center justify-center py-6 space-y-4">
                                <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                                <p className="font-extrabold text-slate-800 text-sm">
                                    {processingLabel || "Procesando solicitud..."}
                                </p>
                                <p className="text-xs text-slate-400 font-bold">Por favor, espera un momento.</p>
                            </div>
                        )}
                        {currentStatus === 'success' && (
                            <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in zoom-in duration-200">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <svg className="w-8 h-8 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="font-extrabold text-slate-800 text-base">
                                    {successLabel || "¡Operación completada!"}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium text-center">La acción se registró de manera exitosa en el sistema.</p>
                            </div>
                        )}
                        {currentStatus === 'error' && (
                            <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in zoom-in duration-200">
                                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-550 flex items-center justify-center">
                                    <svg className="w-8 h-8 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h3 className="font-extrabold text-slate-800 text-base">Hubo un problema</h3>
                                <p className="text-xs text-rose-550 font-bold text-center max-w-[280px]">
                                    {errorLabel || "No se pudo realizar la acción. Inténtalo de nuevo."}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="px-6 pt-6 pb-2 flex justify-between items-start">
                            <h3 className="text-xl font-bold text-slate-900 leading-tight text-left">
                                {title}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-lg transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Description */}
                        <div className="px-6 pb-4 text-left">
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                {description}
                            </p>
                        </div>

                        {/* Body Form */}
                        <form onSubmit={handleConfirmSubmit} className="flex-1 flex flex-col">

                            {/* Render inputs only if double verification is required */}
                            {requiresVerification && (
                                <div className="px-6 pb-4 space-y-4">
                                    {/* First confirmation input */}
                                    <div className="space-y-2 text-left">
                                        <label className="text-xs font-semibold text-slate-600 block">
                                            {confirmTextLabel || (
                                                <>
                                                    Para confirmar, escribe <span className="font-bold text-slate-900">"{confirmText}"</span>
                                                </>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            value={firstInput}
                                            onChange={e => setFirstInput(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-slate-400 focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 transition-all font-medium"
                                            placeholder={confirmText}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Second confirmation input */}
                                    <div className="space-y-2 text-left">
                                        <label className="text-xs font-semibold text-slate-600 block">
                                            {actionPhraseLabel || (
                                                <>
                                                    Para confirmar, escribe <span className="font-bold text-slate-900">"{actionPhrase}"</span>
                                                </>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            value={secondInput}
                                            onChange={e => setSecondInput(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-slate-400 focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 transition-all font-medium"
                                            placeholder={actionPhrase}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Warning Box */}
                            {warningMessage && (
                                <div className="px-6 pb-6">
                                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5 text-left">
                                        <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                                        <p className="text-[12px] text-rose-600 font-bold leading-normal">
                                            {warningMessage}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions (Transparent & Borderless) */}
                            <div className="px-6 pb-6 flex items-center justify-end gap-3">
                                <button
                                    type="submit"
                                    disabled={!isMatch}
                                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-colors shadow-sm ${isMatch
                                            ? confirmButtonVariant === 'danger'
                                                ? 'bg-[#c23c1a] hover:bg-[#a63013] text-white cursor-pointer active:scale-[0.98]'
                                                : 'bg-[#1e88e5] hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]'
                                            : 'bg-[#f1f3f5] text-[#8a99a8] cursor-not-allowed border border-slate-150'
                                        }`}
                                >
                                    {confirmLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors shadow-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

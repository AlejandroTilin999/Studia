import React, { useEffect } from 'react';
import { X, Check, AlertOctagon, AlertTriangle, HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModalType = 'form' | 'confirm' | 'success' | 'error' | 'warning' | 'info';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    type?: ModalType;
    maxWidthClass?: string; // e.g. "max-w-lg", "max-w-md", "max-w-sm"

    // Form & Button Integration
    onSubmit?: (e: React.FormEvent) => void;
    confirmLabel?: string;                  // Label for the submit/primary button (e.g. "Registrar", "Guardar")
    cancelLabel?: string;                   // Label for the cancel/secondary button (e.g. "Cancelar", "Cerrar")
    isConfirmDisabled?: boolean;
    showFooter?: boolean;                   // Hide/show footer entirely
    customFooter?: React.ReactNode;         // Custom action buttons to override standard Cancel/Confirm

    headerAction?: React.ReactNode;          // Action component (like buttons) to show on the right of the header title
    headerIcon?: React.ReactNode;            // Optional icon for the pre-title
    fullBleed?: boolean;                     // Remove wrapper padding & default header/close buttons
    children?: React.ReactNode;
}

export default function BaseModal({
    isOpen,
    onClose,
    title,
    subtitle,
    type = 'form',
    maxWidthClass = 'max-w-md',
    onSubmit,
    confirmLabel,
    cancelLabel = 'Cancelar',
    isConfirmDisabled = false,
    showFooter = true,
    customFooter,
    headerAction,
    headerIcon,
    fullBleed = false,
    children,
}: BaseModalProps) {

    // Cerrar con Escape y bloquear scroll del body
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getAccentColorClass = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-600';
            case 'error':
                return 'bg-rose-650';
            case 'warning':
                return 'bg-amber-500';
            case 'confirm':
                return 'bg-blue-600';
            case 'info':
                return 'bg-sky-500';
            default:
                return 'bg-[#1e88e5]'; // Brand blue
        }
    };

    const renderIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="text-emerald-600 w-fit mb-3">
                        <Check size={28} className="stroke-[3]" />
                    </div>
                );
            case 'error':
                return (
                    <div className="text-rose-600 w-fit mb-3">
                        <AlertOctagon size={28} className="stroke-[2.5]" />
                    </div>
                );
            case 'warning':
                return (
                    <div className="text-amber-550 w-fit mb-3">
                        <AlertTriangle size={28} className="stroke-[2.5]" />
                    </div>
                );
            case 'confirm':
                return (
                    <div className="text-[#1e88e5] w-fit mb-3">
                        <HelpCircle size={28} className="stroke-[2.5]" />
                    </div>
                );
            case 'info':
                return (
                    <div className="text-blue-500 w-fit mb-3">
                        <Info size={28} className="stroke-[2.5]" />
                    </div>
                );
            default:
                return null;
        }
    };

    const isFormType = type === 'form';

    const renderFooter = () => {
        if (!showFooter) return null;

        if (customFooter) {
            return (
                <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 font-sans">
                    {customFooter}
                </div>
            );
        }

        return (
            <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 font-sans select-none">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 active:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all transform duration-75 focus:outline-none cursor-pointer"
                >
                    {cancelLabel}
                </button>
                {(confirmLabel || onSubmit) && (
                    <button
                        type="submit"
                        disabled={isConfirmDisabled}
                        className={cn(
                            "px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all transform duration-75 active:scale-95 focus:outline-none cursor-pointer",
                            isConfirmDisabled
                                ? "bg-slate-200 text-slate-455 cursor-not-allowed border border-slate-100"
                                : type === 'error' || type === 'warning'
                                    ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                                    : "bg-[#1e88e5] hover:bg-blue-700 active:bg-blue-800"
                        )}
                    >
                        {confirmLabel || 'Aceptar'}
                    </button>
                )}
            </div>
        );
    };

    const renderContent = () => (
        <>
            {/* Body */}
            <div className="space-y-4 text-left h-full">
                {children}
            </div>
            {renderFooter()}
        </>
    );

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/35 backdrop-blur-[2px] p-2 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
        >
            <div className={cn(
                "bg-white w-full rounded-lg overflow-hidden animate-in fade-in zoom-in-98 duration-150 relative my-auto shadow-none",
                fullBleed ? "p-0 border-0" : "p-6 pt-7 border border-slate-200/90",
                maxWidthClass
            )}>
                {/* Accent stripe only if not full bleed */}
                {!fullBleed && <div className={cn("absolute top-0 left-0 right-0 h-[4px]", getAccentColorClass())} />}

                {/* Close button only if not full bleed */}
                {!fullBleed && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all focus:outline-none"
                    >
                        <X size={15} className="stroke-[2.5]" />
                    </button>
                )}

                {/* Icon for non-form alerts */}
                {!fullBleed && !isFormType && renderIcon()}

                {/* Header (Fluent Design aligned left) only if not full bleed */}
                {!fullBleed && (
                    <div className="mb-5 text-left">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-base font-bold text-slate-900 leading-tight">
                                {title}
                            </h3>
                            {headerAction && (
                                <div className="shrink-0 mr-6">
                                    {headerAction}
                                </div>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-slate-500 font-normal mt-1 leading-normal">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Wrapper: form vs div */}
                {onSubmit ? (
                    <form onSubmit={onSubmit} className="h-full">
                        {renderContent()}
                    </form>
                ) : (
                    <div className="h-full">
                        {renderContent()}
                    </div>
                )}
            </div>
        </div>
    );
}

import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Utility helper for SweetAlert2 notifications to maintain consistency
 * and modularity across the application.
 */
export const SwalHelper = {
    /**
     * Basic alert with custom icon, title and text
     */
    alert: (title: string, text: string, icon: SweetAlertIcon = 'info') => {
        return Swal.fire({
            title,
            text,
            icon,
            confirmButtonColor: '#1e88e5',
            confirmButtonText: 'Entendido',
            customClass: {
                popup: 'rounded-xl',
                confirmButton: 'rounded-lg px-6 py-2 text-sm font-semibold'
            }
        });
    },

    /**
     * Success notification
     */
    success: (title: string = '¡Éxito!', text: string = 'Operación realizada correctamente.') => {
        return Swal.fire({
            title,
            text,
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            customClass: {
                popup: 'rounded-xl',
            }
        });
    },

    /**
     * Error notification
     */
    error: (title: string = 'Error', text: string = 'Hubo un problema al procesar la solicitud.') => {
        return Swal.fire({
            title,
            text,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Cerrar',
            customClass: {
                popup: 'rounded-xl',
                confirmButton: 'rounded-lg px-6 py-2 text-sm font-semibold'
            }
        });
    },

    /**
     * Loading / Processing alert
     */
    loading: (title: string = 'Procesando...', text: string = 'Por favor, espera un momento.') => {
        Swal.fire({
            title,
            text,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            customClass: {
                popup: 'rounded-xl',
            }
        });
    },

    /**
     * Close any open Swal
     */
    close: () => {
        Swal.close();
    },

    /**
     * Confirmation dialog for critical actions
     */
    confirm: (
        title: string,
        text: string,
        confirmText: string = 'Sí, continuar',
        cancelText: string = 'Cancelar',
        icon: SweetAlertIcon = 'warning'
    ) => {
        return Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonColor: '#1e88e5',
            cancelButtonColor: '#64748b',
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true,
            customClass: {
                popup: 'rounded-xl',
                confirmButton: 'rounded-lg px-6 py-2 text-sm font-semibold',
                cancelButton: 'rounded-lg px-6 py-2 text-sm font-semibold'
            }
        });
    },

    /**
     * Toast notification (small, bottom-right)
     */
    toast: (title: string, icon: SweetAlertIcon = 'success') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        return Toast.fire({
            icon,
            title
        });
    }
};

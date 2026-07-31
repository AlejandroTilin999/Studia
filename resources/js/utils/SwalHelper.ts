import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Utility helper for SweetAlert2 notifications.
 * Uses default SweetAlert2 styling as requested.
 */
export const SwalHelper = {
    /**
     * Basic alert
     */
    alert: (title: string, text: string, icon: SweetAlertIcon = 'info') => {
        return Swal.fire({
            title,
            text,
            icon,
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
        });
    },

    /**
     * Close any open Swal
     */
    close: () => {
        Swal.close();
    },

    /**
     * Confirmation dialog
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
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true,
        });
    },

    /**
     * Confirmation for destructive actions with password input
     * Uses default SweetAlert2 input styling
     */
    passwordConfirm: (
        title: string,
        text: string,
        confirmText: string = 'Confirmar',
        onConfirm: (password: string) => void
    ) => {
        return Swal.fire({
            title,
            text,
            icon: 'warning',
            input: 'password',
            inputPlaceholder: 'Ingresa tu contraseña',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off',
                autocomplete: 'new-password'
            },
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            showLoaderOnConfirm: true,
            customClass: {
                actions: 'w-full flex justify-center gap-3 px-6 md:px-12',
                confirmButton: 'flex-1 h-12 rounded-lg font-bold',
                cancelButton: 'flex-1 h-12 rounded-lg font-bold'
            },
            preConfirm: (password) => {
                if (!password) {
                    Swal.showValidationMessage('La contraseña es necesaria');
                    return false;
                }
                return password;
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                onConfirm(result.value);
            }
        });
    },

    /**
     * Toast notification
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

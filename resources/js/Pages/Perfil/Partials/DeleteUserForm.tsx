import { ButtonLogin } from '@/Components/ButtonLogin';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { SwalHelper } from "@/utils/SwalHelper";
import Swal from 'sweetalert2';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const {
        setData,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        SwalHelper.passwordConfirm(
            '¿Confirmar eliminación?',
            'Esta acción borrará permanentemente todos tus datos institucionalmente. Ingresa tu contraseña para proceder.',
            'Sí, eliminar cuenta',
            (password) => {
                setData('password', password);
                setTimeout(() => {
                    executeDelete(password);
                }, 100);
            }
        );
    };

    const executeDelete = (password: string) => {
        destroy(route('perfil.destroy'), {
            data: { password }, // Pasar password directo en el payload
            preserveScroll: true,
            onError: (err) => {
                SwalHelper.error('Error de validación', err.password || 'La contraseña es incorrecta.');
            },
            onFinish: () => reset(),
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="mb-8 border-b border-rose-50 pb-6 text-left">
                <h2 className="text-xl font-bold text-rose-600 tracking-tight">
                    Eliminar Cuenta Institucional
                </h2>

                <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                    Esta acción es irreversible. Se borrarán tus expedientes, tareas y accesos de forma permanente del sistema.
                </p>
            </header>

            <div className="flex justify-start">
                <ButtonLogin
                    type="button"
                    onClick={confirmUserDeletion}
                    className="bg-rose-500 hover:bg-rose-700 text-white px-10 h-12 rounded-lg font-black text-xs uppercase tracking-widest transition-all border-none shadow-none"
                >
                    Eliminar mi cuenta
                </ButtonLogin>
            </div>
        </section>
    );
}

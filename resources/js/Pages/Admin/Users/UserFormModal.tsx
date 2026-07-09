import { useEffect, useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { MockUser } from './UserTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    user: MockUser | null;
    onSubmit: (data: {
        name: string;
        email: string;
        role: 'admin' | 'docente' | 'alumno';
        status: 'active' | 'inactive';
        password?: string;
    }) => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
}

export default function UserFormModal({
    isOpen,
    onClose,
    mode,
    user,
    onSubmit,
    saveStatus = 'idle',
}: UserFormModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'alumno' as 'admin' | 'docente' | 'alumno',
        status: 'active' as 'active' | 'inactive',
        password: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    password: '',
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    role: 'alumno',
                    status: 'active',
                    password: '',
                });
            }
        }
    }, [isOpen, mode, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={saveStatus !== 'idle' ? '' : mode === 'create' ? 'Registrar Nuevo Usuario' : 'Editar Usuario'}
            subtitle={saveStatus !== 'idle' ? '' : "Ingresa la información básica y el rol del usuario en el sistema"}
            maxWidthClass="max-w-lg"
            onSubmit={handleSubmit}
            confirmLabel={mode === 'create' ? 'Registrar' : 'Guardar Cambios'}
            showFooter={saveStatus === 'idle'}
        >
            {saveStatus === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                    <p className="font-extrabold text-slate-800 text-sm">
                        {mode === 'create' ? 'Registrando usuario...' : 'Guardando cambios...'}
                    </p>
                    <p className="text-xs text-slate-400 font-bold">Por favor, espera un momento.</p>
                </div>
            )}

            {saveStatus === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in duration-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <svg className="w-8 h-8 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base">¡Operación Exitosa!</h3>
                    <p className="text-xs text-slate-500 font-medium text-center">
                        {mode === 'create' ? 'El usuario ha sido creado correctamente.' : 'Los cambios han sido guardados con éxito.'}
                    </p>
                </div>
            )}

            {saveStatus === 'error' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in duration-200">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                        <svg className="w-8 h-8 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base">Hubo un problema</h3>
                    <p className="text-xs text-rose-550 font-bold text-center max-w-[280px]">
                        No se pudo guardar la información de usuario.
                    </p>
                </div>
            )}

            {saveStatus === 'idle' && (
                <>
                    {/* Nombre */}
                    <div className="space-y-1.5 text-left">
                        <FormLabel required>Nombre Completo</FormLabel>
                        <FormInput
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Ing. Francisco Javier Martínez"
                            icon={<User size={16} />}
                        />
                    </div>

                    {/* Correo */}
                    <div className="space-y-1.5 text-left mt-4">
                        <FormLabel required>Correo Electrónico</FormLabel>
                        <FormInput
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="ejemplo@prepahidalgo.edu.mx"
                            icon={<Mail size={16} />}
                        />
                    </div>

                    {/* Contraseña (Solo en creación) */}
                    {mode === 'create' && (
                        <div className="space-y-1.5 text-left mt-4">
                            <FormLabel required>Contraseña Temporal</FormLabel>
                            <FormInput
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                icon={<Lock size={16} />}
                            />
                        </div>
                    )}

                    {/* Rol y Estado */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Rol del Sistema</FormLabel>
                            <FormSelect
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                            >
                                <option value="admin">Administrador</option>
                                <option value="docente">Docente</option>
                                <option value="alumno">Alumno</option>
                            </FormSelect>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Estado Inicial</FormLabel>
                            <FormSelect
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </FormSelect>
                        </div>
                    </div>
                </>
            )}
        </BaseModal>
    );
}

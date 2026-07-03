import { useEffect, useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { MockUser } from './UserTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput, FormSelect } from '@/Components/FormFields';

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
}

export default function UserFormModal({
    isOpen,
    onClose,
    mode,
    user,
    onSubmit,
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
            title={mode === 'create' ? 'Registrar Nuevo Usuario' : 'Editar Usuario'}
            subtitle="Ingresa la información básica y el rol del usuario en el sistema"
            maxWidthClass="max-w-lg"
            onSubmit={handleSubmit}
            confirmLabel={mode === 'create' ? 'Registrar' : 'Guardar Cambios'}
        >
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
            <div className="space-y-1.5 text-left">
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
                <div className="space-y-1.5 text-left">
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
            <div className="grid grid-cols-2 gap-4">
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
        </BaseModal>
    );
}

import { useEffect, useState } from 'react';
import { User, Mail, Lock, X } from 'lucide-react';
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
        phone?: string;
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
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        role: 'admin' as 'admin' | 'docente' | 'alumno',
        status: 'active' as 'active' | 'inactive',
        password: '',
        phone: '',
    });

    const parseFullName = (fullName: string) => {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) {
            return { nombre: parts[0], paterno: '', materno: '' };
        } else if (parts.length === 2) {
            return { nombre: parts[0], paterno: parts[1], materno: '' };
        } else {
            const materno = parts[parts.length - 1];
            const paterno = parts[parts.length - 2];
            const nombre = parts.slice(0, parts.length - 2).join(' ');
            return { nombre, paterno, materno };
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && user) {
                const parsed = parseFullName(user.name);
                setFormData({
                    nombre: parsed.nombre,
                    apellido_paterno: parsed.paterno,
                    apellido_materno: parsed.materno,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    password: '',
                    phone: user.telefono || '',
                });
            } else {
                setFormData({
                    nombre: '',
                    apellido_paterno: '',
                    apellido_materno: '',
                    email: '',
                    role: 'admin',
                    status: 'active',
                    password: '',
                    phone: '',
                });
            }
        }
    }, [isOpen, mode, user]);

    const generateEmailFromName = (nombre: string, paterno: string) => {
        if (!nombre) return '';

        const cleanWord = (word: string) => {
            return word
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "");
        };

        const cleanName = cleanWord(nombre.split(/\s+/)[0]);
        const cleanPaterno = paterno ? cleanWord(paterno.split(/\s+/)[0]) : 'admin';

        return `${cleanName}.${cleanPaterno}@prepahidalgo.edu.mx`;
    };

    const handleNameChange = (val: string) => {
        setFormData(prev => {
            const next = { ...prev, nombre: val };
            if (mode === 'create') {
                next.email = generateEmailFromName(val, prev.apellido_paterno);
            }
            return next;
        });
    };

    const handlePaternoChange = (val: string) => {
        setFormData(prev => {
            const next = { ...prev, apellido_paterno: val };
            if (mode === 'create') {
                next.email = generateEmailFromName(prev.nombre, val);
            }
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullName = [formData.nombre, formData.apellido_paterno, formData.apellido_materno]
            .filter(Boolean)
            .join(' ');
        onSubmit({
            name: fullName,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            password: formData.password,
            phone: formData.phone,
        });
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            onSubmit={handleSubmit}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[380px] h-full text-left relative">
                {/* Windows Close button relative to the entire grid modal container */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Info Panel (col-span-2) - Solid Blue #0266E0 */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-xl font-bold text-white leading-tight">
                                {mode === 'create' ? 'Registrar Nuevo Usuario' : 'Modificar Información del Usuario'}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Registra una nueva cuenta de administrador para la gestión del sistema escolar.'
                                    : 'Modifica la información de acceso de esta cuenta administrativa.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 shrink-0 hidden md:block">
                        Prepahid Campus Escolar
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[360px] relative">
                    <div className="space-y-4 flex-1">

                        {/* Nombres */}
                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Nombres</FormLabel>
                            <FormInput
                                required
                                value={formData.nombre}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="Ej: Francisco Javier"
                                icon={<User size={16} />}
                                className="h-9 text-xs"
                            />
                        </div>

                        {/* Apellidos */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Apellido Paterno</FormLabel>
                                <FormInput
                                    required
                                    value={formData.apellido_paterno}
                                    onChange={e => handlePaternoChange(e.target.value)}
                                    placeholder="Ej: Martínez"
                                    className="h-9 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Apellido Materno</FormLabel>
                                <FormInput
                                    required
                                    value={formData.apellido_materno}
                                    onChange={e => setFormData({ ...formData, apellido_materno: e.target.value })}
                                    placeholder="Ej: López"
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        {/* Celular / Teléfono */}
                        <div className="space-y-1.5 text-left">
                            <FormLabel>Número de Celular</FormLabel>
                            <FormInput
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Ej: 4878787997"
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

                        {/* Rol del Sistema */}
                        <div className="space-y-1.5 text-left">
                            <FormLabel>Rol del Sistema</FormLabel>
                            <FormInput
                                readOnly
                                value="Administrador"
                                className="bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed select-none h-9 text-xs"
                                icon={<Lock size={14} />}
                            />
                            {mode === 'create' && (
                                <p className="text-[9px] text-slate-400 mt-1 italic">* Solo se pueden registrar cuentas administrativas desde este panel.</p>
                            )}
                        </div>
                    </div>

                    {/* Footer de Navegación Aligned Right */}
                    <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all focus:outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all focus:outline-none active:scale-[0.98]"
                        >
                            {mode === 'create' ? 'Registrar' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

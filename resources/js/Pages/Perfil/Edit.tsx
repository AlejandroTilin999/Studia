import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { User, Lock, ShieldAlert } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import { cn } from '@/lib/utils';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user.rol || 'admin';
    const [activeTab, setActiveTab] = useState<'detalles' | 'password' | 'seguridad'>('detalles');

    const steps = [
        { id: 'detalles', label: 'Mis Detalles', sub: 'Información personal', icon: User, num: 1 },
        { id: 'password', label: 'Contraseña', sub: 'Seguridad de acceso', icon: Lock, num: 2 },
        { id: 'seguridad', label: 'Seguridad', sub: 'Zona de peligro', icon: ShieldAlert, num: 3 },
    ];

    return (
        <AuthenticatedLayout noPadding>
            <Head title="Mi Perfil" />

            <div className="bg-white min-h-full flex flex-col font-body">
                {/* Header Institucional Reutilizando PageHeaderBanner */}
                <div className="relative">
                    <PageHeaderBanner
                        title="Configuración de Perfil"
                        subtitle="Administra tu identidad institucional, seguridad y preferencias de acceso."
                        breadcrumb="PERFIL"
                    />

                    {/* Stepper para MÓVIL (Fondo Blanco con Líneas) */}
                    <div className="lg:hidden px-6 py-8 bg-white border-b border-slate-100 relative">
                        <nav className="flex items-start justify-around gap-2 relative max-w-md mx-auto">
                            {/* Línea conectora de fondo */}
                            <div className="absolute top-[22px] left-10 right-10 h-0.5 bg-slate-300 z-0" />

                            {steps.map((step) => {
                                const isActive = activeTab === step.id;
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveTab(step.id as any)}
                                        className="flex flex-col items-center gap-2 outline-none group relative z-10"
                                    >
                                        <div className={cn(
                                            "w-11 h-11 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 border-2",
                                            isActive
                                                ? "bg-[#0266E0] border-[#0266E0] text-white"
                                                : "bg-white border-slate-200 text-slate-400"
                                        )}>
                                            {step.num}
                                        </div>
                                        <span className={cn(
                                            "text-[11px] font-black uppercase tracking-widest transition-colors text-center leading-tight",
                                            isActive ? "text-[#0266E0]" : "text-slate-400"
                                        )}>
                                            {step.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Área de Trabajo Split-View */}
                <div className="flex-1 flex flex-col lg:flex-row border-t border-slate-100 min-h-0 bg-white">

                    {/* Panel Izquierdo: Stepper Vertical (Solo Desktop) */}
                    <aside className="hidden lg:flex w-[320px] xl:w-[380px] bg-slate-50/30 p-12 border-r border-slate-100 shrink-0">
                        <div className="space-y-10 relative w-full">
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-300 z-0" />

                            <nav className="flex flex-col gap-12 relative z-10">
                                {steps.map((step) => {
                                    const isActive = activeTab === step.id;
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => setActiveTab(step.id as any)}
                                            className="flex items-start gap-4 text-left group outline-none"
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 border-2",
                                                isActive
                                                    ? "bg-[#0266E0] border-[#0266E0] text-white"
                                                    : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300"
                                            )}>
                                                {step.num}
                                            </div>

                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-[14px] font-black uppercase tracking-wider transition-colors",
                                                    isActive ? "text-[#0266E0]" : "text-slate-400 group-hover:text-slate-600"
                                                )}>
                                                    {step.label}
                                                </span>
                                                <span className={cn(
                                                    "text-[12px] font-bold mt-0.5 transition-colors",
                                                    isActive ? "text-blue-400" : "text-slate-300"
                                                )}>
                                                    {step.sub}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Panel Derecho: Contenido Dinámico */}
                    <main className="flex-1 p-6 md:p-12 lg:p-20 bg-white overflow-y-auto">
                        <div className="max-w-4xl animate-in fade-in slide-in-from-right-4 duration-500">

                            {activeTab === 'detalles' && (
                                <div className="space-y-8">
                                    <div className="pb-2 border-b border-slate-50">
                                        <h2 className="text-2xl font-black text-slate-800">Detalles Personales</h2>
                                        <p className="text-sm text-slate-400 font-bold mt-1">Configura la información básica de tu cuenta institucional.</p>
                                    </div>
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </div>
                            )}

                            {activeTab === 'password' && (
                                <div className="space-y-8">
                                    <div className="pb-2 border-b border-slate-50">
                                        <h2 className="text-2xl font-black text-slate-800">Cambio de Contraseña</h2>
                                        <p className="text-sm text-slate-400 font-bold mt-1">Actualiza tu clave de acceso periódicamente para mayor seguridad.</p>
                                    </div>
                                    <UpdatePasswordForm />
                                </div>
                            )}

                            {activeTab === 'seguridad' && (
                                <div className="space-y-8">
                                    <div className="pb-2 border-b border-rose-50">
                                        <h2 className="text-2xl font-black text-rose-600">Acciones de Cuenta</h2>
                                        <p className="text-sm text-slate-400 font-bold mt-1">Gestiona la permanencia de tu perfil en el sistema escolar.</p>
                                    </div>
                                    <DeleteUserForm />
                                </div>
                            )}

                        </div>
                    </main>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

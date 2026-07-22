import React from 'react';
import { router } from '@inertiajs/react';
import { Bell, CheckCheck, Clock, ShieldCheck } from 'lucide-react';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { cn } from '@/lib/utils';

interface Notificacion {
    id: number;
    titulo: string;
    mensaje: string;
    leido: boolean;
    fecha: string;
}

interface IndexProps {
    notificaciones: {
        data: Notificacion[];
        links: any[];
    };
}

export default function NotificacionesIndex({ notificaciones }: IndexProps) {
    const handleMarkAsRead = (id: number) => {
        router.post(route('admin.notificaciones.read', id), {}, {
            preserveScroll: true,
        });
    };

    const handleMarkAllAsRead = () => {
        SwalHelper.confirm(
            '¿Marcar todas como leídas?',
            'Se marcarán todas las notificaciones pendientes.',
            'Sí, marcar todas',
            'Cancelar'
        ).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.notificaciones.read_all'), {}, {
                    onSuccess: () => SwalHelper.success('Hecho', 'Todas las notificaciones marcadas como leídas.'),
                });
            }
        });
    };

    const hasUnread = notificaciones.data.some(n => !n.leido);

    return (
        <AdminPageLayout
            headTitle="Notificaciones"
            title="Centro de Notificaciones"
            subtitle="Gestiona tus alertas, avisos y solicitudes del sistema."
            breadcrumb="Notificaciones"
            metrics={[
                { code: "N1", label: "Totales", value: notificaciones.data.length },
                { code: "N2", label: "Sin leer", value: notificaciones.data.filter(n => !n.leido).length },
            ]}
            quickActions={[
                { label: "Marcar todas como leídas", onClick: handleMarkAllAsRead, icon: CheckCheck }
            ]}
        >
            <div className="space-y-4 max-w-4xl mx-auto py-4">
                {notificaciones.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <Bell size={48} className="mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">No tienes notificaciones</p>
                    </div>
                ) : (
                    notificaciones.data.map((n) => (
                        <div
                            key={n.id}
                            className={cn(
                                "relative overflow-hidden p-5 rounded-2xl border transition-all duration-300",
                                n.leido
                                    ? "bg-white border-slate-100 opacity-60"
                                    : "bg-blue-50/30 border-blue-100 shadow-sm shadow-blue-500/5 hover:border-blue-200"
                            )}
                        >
                            {!n.leido && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                            )}

                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={cn("text-sm uppercase tracking-wider", n.leido ? "font-bold text-slate-600" : "font-black text-blue-700")}>
                                            {n.titulo}
                                        </h4>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                            <Clock size={10} />
                                            {n.fecha}
                                        </div>
                                    </div>
                                    <p className={cn("text-sm leading-relaxed", n.leido ? "text-slate-500" : "text-slate-700 font-medium")}>
                                        {n.mensaje}
                                    </p>
                                </div>

                                {!n.leido && (
                                    <button
                                        onClick={() => handleMarkAsRead(n.id)}
                                        className="shrink-0 p-2 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title="Marcar como leída"
                                    >
                                        <CheckCheck size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminPageLayout>
    );
}

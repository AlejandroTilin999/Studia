import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import AppTable from '@/Components/table/AppTable';
import { TableActionButton } from '@/Components/TableActions';
import { Input } from '@/Components/Input';
import { ButtonLogin as Button } from '@/Components/ButtonLogin';
import { SwalHelper } from '@/utils/SwalHelper';
import { router } from '@inertiajs/react';

interface Activity {
    id: number;
    action: string;
    description?: string;
    user: string;
    time: string;
}

interface RecentActivitiesTableProps {
    activities?: Activity[];
}

export default function RecentActivitiesTable({ activities = [] }: RecentActivitiesTableProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleDeleteActivity = (activity: Activity) => {
        SwalHelper.confirm(
            '¿Eliminar Registro?',
            `Esta acción borrará definitivamente el registro de "${activity.action}" del historial de auditoría.`,
            'Sí, eliminar',
            'Cancelar',
            'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Eliminando registro...', 'Actualizando bitácora de seguridad');
                router.delete(route('admin.audit_logs.destroy', activity.id), {
                    onSuccess: () => SwalHelper.success('Eliminado', 'El registro ha sido removido con éxito.'),
                    onError: () => SwalHelper.error('Error', 'No se pudo eliminar el registro.')
                });
            }
        });
    };

    return (
        <div className="bg-white rounded-lg p-4 md:p-8 border border-slate-100 shadow-none flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Actividades recientes
                </h3>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar actividad"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-slate-50 border-none rounded-lg text-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#1e88e5]/20"
                    />
                </div>
                <Button variant="outline" size="sm" className="gap-2 h-11 border-slate-100 text-slate-500 font-medium shadow-none hover:bg-blue-50 hover:text-[#1e88e5] rounded-lg w-full sm:w-auto">
                    <Filter className="w-4 h-4" />
                    Ordenar por
                </Button>
            </div>

            <AppTable
                data={activities}
                keyExtractor={(item) => item.id}
                className="flex-1 scrollbar-hide"
                columns={[
                    {
                        header: "Actividad",
                        accessor: (row) => (
                            <div className="flex flex-col py-1">
                                <span className="font-semibold text-slate-700">{row.action}</span>
                                {row.description && (
                                    <span className="text-[10px] text-slate-400 line-clamp-1">{row.description}</span>
                                )}
                            </div>
                        ),
                        className: "min-w-[200px]"
                    },
                    {
                        header: "Usuario",
                        accessor: "user",
                        className: "text-slate-500 font-medium text-sm"
                    },
                    {
                        header: "Fecha y hora",
                        accessor: "time",
                        className: "text-slate-500 text-xs hidden md:table-cell"
                    },
                    {
                        header: "Acción",
                        align: "center",
                        accessor: (row) => (
                            <TableActionButton onClick={() => handleDeleteActivity(row)} title="Eliminar Actividad" icon="delete" variant="danger" />
                        )
                    }
                ]}
            />
        </div>
    );
}

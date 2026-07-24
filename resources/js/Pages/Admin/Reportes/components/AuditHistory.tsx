import React, { useState, useMemo } from 'react';
import { FormSelect } from '@/Components/forms/FormSelect';
import { History, Search, User, X, Filter, Trash2 } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import AppTable from '@/Components/table/AppTable';
import { TableActions, TableActionButton } from '@/Components/TableActions';
import { cn } from '@/lib/utils';

interface DownloadItem {
    id: number;
    folio: string;
    tipo: string;
    sujeto: string;
    admin: string;
    fecha: string;
    raw_date: string;
    metadata: any;
}

interface AuditHistoryProps {
    downloads: DownloadItem[];
    onViewItem: (item: DownloadItem) => void;
    onDeleteItem: (item: DownloadItem) => void;
    onClearHistory: () => void;
}

const REPORT_TYPES = [
    { id: 'all', label: 'Todos los tipos' },
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'constancia', label: 'Constancia' },
    { id: 'boleta', label: 'Boleta' },
    { id: 'historial', label: 'Historial' },
    { id: 'lote', label: 'Paquetes' },
];

export default function AuditHistory({ downloads = [], onViewItem, onDeleteItem, onClearHistory }: AuditHistoryProps) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredDownloads = useMemo(() => {
        return downloads.filter(item => {
            const matchesSearch =
                item.folio.toLowerCase().includes(search.toLowerCase()) ||
                item.sujeto.toLowerCase().includes(search.toLowerCase()) ||
                item.admin.toLowerCase().includes(search.toLowerCase()) ||
                item.fecha.toLowerCase().includes(search.toLowerCase());

            const matchesType = typeFilter === 'all' || item.tipo === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [downloads, search, typeFilter]);

    return (
        <div id="audit-section" className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Barra de Filtros Simple */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">

                {/* 1. Buscador Principal */}
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0266E0] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por folio, nombre del alumno, grupo, administrador o fecha..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 pr-10 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 shadow-none text-slate-700 placeholder-slate-400 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* 2. Selector de Tipo Estilo "Filtro" */}
                    <div className="w-full md:w-[240px] relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                        <FormSelect
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="h-12 pl-11 text-sm font-bold text-slate-500 hover:bg-slate-50 border-slate-200"
                        >
                            {REPORT_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </FormSelect>
                    </div>

                    {/* 3. Botón Limpiar Todo */}
                    <button
                        onClick={onClearHistory}
                        disabled={downloads.length === 0}
                        className="h-12 px-6 border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all rounded-lg flex items-center gap-2 font-bold text-xs uppercase tracking-widest shrink-0 disabled:opacity-30 disabled:cursor-not-allowed group"
                        title="Vaciar historial de descargas"
                    >
                        <Trash2 size={14} className="group-hover:animate-pulse" />
                        Limpiar
                    </button>
                </div>
            </div>

            <div className="w-full">
                <AppTable
                    data={filteredDownloads}
                    keyExtractor={(item, idx) => `${item.folio}-${idx}`}
                    emptyMessage={search || typeFilter !== 'all' ? "No se encontraron resultados para los filtros aplicados." : "Aún no hay registros de descargas en el sistema."}
                    defaultPageSize={15}
                    columns={[
                        {
                            header: "Folio Único",
                            accessor: (row) => (
                                <span className="text-[13px] font-medium text-slate-600">
                                    {row.folio}
                                </span>
                            ),
                        },
                        {
                            header: "Documento y Emisor",
                            accessor: (row) => (
                                <div className="flex items-center gap-3">
                                    {/* El icono de PDF ahora es el botón de acción */}
                                    <button
                                        onClick={() => onViewItem(row)}
                                        title="Ver documento original"
                                        className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-95 transition-all shadow-sm group/pdf border border-rose-100/50"
                                    >
                                        <FaFilePdf size={18} />
                                    </button>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[13px] font-medium text-slate-700 capitalize leading-tight">
                                            {row.tipo === 'lote' ? 'Paquete Grupal' : row.tipo}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-normal uppercase truncate">
                                            Por: {row.admin}
                                        </span>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: "Destinatario / Sujeto",
                            accessor: (row) => (
                                <div className="flex items-center gap-2">
                                    <User size={13} className="text-slate-300 shrink-0" />
                                    <span className="text-[13px] font-medium text-slate-600 uppercase truncate max-w-[300px]">
                                        {row.sujeto}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            header: "Fecha de Emisión",
                            accessor: (row) => (
                                <span className="text-[13px] font-medium text-slate-500 whitespace-nowrap">
                                    {row.fecha}
                                </span>
                            ),
                        },
                        {
                            header: "Acciones",
                            align: "right",
                            accessor: (row) => (
                                <TableActions align="end">
                                    <TableActionButton
                                        onClick={() => onDeleteItem(row)}
                                        title="Eliminar del historial"
                                        icon="delete"
                                        variant="danger"
                                    />
                                </TableActions>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    );
}

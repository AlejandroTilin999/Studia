import React from 'react';
import { Hash, Mail, X } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';
import { AcademicGroupProp } from '../types';
import { MONTHS, YEARS } from '../constants';

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    student: any;
    groups: AcademicGroupProp[];
    data: {
        matricula: string;
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
        email: string;
        telefono: string;
        fecha_nacimiento: string;
        grupo_id: number | string;
        estatus: 'active' | 'inactive' | 'suspended';
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}


export default function StudentFormModal({
    isOpen,
    onClose,
    mode,
    student,
    groups,
    data,
    setData,
    errors,
    processing,
    onSubmit,
}: StudentFormModalProps) {
    const getCleanDateParts = (dateStr: string) => {
        if (!dateStr) return { y: '', m: '', d: '' };
        const matchYmd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (matchYmd) {
            return { y: matchYmd[1], m: matchYmd[2], d: matchYmd[3] };
        }
        const matchDmy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (matchDmy) {
            return { y: matchDmy[3], m: matchDmy[2], d: matchDmy[1] };
        }
        return { y: '', m: '', d: '' };
    };

    const [localDay, setLocalDay] = React.useState('');
    const [localMonth, setLocalMonth] = React.useState('');
    const [localYear, setLocalYear] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            const clean = getCleanDateParts(data.fecha_nacimiento || '');
            setLocalDay(clean.d);
            setLocalMonth(clean.m);
            setLocalYear(clean.y);
        }
    }, [isOpen, data.fecha_nacimiento]);

    const handleDateChange = (type: 'day' | 'month' | 'year', value: string) => {
        let d = localDay;
        let m = localMonth;
        let y = localYear;

        if (type === 'day') {
            setLocalDay(value);
            d = value;
        } else if (type === 'month') {
            setLocalMonth(value);
            m = value;
            // Validar si el día actual excede el nuevo mes (ej: de 31 de Enero a Febrero)
            if (d) {
                const maxDays = new Date(parseInt(y) || 2000, parseInt(value), 0).getDate();
                if (parseInt(d) > maxDays) {
                    const newDay = maxDays.toString().padStart(2, '0');
                    setLocalDay(newDay);
                    d = newDay;
                }
            }
        } else if (type === 'year') {
            setLocalYear(value);
            y = value;
            // Re-validar febrero en bisiestos
            if (m === '02' && d === '29') {
                const maxDays = new Date(parseInt(value), 2, 0).getDate();
                if (maxDays < 29) {
                    setLocalDay('28');
                    d = '28';
                }
            }
        }

        if (d && m && y) {
            setData('fecha_nacimiento', `${y}-${m}-${d}`);
        } else {
            setData('fecha_nacimiento', '');
        }
    };

    const dynamicDays = React.useMemo(() => {
        const year = parseInt(localYear) || 2026;
        const month = parseInt(localMonth) || 1;
        const count = new Date(year, month, 0).getDate();
        return Array.from({ length: count }, (_, i) => (i + 1).toString().padStart(2, '0'));
    }, [localMonth, localYear]);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            onSubmit={onSubmit}
            isConfirmDisabled={processing}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[460px] max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible h-full text-left relative">
                {/* Windows Close button relative to the entire grid modal container */}
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed md:absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Info Panel (col-span-2) - Solid Blue #0266E0 */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.webp" alt="Prepa Hidalgo" className="h-8 md:h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                                {mode === 'create' ? 'Inscribir Nuevo Alumno' : 'Modificar Información del Alumno'}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Al registrar la matrícula, el alumno recibirá sus credenciales de acceso institucional y se creará su expediente de calificaciones.'
                                    : 'Modifica los datos personales, de contacto y de grupo. La matrícula permanece protegida.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block mt-6 uppercase tracking-widest">
                        Prepahid · Campus Digital
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <div className="col-span-1 md:col-span-3 p-5 md:p-6 flex flex-col justify-between min-h-0 md:min-h-[440px] relative bg-white rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
                    <div className="space-y-5 flex-1 flex flex-col justify-center">
                        {/* Autogenerated Credentials Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel>Matrícula</FormLabel>
                                <FormInput
                                    readOnly
                                    value={data.matricula || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-mono focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"
                                    icon={<Hash size={13} />}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel>Correo Electrónico (Acceso)</FormLabel>
                                <FormInput
                                    type="email"
                                    value={data.email || 'PROCESANDO...'}
                                    onChange={e => setData('email', e.target.value)}
                                    className="bg-white border border-slate-200 text-slate-700 font-mono h-9 text-xs"
                                    icon={<Mail size={13} />}
                                />
                            </div>
                        </div>

                        {/* Nombres y Apellido Paterno */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Nombre(s)</FormLabel>
                                <FormInput
                                    required
                                    value={data.nombre}
                                    onChange={e => setData('nombre', e.target.value)}
                                    placeholder="Ej: José Eduardo"
                                    className="h-9 text-xs"
                                />
                                {errors.nombre && <span className="text-red-500 text-[10px] mt-1 block">{errors.nombre}</span>}
                            </div>

                            <div className="space-y-1.5">
                                <FormLabel required>Apellido Paterno</FormLabel>
                                <FormInput
                                    required
                                    value={data.apellido_paterno}
                                    onChange={e => setData('apellido_paterno', e.target.value)}
                                    placeholder="Ej: Gómez"
                                    className="h-9 text-xs"
                                />
                                {errors.apellido_paterno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_paterno}</span>}
                            </div>
                        </div>

                        {/* Apellido Materno y Teléfono */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel>Apellido Materno</FormLabel>
                                <FormInput
                                    value={data.apellido_materno}
                                    onChange={e => setData('apellido_materno', e.target.value)}
                                    placeholder="Ej: López"
                                    className="h-9 text-xs"
                                />
                                {errors.apellido_materno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_materno}</span>}
                            </div>

                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Teléfono</FormLabel>
                                <FormInput
                                    type="tel"
                                    required
                                    value={data.telefono}
                                    maxLength={10}
                                    onChange={e => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setData('telefono', value);
                                    }}
                                    placeholder="Ej. 4431234567"
                                    className="h-9 text-xs"
                                />
                                {errors.telefono && (
                                    <span className="text-red-500 text-[10px] mt-1 block">
                                        {errors.telefono}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Fecha de nacimiento (Línea sola) */}
                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Fecha de nacimiento</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                                <FormSelect
                                    required
                                    value={localDay}
                                    onChange={e => handleDateChange('day', e.target.value)}
                                >
                                    <option value="">Día</option>
                                    {dynamicDays.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </FormSelect>

                                <FormSelect
                                    required
                                    value={localMonth}
                                    onChange={e => handleDateChange('month', e.target.value)}
                                >
                                    <option value="">Mes</option>
                                    {MONTHS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </FormSelect>

                                <FormSelect
                                    required
                                    value={localYear}
                                    onChange={e => handleDateChange('year', e.target.value)}
                                >
                                    <option value="">Año</option>
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </FormSelect>
                            </div>
                            {errors.fecha_nacimiento && (
                                <span className="text-red-500 text-[10px] mt-1 block">
                                    {errors.fecha_nacimiento}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Grupo Académico</FormLabel>
                            <FormSelect
                                required
                                value={data.grupo_id}
                                onChange={e => {
                                    const val = e.target.value;
                                    setData('grupo_id', val === '' ? '' : Number(val));
                                }}
                                className="h-9 text-xs"
                            >
                                <option value="">Seleccionar grupo...</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.nombre}
                                    </option>
                                ))}
                            </FormSelect>
                            {errors.grupo_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.grupo_id}</span>}
                        </div>
                    </div>

                    {/* Footer de Navegación Aligned Right */}
                    <div className="mt-8 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none bg-white md:bg-transparent sticky bottom-0 md:relative">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all focus:outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none"
                        >
                            {processing ? 'Guardando...' : mode === 'create' ? 'Registrar Matrícula' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

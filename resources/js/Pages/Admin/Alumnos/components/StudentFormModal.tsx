import React from 'react';
import { Hash, Mail, X } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';
import { AcademicGroupProp } from '../types';

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
        academic_group_id: number | string;
        status: 'active' | 'inactive' | 'suspended';
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
    }, [isOpen]);

    const years = Array.from({ length: 2027 - 1970 }, (_, i) => (2026 - i).toString());
    const days = Array.from({ length: 31 }, (_, i) => {
        const val = (i + 1).toString();
        return val.padStart(2, '0');
    });
    const months = [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
    ];

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
        } else if (type === 'year') {
            setLocalYear(value);
            y = value;
        }

        if (d && m && y) {
            setData('fecha_nacimiento', `${y}-${m}-${d}`);
        } else {
            setData('fecha_nacimiento', '');
        }
    };

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
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[460px] h-full text-left relative">
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
                                {mode === 'create' ? 'Inscribir Nuevo Alumno' : 'Modificar Información del Alumno'}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Al registrar la matrícula, el alumno recibirá sus credenciales de acceso institucional y se creará su expediente de calificaciones.'
                                    : 'Modifica los datos personales y de grupo. Por seguridad, la matrícula y el correo no pueden ser editados.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block">
                        Prepahid Campus Escolar
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[440px] relative">
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        {/* Autogenerated Credentials Grid */}
                        <div className="grid grid-cols-2 gap-4 text-left">
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
                                    readOnly
                                    value={data.email || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-mono focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"
                                    icon={<Mail size={13} />}
                                />
                            </div>
                        </div>

                        {/* Name Split Fields */}
                        <div className="grid grid-cols-1 gap-4 text-left">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <FormLabel required>Apellido Paternal</FormLabel>
                                    <FormInput
                                        required
                                        value={data.apellido_paterno}
                                        onChange={e => setData('apellido_paterno', e.target.value)}
                                        placeholder="Ej: Gómez"
                                        className="h-9 text-xs"
                                    />
                                    {errors.apellido_paterno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_paterno}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <FormLabel required>Apellido Maternal</FormLabel>
                                    <FormInput
                                        required
                                        value={data.apellido_materno}
                                        onChange={e => setData('apellido_materno', e.target.value)}
                                        placeholder="Ej: López"
                                        className="h-9 text-xs"
                                    />
                                    {errors.apellido_materno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_materno}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Fecha de nacimiento</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                                <FormSelect
                                    required
                                    value={localDay}
                                    onChange={e => handleDateChange('day', e.target.value)}
                                >
                                    <option value="">Día</option>
                                    {days.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </FormSelect>

                                <FormSelect
                                    required
                                    value={localMonth}
                                    onChange={e => handleDateChange('month', e.target.value)}
                                >
                                    <option value="">Mes</option>
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </FormSelect>

                                <FormSelect
                                    required
                                    value={localYear}
                                    onChange={e => handleDateChange('year', e.target.value)}
                                >
                                    <option value="">Año</option>
                                    {years.map(y => (
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

                        <div className="grid grid-cols-2 gap-4">
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
                                />
                                {errors.telefono && (
                                    <span className="text-red-500 text-[10px] mt-1 block">
                                        {errors.telefono}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Grupo Académico</FormLabel>
                                <FormSelect
                                    required
                                    value={data.academic_group_id}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setData('academic_group_id', val === '' ? '' : Number(val));
                                    }}
                                >
                                    <option value="">Seleccionar grupo...</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </FormSelect>
                                {errors.academic_group_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.academic_group_id}</span>}
                            </div>
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
                            disabled={processing}
                            className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none active:scale-[0.98]"
                        >
                            {processing ? 'Guardando...' : mode === 'create' ? 'Registrar Matrícula' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

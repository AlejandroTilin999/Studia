import React, { useState, useEffect } from 'react';
import { Hash, Mail, Phone } from 'lucide-react';
import { MockStudent } from './Index';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput, FormSelect } from '@/Components/FormFields';

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    student: MockStudent | null;
    nextId: number;
    onSubmit: (formData: {
        matricula: string;
        name: string;
        birthdate: string;
        email: string;
        phone: string;
        groupName: string;
        status: 'active' | 'suspended';
    }) => void;
}

export default function StudentFormModal({
    isOpen,
    onClose,
    mode,
    student,
    nextId,
    onSubmit,
}: StudentFormModalProps) {
    const [formData, setFormData] = useState({
        matricula: '',
        name: '',
        birthdate: '',
        email: '',
        phone: '',
        groupName: '1°A',
        status: 'active' as 'active' | 'suspended'
    });

    const [selectedDay, setSelectedDay] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    const days = Array.from({ length: 31 }, (_, i) => {
        const d = i + 1;
        return d < 10 ? '0' + d : String(d);
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

    const years = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => String(2026 - i));

    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                const generatedMatricula = `P${nextId < 10 ? '00' + nextId : nextId < 100 ? '0' + nextId : nextId}`;
                setFormData({
                    matricula: generatedMatricula,
                    name: '',
                    birthdate: '',
                    email: '',
                    phone: '',
                    groupName: '1°A',
                    status: 'active'
                });
                setSelectedDay('');
                setSelectedMonth('');
                setSelectedYear('');
            } else if (mode === 'edit' && student) {
                setFormData({
                    matricula: student.matricula,
                    name: student.name,
                    birthdate: student.birthdate,
                    email: student.email,
                    phone: student.phone,
                    groupName: student.groupName,
                    status: student.status
                });
                if (student.birthdate) {
                    const parts = student.birthdate.split('-');
                    setSelectedYear(parts[0] || '');
                    setSelectedMonth(parts[1] || '');
                    setSelectedDay(parts[2] || '');
                } else {
                    setSelectedDay('');
                    setSelectedMonth('');
                    setSelectedYear('');
                }
            }
        }
    }, [isOpen, mode, student, nextId]);

    const handleDayChange = (d: string) => {
        setSelectedDay(d);
        if (selectedYear && selectedMonth && d) {
            setFormData(prev => ({ ...prev, birthdate: `${selectedYear}-${selectedMonth}-${d}` }));
        }
    };

    const handleMonthChange = (m: string) => {
        setSelectedMonth(m);
        if (selectedYear && m && selectedDay) {
            setFormData(prev => ({ ...prev, birthdate: `${selectedYear}-${m}-${selectedDay}` }));
        }
    };

    const handleYearChange = (y: string) => {
        setSelectedYear(y);
        if (y && selectedMonth && selectedDay) {
            setFormData(prev => ({ ...prev, birthdate: `${y}-${selectedMonth}-${selectedDay}` }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDay || !selectedMonth || !selectedYear) {
            alert('Por favor, selecciona una fecha de nacimiento válida.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Registrar Nuevo Alumno' : 'Editar Expediente de Alumno'}
            subtitle="Configura los datos personales, matrícula y grupo del alumno"
            maxWidthClass="max-w-lg"
            onSubmit={handleSubmit}
            confirmLabel={mode === 'create' ? 'Registrar' : 'Guardar'}
        >
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1 text-left">
                    <FormLabel>Matrícula</FormLabel>
                    <FormInput
                        readOnly
                        value={formData.matricula}
                        className="bg-slate-100 border-0 text-slate-500 font-mono"
                        icon={<Hash size={13} />}
                    />
                </div>
                <div className="space-y-1.5 col-span-2 text-left">
                    <FormLabel required>Nombre Completo</FormLabel>
                    <FormInput
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nombre completo del estudiante"
                    />
                </div>
            </div>

            <div className="space-y-1.5 text-left">
                <FormLabel required>Correo Electrónico</FormLabel>
                <FormInput
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo.alumno@alumno.prepahidalgo.edu.mx"
                    icon={<Mail size={14} />}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                    <FormLabel required>Fecha de Nacimiento</FormLabel>
                    <div className="grid grid-cols-3 gap-1.5">
                        <FormSelect
                            required
                            value={selectedDay}
                            onChange={e => handleDayChange(e.target.value)}
                        >
                            <option value="">Día</option>
                            {days.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </FormSelect>
                        <FormSelect
                            required
                            value={selectedMonth}
                            onChange={e => handleMonthChange(e.target.value)}
                        >
                            <option value="">Mes</option>
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </FormSelect>
                        <FormSelect
                            required
                            value={selectedYear}
                            onChange={e => handleYearChange(e.target.value)}
                        >
                            <option value="">Año</option>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </FormSelect>
                    </div>
                </div>

                <div className="space-y-1.5 text-left">
                    <FormLabel required>Teléfono de Contacto</FormLabel>
                    <FormInput
                        type="tel"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({ ...formData, phone: val });
                        }}
                        placeholder="Ej: 7712345678"
                        icon={<Phone size={14} />}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                    <FormLabel required>Grupo Asignado</FormLabel>
                    <FormSelect
                        value={formData.groupName}
                        onChange={e => setFormData({ ...formData, groupName: e.target.value })}
                    >
                        <option value="1°A">Grupo 1°A</option>
                        <option value="2-B">Grupo 2-B</option>
                        <option value="3-A">Grupo 3-A</option>
                    </FormSelect>
                </div>

                <div className="space-y-1.5 text-left">
                    <FormLabel required>Estado</FormLabel>
                    <FormSelect
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    >
                        <option value="active">Activo</option>
                        <option value="suspended">Suspendido</option>
                    </FormSelect>
                </div>
            </div>
        </BaseModal>
    );
}

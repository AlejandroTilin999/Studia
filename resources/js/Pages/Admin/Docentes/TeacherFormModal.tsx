import { Mail, Phone } from "lucide-react";
import BaseModal from "@/Components/BaseModal";
import { FormLabel, FormInput, FormSelect } from '@/Components/FormFields';

interface FormData {
    name: string;
    email: string;
    phone: string;
    specialty: string;
}

interface TeacherFormModalProps {
    open: boolean;
    mode: "create" | "edit";
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function TeacherFormModal({
    open,
    mode,
    formData,
    setFormData,
    onClose,
    onSubmit,
}: TeacherFormModalProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e as any);
    };

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title={mode === "create" ? "Registrar Nuevo Docente" : "Editar Expediente de Docente"}
            subtitle="Configura el nombre, correo electrónico y especialidad del docente"
            maxWidthClass="max-w-lg"
            onSubmit={handleSubmit}
            confirmLabel={mode === "create" ? "Registrar" : "Guardar"}
        >
            {/* Nombre */}
            <div className="space-y-1.5 text-left">
                <FormLabel required>Nombre Completo</FormLabel>
                <FormInput
                    required
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            name: e.target.value,
                        })
                    }
                    placeholder="Ej: Francisco Javier Martínez"
                />
            </div>

            {/* Correo */}
            <div className="space-y-1.5 text-left">
                <FormLabel required>Correo Electrónico</FormLabel>
                <FormInput
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            email: e.target.value,
                        })
                    }
                    placeholder="correo.docente@prepahidalgo.edu.mx"
                    icon={<Mail size={14} />}
                />
            </div>

            {/* Teléfono y Especialidad */}
            <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5">
                    <FormLabel required>Teléfono</FormLabel>
                    <FormInput
                        type="tel"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({
                                ...formData,
                                phone: val,
                            });
                        }}
                        placeholder="Ej: 7711234567"
                        icon={<Phone size={14} />}
                    />
                </div>

                <div className="space-y-1.5">
                    <FormLabel required>Área de Especialidad</FormLabel>
                    <FormSelect
                        required
                        value={formData.specialty}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                specialty: e.target.value,
                            })
                        }
                    >
                        <option value="">Seleccionar área...</option>
                        <option value="Ciencias">Ciencias</option>
                        <option value="Lenguaje">Lenguaje</option>
                        <option value="Historia">Historia</option>
                    </FormSelect>
                </div>
            </div>
        </BaseModal>
    );
}
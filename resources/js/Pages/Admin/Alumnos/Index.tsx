import { useState, useEffect } from 'react';
import { Download, Layers, FileText } from "lucide-react";
import { useForm, router } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import AdminPageLayout from '@/Components/AdminPageLayout';
import ConfirmActionModal from '@/Components/ConfirmActionModal';
import { studentService } from './services/studentService';
import StudentTable from './components/StudentTable';
import StudentTableControls from './components/StudentTableControls';
import StudentFormModal from './components/StudentFormModal';
import StudentKardexModal from './components/StudentKardexModal';
import { AlumnosIndexProps, StudentFormatted, BackendStudent, BackendGrade } from './types';

export default function AlumnosIndex({ alumnos = [], groups = [] }: AlumnosIndexProps) {
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    // Mapeamos los datos simplificados directamente de la tabla única de alumnos
    const formattedStudents: StudentFormatted[] = alumnos.map((student: BackendStudent) => ({
        id: student.id,
        matricula: student.matricula || 'S/M',
        name: student.name || 'Sin nombre asignado',
        email: student.email || 'sin-correo@prepahidalgo.edu.mx',
        groupId: student.academic_group?.id || 0,
        groupName: student.academic_group?.name || 'Sin grupo',
        status: student.status || 'active',
        telefono: student.telefono || '',
        fecha_nacimiento: student.fecha_nacimiento || '',
        rawNombre: student.rawNombre || '',
        rawPaterno: student.rawPaterno || '',
        rawMaterno: student.rawMaterno || '',
        grades: student.grades?.map((g: any) => ({
            subject: g.subject || g.course?.name || 'Materia Desconocida',
            score: g.score,
            period: g.period || '2026-A'
        })) || []
    }));



    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isConfirmBajaOpen, setIsConfirmBajaOpen] = useState(false);
    const [bajaStatus, setBajaStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [studentToBaja, setStudentToBaja] = useState<any>(null);

    // FORMULARIO INTEGRADO A LAS TABLAS USERS Y ENROLLMENTS
    const { data, setData, reset, processing, errors } = useForm({
        matricula: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        academic_group_id: '',
        status: 'active' as 'active' | 'inactive' | 'suspended'
    });
    useEffect(() => {
        if (modalMode === 'create') {
            if (data.nombre.trim() === '' && data.apellido_paterno.trim() === '') {
                if (data.matricula !== '' || data.email !== '') {
                    setData(currentData => ({
                        ...currentData,
                        matricula: '',
                        email: ''
                    }));
                }
            } else {
                const firstInit = data.nombre.trim().charAt(0) || '';
                const paternalInit = data.apellido_paterno.trim().charAt(0) || '';
                const maternalInit = data.apellido_materno.trim().charAt(0) || '';
                const initials = `${firstInit}${paternalInit}${maternalInit}`.toUpperCase().padEnd(3, 'X').substring(0, 3);
                const groupSelected = groups.find(g => g.id === Number(data.academic_group_id));
                const groupCode = groupSelected ? groupSelected.id : '00';
                const currentYear = new Date().getFullYear();
                const generatedMatricula = `${initials}${groupCode}${currentYear}`;
                
                let firstNamePart = data.nombre.trim().split(/\s+/)[0]?.toLowerCase() || '';
                let paternalPart = data.apellido_paterno.trim().split(/\s+/)[0]?.toLowerCase() || '';
                let emailBase = `${firstNamePart}.${paternalPart}`.trim();
                emailBase = emailBase.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
                const generatedEmail = emailBase && emailBase !== '.' ? `${emailBase}@prepahid.edu.mx` : '';

                if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
                    setData(currentData => ({
                        ...currentData,
                        matricula: generatedMatricula,
                        email: generatedEmail
                    }));
                }
            }
        }
    }, [data.nombre, data.apellido_paterno, data.apellido_materno, data.academic_group_id, modalMode, groups]);;

    const handleExportExcel = () => {
        const rows = filteredStudents.map(s => [
            s.matricula,
            s.name,
            s.email,
            s.groupName,
            s.status === 'active' ? 'Activo' : 'Inactivo'
        ]);
        
        exportToExcel(
            "Reporte de Alumnos - PrepaHid",
            "Listado de Alumnos",
            ["Matrícula", "Nombre Completo", "Correo Electrónico", "Grupo Asignado", "Estado Matrícula"],
            rows,
            "reporte_alumnos",
            (msg) => triggerToast("Reporte de alumnos exportado a Excel con éxito.")
        );
    };

    const filteredStudents = formattedStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || student.groupId.toString() === groupFilter;
        return matchesSearch && matchesGroup;
    });

    const activeCount = formattedStudents.filter(s => s.status === 'active').length;
    const inactiveCount = formattedStudents.filter(s => s.status === 'suspended').length;
    const totalCount = formattedStudents.length;

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsFormModalOpen(true);
    };

    const openEditModal = (student: any) => {
        setModalMode('edit');
        setSelectedStudent(student);
        setData({
            matricula: student.matricula,
            nombre: student.rawNombre || '',
            apellido_paterno: student.rawPaterno || '',
            apellido_materno: student.rawMaterno || '',
            email: student.email,
            telefono: student.telefono,
            fecha_nacimiento: student.fecha_nacimiento,
            academic_group_id: student.groupId,
            status: student.status
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        
        const serviceCallback = {
            onSuccess: () => {
                setSaveStatus('success');
                reset();
                setTimeout(() => {
                    setIsFormModalOpen(false);
                    setSaveStatus('idle');
                }, 2000);
            },
            onError: () => {
                setSaveStatus('error');
                setTimeout(() => {
                    setSaveStatus('idle');
                }, 2500);
            },
            onFinish: () => {
                setSaveStatus(current => {
                    if (current === 'saving') {
                        setTimeout(() => setSaveStatus('idle'), 3000);
                        return 'error';
                    }
                    return current;
                });
            }
        };

        

        if (modalMode === 'create') {
            studentService.store(data, serviceCallback);
        } else if (modalMode === 'edit' && selectedStudent) {
            studentService.update(selectedStudent.id, data, serviceCallback);
        }
    };

    const toggleStatus = (student: any) => {
        setBajaStatus('saving');
        studentService.toggle(student.id, {
            onSuccess: () => {
                setBajaStatus('success');
                setTimeout(() => {
                    setIsConfirmBajaOpen(false);
                    setBajaStatus('idle');
                    setStudentToBaja(null);
                }, 2000);
            },
            onError: () => {
                setBajaStatus('error');
                setTimeout(() => {
                    setBajaStatus('idle');
                }, 2500);
            },
            onFinish: () => {
                setBajaStatus(current => {
                    if (current === 'saving') {
                        setTimeout(() => {
                            setBajaStatus('idle');
                        }, 3000);
                        return 'error';
                    }
                    return current;
                });
            }
        });
    };

    const openKardexModal = (student: any) => {
        setSelectedStudent(student);
        setIsKardexModalOpen(true);
    };

    return (
        <AdminPageLayout
            headTitle="Gestión de Alumnos"
            title={`Gestión de alumnos (${totalCount})`}
            subtitle="Consulta, edita y registra expedientes e inscripciones escolares"
            breadcrumb="Alumnos"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Alumnos totales", value: totalCount },
                { code: "T3", label: "Activos", value: activeCount },
                { code: "T4", label: "De baja", value: inactiveCount }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download },
                { label: "Estructurar grupos", onClick: () => router.visit('/admin/grupos'), icon: Layers },
                { label: "Ver reportes escolares", onClick: () => router.visit('/admin/reportes'), icon: FileText }
            ]}
            donutChartLabel="alumnos"
            donutChartSegments={[
                { name: "Activos", count: activeCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "De baja", count: inactiveCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls: Search and Actions */}
            <StudentTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                groups={groups}
                onOpenCreateModal={openCreateModal}
                showFiltersDropdown={showFiltersDropdown}
                setShowFiltersDropdown={setShowFiltersDropdown}
            />

            {/* Table */}
            <StudentTable
                students={filteredStudents}
                onOpenEditModal={openEditModal}
                onOpenBajaModal={(student) => {
                    setStudentToBaja(student);
                    setIsConfirmBajaOpen(true);
                }}
                onOpenKardexModal={openKardexModal}
            />

            {/* Modal: Add/Edit student */}
            <StudentFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        setIsFormModalOpen(false);
                    }
                }}
                mode={modalMode}
                student={selectedStudent}
                groups={groups}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleFormSubmit}
                saveStatus={saveStatus}
            />

            {/* Modal: Kardex View */}
            <StudentKardexModal
                isOpen={isKardexModalOpen}
                onClose={() => setIsKardexModalOpen(false)}
                student={selectedStudent}
                onDownloadKardex={(student) => {
                    triggerToast(`Descargando Kardex oficial de ${student.name}...`);
                }}
            />

            {/* Modal de confirmación de Baja / Alta */}
            <ConfirmActionModal
                isOpen={isConfirmBajaOpen}
                onClose={() => {
                    if (bajaStatus === 'idle') {
                        setIsConfirmBajaOpen(false);
                        setStudentToBaja(null);
                    }
                }}
                onConfirm={() => toggleStatus(studentToBaja)}
                title={studentToBaja?.status === 'active' ? "Suspender Alumno del Sistema" : "Reactivar Alumno en el Sistema"}
                description={
                    studentToBaja?.status === 'active'
                        ? `Esta acción cambiará el estado de la matrícula de ${studentToBaja?.name || 'este alumno'} a 'Baja' (inactivo) de forma inmediata.`
                        : `Esta acción reactivará la matrícula de ${studentToBaja?.name || 'este alumno'} a 'Activo' de forma inmediata.`
                }
                confirmText={studentToBaja?.matricula || ''}
                actionPhrase={studentToBaja?.status === 'active' ? "dar de baja" : "dar de alta"}
                warningMessage={
                    studentToBaja?.status === 'active'
                        ? "Al dar de baja al alumno, este perderá acceso completo al portal escolar de PrepaHid y sus expedientes se pausarán."
                        : "Al dar de alta al alumno, este recuperará su acceso completo al portal escolar y sus expedientes se reactivarán."
                }
                confirmLabel={studentToBaja?.status === 'active' ? "Dar de Baja" : "Dar de Alta"}
                confirmButtonVariant={studentToBaja?.status === 'active' ? 'danger' : 'primary'}
                saveStatus={bajaStatus}
                processingLabel={studentToBaja?.status === 'active' ? "Dando de baja al alumno..." : "Dando de alta al alumno..."}
                successLabel={studentToBaja?.status === 'active' ? "¡Alumno dado de baja!" : "¡Alumno reactivado!"}
            />
        </AdminPageLayout>
    );
}
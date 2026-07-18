import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Filter, Archive, Clock, Lock, Unlock, CheckCircle2 } from 'lucide-react';
import { ButtonLogin as Button } from '@/Components/ButtonLogin';
import { Input } from '@/Components/Input';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import AppTable from '@/Components/table/AppTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';
import QuickSummaryWidget, { MetricItem } from '@/Components/QuickSummaryWidget';
import { SwalHelper } from '@/utils/SwalHelper';
import { cycleService } from '@/services/cycleService';
import { TableActionButton } from '@/Components/TableActions';

interface Cycle {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export default function AdminDashboard() {
  const { auth, cycles = [], studentsCount, teachersCount, groupsCount, coursesCount } = usePage().props as any;
  const adminName = auth?.user?.nombre || 'Administrador';

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;
    mainEl.style.padding = '0';
    const handleResize = () => {
      if (window.innerWidth >= 1024) mainEl.style.overflow = 'hidden';
      else mainEl.style.overflow = 'auto';
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isCloseCycleModalOpen, setIsCloseCycleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const activeCycle = cycles.find((c: Cycle) => c.activo);

  const { data, setData, reset, processing, errors } = useForm({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
  });

  const handleSubmitPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    SwalHelper.loading('Abriendo ciclo escolar...', 'Configurando periodos y fechas');
    cycleService.store(data, {
      onSuccess: () => {
        setIsPeriodModalOpen(false);
        reset();
        SwalHelper.success('¡Operación Exitosa!', `El ${data.nombre} ha sido configurado correctamente.`);
      },
      onError: () => {
        SwalHelper.error('Error', 'Hubo un problema al crear el ciclo escolar.');
      }
    });
  };

  const handleCloseActiveCycle = () => {
    if (activeCycle) {
      SwalHelper.confirm(
        '¿Concluir Ciclo Escolar?',
        `Esta acción archivará el "${activeCycle.nombre}" y bloqueará nuevas calificaciones.`,
        'Sí, Concluir y Archivar',
        'Cancelar',
        'warning'
      ).then((result) => {
        if (result.isConfirmed) {
          SwalHelper.loading('Concluyendo ciclo...', 'Archivando expedientes históricos');
          cycleService.close(activeCycle.id, {
            onSuccess: () => {
              setIsCloseCycleModalOpen(false);
              SwalHelper.success('¡Ciclo Concluido!', 'El periodo ha sido archivado correctamente.');
            },
            onError: () => {
              SwalHelper.error('Error', 'No se pudo cerrar el ciclo escolar.');
            }
          });
        }
      });
    }
  };

  const handleActivateCycle = (id: number) => {
    SwalHelper.confirm(
      '¿Cambiar Ciclo Activo?',
      'Se cambiará el periodo vigente del sistema escolar.',
      'Sí, Cambiar',
      'No, Mantener actual'
    ).then((result) => {
      if (result.isConfirmed) {
        SwalHelper.loading('Cambiando ciclo...', 'Actualizando vigencia escolar');
        cycleService.activate(id, {
          onSuccess: () => {
            setIsHistoryModalOpen(false);
            SwalHelper.success('¡Ciclo Cambiado!', 'El sistema ahora opera bajo el nuevo periodo.');
          },
          onError: () => {
            SwalHelper.error('Error', 'No se pudo cambiar el ciclo escolar.');
          }
        });
      }
    });
  };

  const [activitiesList, setActivitiesList] = useState([
    { id: 1, action: "Alta de alumno", user: "Yisus Esquivel", time: "01/06/2025 - 11:30 AM" },
    { id: 2, action: "Alta de profesor", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 3, action: "Alta de grupo", user: "Yisus Esquivel", time: "01/06/2025 - 11:30 AM" },
    { id: 4, action: "Consulta de alumnos", user: "Yisus Esquivel", time: "01/06/2025 - 11:30 AM" },
  ]);

  const handleDeleteActivity = (id: number) => {
    setActivitiesList(prev => prev.filter(act => act.id !== id));
    SwalHelper.toast('Registro eliminado', 'info');
  };

  const metrics: MetricItem[] = [
    { code: "T1", label: "Alumnos", value: studentsCount !== undefined ? String(studentsCount) : "0" },
    { code: "T2", label: "Profesores", value: teachersCount !== undefined ? String(teachersCount) : "0" },
    { code: "T3", label: "Grupos", value: groupsCount !== undefined ? String(groupsCount) : "0" },
    { code: "T4", label: "Materias", value: coursesCount !== undefined ? String(coursesCount) : "0" }
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Inicio Administrador" />
      <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden font-body w-full">
        <div className="flex-1 p-6 md:p-8 space-y-6 lg:overflow-y-auto lg:h-full flex flex-col lg:min-h-0">
          <DashboardWelcomeBanner greeting={`Hola ${adminName}`} subtitle="Sistema de Control Escolar" wrapperClassName="pb-2" />
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-none flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 text-left font-body">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {activeCycle ? <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Activo</span> : <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Inactivo</span>}
                <span className="text-slate-200 font-normal">|</span>
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-300" /> Vigencia del Ciclo</span>
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">{activeCycle?.nombre || 'Ningún ciclo escolar seleccionado'}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {activeCycle ? <>Periodo académico: <strong className="text-slate-700 font-bold">{new Date(activeCycle.fecha_inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> al <strong className="text-slate-700 font-bold">{new Date(activeCycle.fecha_fin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></> : "Abre un nuevo ciclo para comenzar a inscribir alumnos."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto mt-2 xl:mt-0">
              <button onClick={() => setIsPeriodModalOpen(true)} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold h-10 px-4 rounded-xl text-[11.5px] transition-all shadow-none flex items-center gap-2 active:scale-[0.98]"><Unlock className="w-3.5 h-3.5 text-[#1e88e5]" /> Abrir Nuevo Ciclo</button>
              {activeCycle && <button onClick={() => setIsCloseCycleModalOpen(true)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold h-10 px-4 rounded-xl text-[11.5px] transition-all shadow-none flex items-center gap-2 active:scale-[0.98]"><Lock className="w-3.5 h-3.5" /> Concluir Ciclo</button>}
              <button onClick={() => setIsHistoryModalOpen(true)} className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold h-10 px-4 rounded-xl text-[11.5px] transition-all shadow-none flex items-center gap-2 active:scale-[0.98]"><Archive className="w-3.5 h-3.5 text-slate-400" /> Historial ({cycles.length})</button>
            </div>
          </div>
          <div className="lg:hidden pb-2"><QuickSummaryWidget metrics={metrics} /></div>
          <div className="bg-white rounded-2xl p-4 md:p-8 border border-slate-100 shadow-none flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-8"><h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Actividades recientes</h3><div className="h-px bg-slate-100 flex-1"></div></div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Buscar actividad" className="pl-10 h-11 bg-slate-50 border-none rounded-xl text-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#1e88e5]/20" /></div>
              <Button variant="outline" size="sm" className="gap-2 h-11 border-slate-100 text-slate-500 font-medium shadow-none hover:bg-blue-50 hover:text-[#1e88e5] rounded-xl w-full sm:w-auto"><Filter className="w-4 h-4" /> Ordenar por</Button>
            </div>
            <AppTable data={activitiesList} keyExtractor={(item) => item.id} className="flex-1 scrollbar-hide" columns={[{ header: "Actividad", accessor: (row) => row.action, className: "text-slate-500 text-sm" }, { header: "Usuario", accessor: "user", className: "text-slate-500 font-medium text-sm" }, { header: "Fecha y hora", accessor: "time", className: "text-slate-500 text-xs hidden md:table-cell" }, { header: "Acción", align: "center", accessor: (row) => (<TableActionButton onClick={() => handleDeleteActivity(row.id)} title="Eliminar Actividad" icon="delete" variant="danger" />) }]} />
          </div>
        </div>
        <div className="w-full lg:w-[340px] bg-white border-l-0 lg:border-l border-t lg:border-t-0 border-slate-150 p-6 lg:pt-8 lg:pb-12 lg:px-5 space-y-5 shrink-0 flex flex-col shadow-none lg:h-full lg:overflow-y-auto lg:justify-start">
          <div className="hidden lg:block"><QuickSummaryWidget metrics={metrics} /></div>
          <div className="space-y-3 font-body text-left">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none">Herramientas del ciclo</h4>
            <div className="space-y-3.5">
              <div className="bg-[#f0f2ff] hover:bg-[#e6e9ff] transition-colors py-8 px-6 rounded-2xl flex items-center justify-between gap-5 group">
                <div className="min-w-0"><p className="font-black text-slate-800 text-sm group-hover:text-[#1e88e5] leading-tight transition-colors">Asignación de grupos</p><p className="text-xs text-slate-555 font-bold mt-1.5">Distribución de alumnos y profesores</p></div>
                <Button className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-10 px-5 text-xs rounded-xl shrink-0 shadow-none">Iniciar</Button>
              </div>
              <div className="bg-[#f0f2ff] hover:bg-[#e6e9ff] transition-colors py-8 px-6 rounded-2xl flex items-center justify-between gap-5 group">
                <div className="min-w-0"><p className="font-black text-slate-800 text-sm group-hover:text-[#1e88e5] leading-tight transition-colors">Apertura de Nuevo Ciclo</p><p className="text-xs text-slate-555 font-bold mt-1.5">Configurar periodos y fechas clave</p></div>
                <Button onClick={() => setIsPeriodModalOpen(true)} className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-10 px-5 text-xs rounded-xl shrink-0 shadow-none">Iniciar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BaseModal isOpen={isPeriodModalOpen} onClose={() => { setIsPeriodModalOpen(false); reset(); }} title="Apertura de Nuevo Ciclo Escolar" subtitle="Configura el nombre del nuevo ciclo." confirmLabel={processing ? "Guardando..." : "Guardar"} onSubmit={handleSubmitPeriod} isConfirmDisabled={processing} maxWidthClass="max-w-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          <div className="col-span-2"><FormLabel required>Nombre del Ciclo Escolar</FormLabel><FormInput value={data.nombre} onChange={e => setData('nombre', e.target.value)} placeholder="Ej: Ciclo Escolar 2026-2" required />{errors.nombre && <span className="text-red-500 text-[10px] mt-1 block text-left">{errors.nombre}</span>}</div>
          <div><FormLabel required>Fecha de Inicio</FormLabel><FormInput type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} required />{errors.fecha_inicio && <span className="text-red-500 text-[10px] mt-1 block text-left">{errors.fecha_inicio}</span>}</div>
          <div><FormLabel required>Fecha de Término</FormLabel><FormInput type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} required />{errors.fecha_fin && <span className="text-red-500 text-[10px] mt-1 block text-left">{errors.fecha_fin}</span>}</div>
          <div className="col-span-2"><FormLabel>Estado Inicial del Ciclo</FormLabel><FormSelect value={data.activo ? '1' : '0'} onChange={e => setData('activo', e.target.value === '1')}><option value="1">Activo (Vigente)</option><option value="0">Inactivo (Planificación)</option></FormSelect></div>
        </div>
      </BaseModal>
      <BaseModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Historial de Ciclos Escolares" subtitle="Administra los ciclos académicos." cancelLabel="Cerrar" maxWidthClass="max-w-xl">
        <div className="space-y-3.5 mt-4 text-left font-body">
          {cycles.map((c: Cycle) => (
            <div key={c.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${c.activo ? 'border-blue-150 bg-blue-50/20' : 'border-slate-100 bg-slate-50/30'}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2"><h4 className="font-bold text-slate-800 text-sm">{c.nombre}</h4>{c.activo ? <span className="text-[8.5px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">Activo</span> : <span className="text-[8.5px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Archivado</span>}</div>
                <p className="text-[11px] text-slate-550 font-semibold">Inicio: {new Date(c.fecha_inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} | Fin: {new Date(c.fecha_fin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              {!c.activo && <button onClick={() => handleActivateCycle(c.id)} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold h-8 px-3 rounded-lg text-xs transition-all flex items-center gap-1.5 active:scale-[0.98]"><CheckCircle2 className="w-3.5 h-3.5 text-[#1e88e5]" /> Activar</button>}
            </div>
          ))}
        </div>
      </BaseModal>
    </AuthenticatedLayout>
  );
}

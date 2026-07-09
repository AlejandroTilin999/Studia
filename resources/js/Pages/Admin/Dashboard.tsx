import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Filter, Check, Calendar, Archive, Clock, Lock, Unlock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { ButtonLogin as Button } from '@/Components/ButtonLogin';
import { Input } from '@/Components/Input';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import AppTable from '@/Components/AppTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';
import ConfirmActionModal from '@/Components/ConfirmActionModal';
import QuickSummaryWidget, { MetricItem } from '@/Components/QuickSummaryWidget';
import { useToast } from '@/hooks/useToast';
import { cycleService } from '@/services/cycleService';

interface Cycle {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function AdminDashboard() {
  const { auth, cycles = [], studentsCount, teachersCount, groupsCount, coursesCount } = usePage().props as any;
  const adminName = auth?.user?.name || 'Administrador';
  
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const originalOverflow = mainEl.style.overflow;
    const originalPadding = mainEl.style.padding;

    mainEl.style.padding = '0';

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        mainEl.style.overflow = 'hidden';
      } else {
        mainEl.style.overflow = originalOverflow || 'auto';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      mainEl.style.overflow = originalOverflow;
      mainEl.style.padding = originalPadding;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isCloseCycleModalOpen, setIsCloseCycleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const activeCycle = cycles.find((c: Cycle) => c.is_active);

  const { toastMessage, triggerToast } = useToast();

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const handleSubmitPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    cycleService.store(data, {
      onSuccess: () => {
        setIsPeriodModalOpen(false);
        reset();
        triggerToast(`¡${data.name} creado y configurado con éxito!`);
      },
      onError: () => {
        triggerToast("Hubo un problema al crear el ciclo escolar.");
      }
    });
  };

  const handleCloseActiveCycle = () => {
    if (activeCycle) {
      cycleService.close(activeCycle.id, {
        onSuccess: () => {
          setIsCloseCycleModalOpen(false);
          triggerToast(`¡${activeCycle.name} concluido y archivado correctamente!`);
        },
        onError: () => {
          triggerToast("Hubo un problema al concluir el ciclo escolar.");
        }
      });
    }
  };

  const handleActivateCycle = (id: number) => {
    cycleService.activate(id, {
      onSuccess: () => {
        setIsHistoryModalOpen(false);
        triggerToast("Ciclo escolar cambiado correctamente.");
      },
      onError: () => {
        triggerToast("Hubo un problema al cambiar el ciclo escolar.");
      }
    });
  };

  const [activitiesList, setActivitiesList] = useState([
    { id: 1, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 2, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 3, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 4, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 5, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 6, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 7, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 8, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
  ]);

  const handleDeleteActivity = (id: number) => {
    setActivitiesList(prev => prev.filter(act => act.id !== id));
    triggerToast("Registro de actividad eliminado correctamente.");
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

      <div className="flex flex-col lg:flex-row bg-[#f9fafb] lg:h-[calc(100vh-64px)] lg:overflow-hidden font-body">
        {/* Columna Principal */}
        <div className="flex-1 p-3.5 md:p-6 space-y-6 lg:overflow-y-auto lg:h-full flex flex-col lg:min-h-0">
          {/* Banner de Bienvenida */}
          <DashboardWelcomeBanner
            greeting={`Hola ${adminName}`}
            subtitle="Sistema de Control Escolar"
            wrapperClassName="pb-2"
          />

          {/* Tarjeta de Control del Ciclo Escolar */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-none flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 text-left font-body">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {activeCycle ? (
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                    Activo
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                    Inactivo
                  </span>
                )}
                <span className="text-slate-200 font-normal">|</span>
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  Vigencia del Ciclo
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {activeCycle?.name || 'Ningún ciclo escolar seleccionado'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {activeCycle ? (
                  <>
                    Periodo académico: <strong className="text-slate-700 font-bold">{new Date(activeCycle.start_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> al <strong className="text-slate-700 font-bold">{new Date(activeCycle.end_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  </>
                ) : (
                  "Abre un nuevo ciclo para comenzar a inscribir alumnos y asignar docentes."
                )}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto mt-2 xl:mt-0">
              <button
                onClick={() => setIsPeriodModalOpen(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold h-10 px-4 rounded-xl text-[11.5px] transition-all shadow-none flex items-center gap-2 active:scale-[0.98]"
              >
                <Unlock className="w-3.5 h-3.5 text-[#1e88e5]" />
                Abrir Nuevo Ciclo
              </button>
              
              {activeCycle && (
                <button
                  onClick={() => setIsCloseCycleModalOpen(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold h-10 px-4 rounded-xl text-[11.5px] transition-all shadow-none flex items-center gap-2 active:scale-[0.98]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Concluir Ciclo
                </button>
              )}
              
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold h-10 px-4 rounded-xl text-[11.5px] transition-all shadow-none flex items-center gap-2 active:scale-[0.98]"
              >
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                Historial ({cycles.length})
              </button>
            </div>
          </div>

          {/* Resumen Rápido (Solo Móvil) */}
          <div className="lg:hidden pb-2">
            <QuickSummaryWidget metrics={metrics} />
          </div>

          {/* Sección de Actividades */}
          <div className="bg-white rounded-2xl md:rounded-2xl p-4 md:p-8 border border-slate-100 shadow-none flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap animate-none">
                Actividades recientes
              </h3>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar actividad"
                  className="pl-10 h-11 bg-slate-50 border-none rounded-xl text-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#1e88e5]/20 transition-all"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2 h-11 border-slate-100 text-slate-500 font-medium shadow-none hover:bg-blue-50 hover:text-[#1e88e5] hover:border-blue-100 rounded-xl w-full sm:w-auto transition-all">
                <Filter className="w-4 h-4" />
                Ordenar por
              </Button>
            </div>

            <AppTable
              data={activitiesList}
              keyExtractor={(item) => item.id}
              className="flex-1 scrollbar-hide"
              columns={[
                {
                  header: "Actividad",
                  accessor: (row) => row.action,
                  className: "text-slate-655 font-semibold text-sm",
                },
                {
                  header: "Usuario",
                  accessor: "user",
                  className: "text-slate-500 font-medium text-sm",
                },
                {
                  header: "Fecha y hora",
                  accessor: "time",
                  className: "text-slate-400 font-medium text-xs hidden md:table-cell",
                  headerClassName: "hidden md:table-cell",
                },
                {
                  header: "Acción",
                  align: "right",
                  accessor: (row) => (
                    <Button 
                      size="sm" 
                      onClick={() => handleDeleteActivity(row.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg px-4 md:px-6 h-8 md:h-9 text-[10px] md:text-xs transition-all shadow-none border-none"
                    >
                      Eliminar
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </div>

        {/* Barra Lateral Derecha */}
        <div className="w-full lg:w-[340px] bg-white border-l-0 lg:border-l border-t lg:border-t-0 border-slate-100 p-5 lg:p-6 xl:p-8 space-y-5 lg:space-y-8 xl:space-y-12 shrink-0 flex flex-col shadow-none lg:h-full lg:overflow-y-auto lg:justify-start">
          {/* Resumen Rápido (Solo Desktop) */}
          <div className="hidden lg:block">
            <QuickSummaryWidget metrics={metrics} />
          </div>

          {/* Sección de herramientas */}
          <div className="space-y-3 lg:space-y-5 lg:pt-0 font-body text-left">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none leading-none">
              Herramientas del ciclo
            </h4>

            <div className="space-y-3.5 lg:space-y-5">
              {/* Tarjeta 1 */}
              <div className="bg-[#f0f2ff] hover:bg-[#e6e9ff] transition-colors py-8 px-6 rounded-2xl flex items-center justify-between gap-5 group">
                <div className="min-w-0">
                  <p className="font-black text-slate-800 text-sm group-hover:text-[#1e88e5] transition-colors leading-tight">
                    Asignación de grupos y aulas
                  </p>
                  <p className="text-xs text-slate-555 font-bold mt-1.5">
                    Distribución de alumnos y profesores
                  </p>
                </div>
                <Button className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-10 px-5 text-xs rounded-xl shrink-0 transition-all shadow-none">
                  Iniciar
                </Button>
              </div>

              {/* Tarjeta 2 */}
              <div className="bg-[#f0f2ff] hover:bg-[#e6e9ff] transition-colors py-8 px-6 rounded-2xl flex items-center justify-between gap-5 group">
                <div className="min-w-0">
                  <p className="font-black text-slate-800 text-sm group-hover:text-[#1e88e5] transition-colors leading-tight">
                    Apertura de Nuevo Ciclo
                  </p>
                  <p className="text-xs text-slate-555 font-bold mt-1.5">
                    Configurar periodos de evaluación y fechas clave
                  </p>
                </div>
                <Button
                  onClick={() => setIsPeriodModalOpen(true)}
                  className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-10 px-5 text-xs rounded-xl shrink-0 transition-all shadow-none"
                >
                  Iniciar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alerta */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#1e88e5] p-1 rounded-full text-white">
            <Check size={12} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal de Apertura de Nuevo Ciclo */}
      <BaseModal
        isOpen={isPeriodModalOpen}
        onClose={() => {
          setIsPeriodModalOpen(false);
          reset();
        }}
        title="Apertura de Nuevo Ciclo Escolar"
        subtitle="Configura el nombre del nuevo ciclo, rango de fechas y su estado inicial."
        confirmLabel={processing ? "Guardando..." : "Guardar"}
        onSubmit={handleSubmitPeriod}
        isConfirmDisabled={processing}
        maxWidthClass="max-w-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          <div className="col-span-2">
            <FormLabel required>Nombre del Ciclo Escolar</FormLabel>
            <FormInput
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              placeholder="Ej: Ciclo Escolar 2026-2"
              required
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block text-left">{errors.name}</span>}
          </div>

          <div>
            <FormLabel required>Fecha de Inicio</FormLabel>
            <FormInput
              type="date"
              value={data.start_date}
              onChange={e => setData('start_date', e.target.value)}
              required
            />
            {errors.start_date && <span className="text-red-500 text-[10px] mt-1 block text-left">{errors.start_date}</span>}
          </div>

          <div>
            <FormLabel required>Fecha de Término</FormLabel>
            <FormInput
              type="date"
              value={data.end_date}
              onChange={e => setData('end_date', e.target.value)}
              required
            />
            {errors.end_date && <span className="text-red-500 text-[10px] mt-1 block text-left">{errors.end_date}</span>}
          </div>

          <div className="col-span-2">
            <FormLabel>Estado Inicial del Ciclo</FormLabel>
            <FormSelect
              value={data.is_active ? '1' : '0'}
              onChange={e => setData('is_active', e.target.value === '1')}
            >
              <option value="1">Activo (Establecer como ciclo vigente predeterminado)</option>
              <option value="0">Inactivo (Planificación / Borrador)</option>
            </FormSelect>
            {errors.is_active && <span className="text-red-500 text-[10px] mt-1 block text-left">{errors.is_active}</span>}
          </div>
        </div>
      </BaseModal>

      {/* Modal de Historial de Ciclos */}
      <BaseModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Historial de Ciclos Escolares"
        subtitle="Administra y consulta los ciclos académicos pasados y planificados."
        cancelLabel="Cerrar"
        maxWidthClass="max-w-xl"
      >
        <div className="space-y-3.5 mt-4 text-left font-body">
          {cycles.map((c: Cycle) => (
            <div 
              key={c.id} 
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                c.is_active 
                  ? 'border-blue-150 bg-blue-50/20' 
                  : 'border-slate-100 bg-slate-50/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                  {c.is_active ? (
                    <span className="text-[8.5px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
                      Activo
                    </span>
                  ) : (
                    <span className="text-[8.5px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      Archivado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-550 font-semibold">
                  Inicio: {new Date(c.start_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} | Fin: {new Date(c.end_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {!c.is_active && (
                <button
                  onClick={() => handleActivateCycle(c.id)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold h-8 px-3 rounded-lg text-xs transition-all flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1e88e5]" />
                  Activar
                </button>
              )}
            </div>
          ))}
        </div>
      </BaseModal>

      {/* Modal de Confirmar Conclusión de Ciclo */}
      <ConfirmActionModal
        isOpen={isCloseCycleModalOpen}
        onClose={() => setIsCloseCycleModalOpen(false)}
        onConfirm={handleCloseActiveCycle}
        title="Concluir Ciclo Escolar Activo"
        description={`Esta acción dará por finalizado el "${activeCycle?.name || ''}". Las asignaciones y calificaciones quedarán bloqueadas de forma permanente.`}
        confirmText={activeCycle?.name || ''}
        actionPhrase="concluir ciclo"
        warningMessage="¡Atención! Una vez concluido el ciclo, los profesores no podrán ingresar nuevas calificaciones ni modificar las existentes."
        confirmLabel="Concluir y Archivar"
      />
    </AuthenticatedLayout>
  );
}

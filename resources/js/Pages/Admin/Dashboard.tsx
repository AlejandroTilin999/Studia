import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Search, Filter, Check } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { ButtonLogin as Button } from '@/Components/ButtonLogin';
import { Input } from '@/Components/Input';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import AppTable from '@/Components/AppTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput, FormSelect } from '@/Components/FormFields';

export default function AdminDashboard() {
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      const originalOverflow = mainEl.style.overflow;
      const originalPadding = mainEl.style.padding;
      
      mainEl.style.padding = '0';
      if (window.innerWidth >= 1024) {
        mainEl.style.overflow = 'hidden';
      }
      
      return () => {
        mainEl.style.overflow = originalOverflow;
        mainEl.style.padding = originalPadding;
      };
    }
  }, []);

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const handleSubmitPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('academic.periods.store'), {
      onSuccess: () => {
        setIsPeriodModalOpen(false);
        reset();
        triggerToast("¡Ciclo escolar configurado y guardado correctamente!");
      },
      onError: () => {
        triggerToast("Ocurrió un error al configurar el ciclo escolar. Verifica los campos.");
      }
    });
  };
  const activities = [
    { id: 1, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 2, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 3, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 4, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 5, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 6, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 7, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
    { id: 8, action: "Subió calificaciones", user: "Uriel Cambrón", time: "01/06/2025 - 11:30 AM" },
  ];

  const QuickSummary = () => (
    <div className="space-y-3 font-body">
      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none text-left">Resumen rápido</h4>
      <div className="grid grid-cols-2 gap-2.5">
        <StatSmallCard label="Alumnos" value="300" code="T1" />
        <StatSmallCard label="Profesores" value="20" code="T2" />
        <StatSmallCard label="Grupos" value="15" code="T3" />
        <StatSmallCard label="Materias" value="17" code="T4" />
      </div>
    </div>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Inicio Administrador" />

      <div className="flex flex-col lg:flex-row bg-[#f9fafb] lg:h-[calc(100vh-64px)] lg:overflow-hidden font-body">
        {/* Columna Principal */}
        <div className="flex-1 p-3.5 md:p-6 space-y-6 lg:overflow-y-auto lg:h-full flex flex-col lg:min-h-0">
          {/* Banner de Bienvenida */}
          <DashboardWelcomeBanner
            greeting={`Hola `}
            subtitle="Sistema de Control Escolar"
            wrapperClassName="pt-0 md:pt-10 pb-6 md:pb-10"
          />

          {/* Resumen Rápido (Solo Móvil) */}
          <div className="lg:hidden pb-2">
            <QuickSummary />
          </div>

          {/* Sección de Actividades */}
          <div className="bg-white rounded-2xl md:rounded-2xl p-4 md:p-8 border border-slate-100 shadow-none">
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
              data={activities}
              keyExtractor={(item) => item.id}
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
                  accessor: () => (
                    <Button size="sm" className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold rounded-lg px-4 md:px-6 h-8 md:h-9 text-[10px] md:text-xs transition-all shadow-none">
                      Editar
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </div>

        {/* Barra Lateral Derecha */}
        <div className="w-full lg:w-[340px] bg-white border-l-0 lg:border-l border-t lg:border-t-0 border-slate-100 p-5 space-y-5 shrink-0 flex flex-col shadow-none lg:h-full lg:overflow-hidden">
          {/* Resumen Rápido (Solo Desktop) */}
          <div className="hidden lg:block">
            <QuickSummary />
          </div>

          {/* Sección de herramientas */}
          <div className="space-y-3 lg:pt-0 font-body text-left">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none leading-none">
              Herramientas del ciclo
            </h4>

            <div className="space-y-3.5">
              {/* Tarjeta 1 */}
              <div className="bg-[#f0f2ff] hover:bg-[#e6e9ff] transition-colors p-6 rounded-2xl flex items-center justify-between gap-5 group">
                <div className="min-w-0">
                  <p className="font-black text-slate-800 text-sm group-hover:text-[#1e88e5] transition-colors leading-tight">
                    Asignación de grupos y aulas
                  </p>
                  <p className="text-xs text-slate-500 font-bold mt-1.5">
                    Distribución de alumnos y profesores
                  </p>
                </div>
                <Button className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-10 px-5 text-xs rounded-xl shrink-0 transition-all shadow-none">
                  Iniciar
                </Button>
              </div>

              {/* Tarjeta 2 */}
              <div className="bg-[#f0f2ff] hover:bg-[#e6e9ff] transition-colors p-6 rounded-2xl flex items-center justify-between gap-5 group">
                <div className="min-w-0">
                  <p className="font-black text-slate-800 text-sm group-hover:text-[#1e88e5] transition-colors leading-tight">
                    Apertura de Nuevo Ciclo
                  </p>
                  <p className="text-xs text-slate-500 font-bold mt-1.5">
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
    </AuthenticatedLayout>
  );
}

function StatSmallCard({ label, value, code }: { label: string, value: string, code: string }) {
  return (
    <Card className="border border-slate-50 shadow-none rounded-xl overflow-hidden bg-white group hover:bg-blue-50/50 hover:border-blue-100 transition-all duration-200 cursor-default">
      <CardContent className="p-4 md:p-5 flex flex-col gap-1">
        <span className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-blue-300 transition-colors">{code}</span>
        <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase leading-none mt-1 group-hover:text-[#1e88e5] transition-colors">{label}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-800 mt-2 tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

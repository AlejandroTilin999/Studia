import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { ButtonLogin as Button } from '@/Components/ButtonLogin';
import { Input } from '@/Components/Input';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import AppTable from '@/Components/AppTable';

export default function AdminDashboard() {
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
    <div className="space-y-4">
      <h4 className="font-bold text-slate-700 text-sm tracking-tight">Resumen rápido</h4>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
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

      <div className="flex flex-col lg:flex-row bg-[#f9fafb] min-h-screen font-body -m-6 md:-m-8">
        {/* Columna Principal */}
        <div className="flex-1 p-6 space-y-6">
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
          <div className="bg-white rounded-none md:rounded-2xl p-6 md:p-8 border-none shadow-none">
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
                  className: "text-slate-650 font-semibold text-sm",
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
        <div className="w-full lg:w-[340px] bg-white border-l-0 lg:border-l border-t lg:border-t-0 border-slate-100 p-6 md:p-8 space-y-8 shrink-0 flex flex-col shadow-none lg:self-start lg:sticky lg:top-0 h-auto">
          {/* Resumen Rápido (Solo Desktop) */}
          <div className="hidden lg:block">
            <QuickSummary />
          </div>

          {/* Sección de herramientas */}
          <div className="space-y-6 lg:pt-0">
            <h4 className="font-bold text-slate-800 text-sm leading-tight tracking-tight">
              Herramientas de configuración del ciclo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Tarjeta 1 */}
              <div className="bg-[#f0f2ff] hover:bg-[#e6e9ff] transition-colors p-5 md:p-6 rounded-2xl border-none space-y-4 flex flex-col justify-between group">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm md:text-[15px] leading-tight group-hover:text-[#1e88e5] transition-colors">
                    Asignación de grupos y aulas
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                    Distribución de alumnos y profesores
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 md:h-9 px-4 text-[10px] md:text-xs rounded-lg transition-all shadow-none">
                    Iniciar config
                  </Button>
                </div>
              </div>

              {/* Tarjeta 2 */}
              <div className="bg-[#f0f2ff] hover:bg-[#e6e9ff] transition-colors p-5 md:p-6 rounded-2xl border-none space-y-4 flex flex-col justify-between group">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm md:text-[15px] leading-tight group-hover:text-[#1e88e5] transition-colors">
                    Apertura de Nuevo Ciclo
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                    Configurar periodos de evaluación y fechas clave
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 md:h-9 px-4 text-[10px] md:text-xs rounded-lg transition-all shadow-none">
                    Iniciar config
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

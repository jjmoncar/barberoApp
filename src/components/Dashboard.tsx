import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Cpu, 
  ArrowRight,
  Sparkles,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { AppState } from '../lib/useAppContext';
import { translations } from '../lib/translations';

interface DashboardProps {
  state: AppState;
}

export default function Dashboard({ state }: DashboardProps) {
  const { 
    config, 
    clients, 
    products, 
    appointments, 
    expenses, 
    setCurrentView,
    language
  } = state;

  const t = translations[language].dashboard;

  // Calculate stats
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedDate = new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const todayAppointments = appointments.filter(a => a.date === todayStr);

  const totalAppointmentsToday = todayAppointments.filter(a => a.status !== 'cancelled').length;
  const completedToday = todayAppointments.filter(a => a.status === 'completed').length;
  const pendingToday = todayAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;

  const estimatedRevenueToday = todayAppointments
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + a.price, 0);

  const completedRevenueToday = todayAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0);

  const occupationPercent = totalAppointmentsToday > 0 
    ? Math.min(100, Math.round((totalAppointmentsToday / 10) * 100)) 
    : 0;

  const newClientsCount = clients.filter(c => c.tier === 'Nuevo' || c.visitsCount <= 1).length;

  // Critical stock products (stock <= minStock)
  const criticalStockProducts = products.filter(p => p.stock <= p.minStock);

  // Hardcoded financial chart data (weekly trend)
  const chartData = [
    { name: language === 'es' ? 'Lun' : 'Seg', ingresos: 1200, gastos: 400 },
    { name: language === 'es' ? 'Mar' : 'Ter', ingresos: 1850, gastos: 600 },
    { name: language === 'es' ? 'Mié' : 'Qua', ingresos: 2400, gastos: 800 },
    { name: language === 'es' ? 'Jue' : 'Qui', ingresos: 3100, gastos: 500 },
    { name: language === 'es' ? 'Vie' : 'Sex', ingresos: 4800, gastos: 1200 },
    { name: language === 'es' ? 'Sáb' : 'Sáb', ingresos: 5900, gastos: 1500 },
    { name: language === 'es' ? 'Dom' : 'Dom', ingresos: 0, gastos: 300 }
  ];

  const totalWeeklyRevenue = chartData.reduce((sum, item) => sum + item.ingresos, 0);
  const totalWeeklyExpenses = chartData.reduce((sum, item) => sum + item.gastos, 0) + expenses.reduce((sum, e) => sum + e.amount, 0) / 4; // amortized
  const netProfit = totalWeeklyRevenue - totalWeeklyExpenses;

  return (
    <div className="space-y-6">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-gold font-mono tracking-widest uppercase text-xs font-bold">
            {language === 'es' ? 'Resumen de Negocio' : 'Resumo do Negócio'}
          </span>
          <h2 className="font-display text-4xl text-white">{t.title}</h2>
          <p className="text-gray-400 text-sm">
            {language === 'es' 
              ? 'Bienvenido de nuevo, Propietario. Estas son las métricas de rentabilidad y operación de hoy.' 
              : 'Bem-vindo de volta, Proprietário. Estas são as métricas de faturamento e operação de hoje.'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-light px-4 py-2 rounded-xl border border-surface-border">
          <Calendar className="text-gold w-4 h-4" />
          <span className="font-mono text-sm text-gray-300">{formattedDate}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-light p-5 rounded-2xl border-t-2 border-gold shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-gold/10 rounded-xl text-gold">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
              ${completedRevenueToday.toFixed(2)} {t.revenueSub}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t.estimatedRevenue}</p>
            <h3 className="font-display text-3xl text-white mt-1">${estimatedRevenueToday.toFixed(2)}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-light p-5 rounded-2xl border-t-2 border-gray-600 shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-gray-500/10 rounded-xl text-gray-400">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
              {completedToday} {language === 'es' ? 'completas' : 'concluídos'}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t.todayAppointments}</p>
            <h3 className="font-display text-3xl text-white mt-1">
              {totalAppointmentsToday} {totalAppointmentsToday === 1 
                ? (language === 'es' ? 'cita' : 'agendamento') 
                : (language === 'es' ? 'citas' : 'agendamentos')}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">{pendingToday} {t.todayAppointmentsSub}</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-light p-5 rounded-2xl border-t-2 border-gold shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-gold/10 rounded-xl text-gold">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
              {occupationPercent > 75 
                ? (language === 'es' ? 'Muy Alta' : 'Muito Alta') 
                : occupationPercent > 40 
                  ? (language === 'es' ? 'Media' : 'Média') 
                  : (language === 'es' ? 'Baja' : 'Baixa')}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t.occupation}</p>
            <h3 className="font-display text-3xl text-white mt-1">{occupationPercent}%</h3>
            <p className="text-[10px] text-gray-400 mt-1">{totalAppointmentsToday} / 10 {t.occupationSub}</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-light p-5 rounded-2xl border-t-2 border-gray-600 shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-gray-500/10 rounded-xl text-gray-400">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
              {clients.length} {language === 'es' ? 'totales en CRM' : 'totais no CRM'}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t.newClients}</p>
            <h3 className="font-display text-3xl text-white mt-1">{newClientsCount}</h3>
            <p className="text-[10px] text-gray-400 mt-1">{t.newClientsSub}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Chart & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-surface-light p-5 rounded-2xl border border-surface-border">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-display text-xl text-white flex items-center gap-2">
              <BarChart2 className="text-gold w-5 h-5" />
              {t.weeklyTrend}
            </h4>
            <span className="text-xs text-gray-400">{t.weeklyTrendRange}</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#c9a84c' }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#c9a84c" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" name={language === 'es' ? 'Ingresos ($)' : 'Faturamento (R$)'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Box & Mini Quick action */}
        <div className="flex flex-col gap-6">
          {/* AI Advisor Box */}
          <div className="bg-surface-light p-5 rounded-2xl border border-gold/20 relative overflow-hidden gold-glow">
            <div className="scan-line opacity-30"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h4 className="font-display text-xl text-gold flex items-center gap-2">
                <Cpu className="text-gold w-5 h-5 animate-pulse" />
                {t.aiAdvisor}
              </h4>
              <span className="text-[9px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold animate-pulse">
                {t.aiAdvisorAnalyzing}
              </span>
            </div>
            <p className="text-gray-300 text-sm italic leading-relaxed mb-4 relative z-10">
              {t.aiAdvisorText}
            </p>
            <button 
              onClick={() => alert(language === 'es' ? "Sugerencia aplicada. Se ha enviado una notificación push al barbero de guardia." : "Sugestão aplicada. Uma notificação push foi enviada ao barbeiro de plantão.")}
              className="w-full py-2 border border-gold text-gold hover:bg-gold hover:text-black font-semibold rounded-xl text-xs tracking-wider uppercase transition-all relative z-10 cursor-pointer"
            >
              {t.aiApply}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="bg-surface-light p-5 rounded-2xl border border-surface-border flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-display text-lg text-white mb-2">{t.financialSummary}</h4>
              <p className="text-gray-400 text-xs mb-4">{t.financialSummarySub}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t.totalWeeklyRevenue}</span>
                <span className="text-white font-mono font-semibold">${totalWeeklyRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t.totalWeeklyExpenses}</span>
                <span className="text-red-400 font-mono font-semibold">-${totalWeeklyExpenses.toFixed(2)}</span>
              </div>
              <hr className="border-white/10" />
              <div className="flex justify-between text-sm">
                <span className="text-gold font-bold">{t.netProfit}</span>
                <span className="text-green-400 font-mono font-bold">${netProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Critical Stock & Next Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Stock Alerts */}
        <div className="bg-surface-light p-5 rounded-2xl border border-surface-border flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-display text-xl text-white flex items-center gap-2">
                <AlertTriangle className="text-red-400 w-5 h-5" />
                {t.criticalStock}
              </h4>
              <button 
                onClick={() => setCurrentView('inventario')}
                className="text-gold text-xs font-semibold hover:underline flex items-center gap-1"
              >
                {t.seeAll} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {criticalStockProducts.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  {t.criticalStockSub}
                </div>
              ) : (
                criticalStockProducts.map(p => (
                  <div key={p.id} className="bg-surface-dark p-3 rounded-xl border-l-4 border-red-500 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">{p.name}</p>
                      <p className="text-gray-400 text-[10px] uppercase font-mono">{p.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold text-sm">{p.stock} {t.stockUnits}</p>
                      <p className="text-gray-400 text-[10px]">{t.stockMin}: {p.minStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <button 
              onClick={() => setCurrentView('inventario')}
              className="w-full text-center py-2 bg-surface-dark hover:bg-white/5 border border-surface-border text-gray-300 rounded-xl text-xs font-semibold transition-all"
            >
              {t.restockBtn}
            </button>
          </div>
        </div>

        {/* Next Appointments Timeline */}
        <div className="lg:col-span-2 bg-surface-light p-5 rounded-2xl border border-surface-border">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-display text-xl text-white flex items-center gap-2">
              <Calendar className="text-gold w-5 h-5" />
              {t.nextAppointments}
            </h4>
            <button 
              onClick={() => setCurrentView('agenda')}
              className="text-gold text-xs font-semibold hover:underline flex items-center gap-1"
            >
              {language === 'es' ? 'Abrir Agenda Completa' : 'Abrir Agenda Completa'} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                {t.nextAppointmentsSub}
              </div>
            ) : (
              appointments.slice(0, 3).map((appt, idx) => (
                <div key={appt.id} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ring-4 ${idx === 0 ? 'bg-gold ring-gold/20' : 'bg-gray-600 ring-white/5'}`}></div>
                    {idx !== 2 && <div className="w-0.5 h-12 bg-white/10 mt-1"></div>}
                  </div>
                  <div className="flex-1 bg-surface-dark p-3 rounded-xl border border-surface-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold/20 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gold font-mono font-bold text-sm">{appt.timeSlot}</span>
                        <span className="text-xs text-gray-400">| {appt.clientName}</span>
                      </div>
                      <p className="text-white text-xs font-semibold">{appt.serviceName}</p>
                      <p className="text-[10px] text-gray-400">{t.assignedTo}: {appt.barberId === 'b1' ? 'Alex Rivera' : appt.barberId === 'b2' ? 'Mateo Costa' : appt.barberId === 'b3' ? 'Sofía Luna' : 'Carlos Vera'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gold font-mono font-bold text-sm">${appt.price.toFixed(2)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        appt.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                        appt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {appt.status === 'confirmed' ? t.statusConfirmed : appt.status === 'pending' ? t.statusPending : t.statusCompleted}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export type DashboardPropsType = DashboardProps;
export type DashboardType = React.ComponentType<DashboardProps>;
export const DashboardComponent = Dashboard;

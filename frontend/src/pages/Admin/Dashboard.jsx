import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Scissors, DollarSign, Clock, Calendar, BarChart2, Star } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';
import { getTier } from '../../utils/loyalty';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusStyle = {
  completed: { label: 'Concluído', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  pending:   { label: 'Pendente',  color: '#cba052', bg: 'rgba(203,160,82,0.12)' },
  confirmed: { label: 'Confirmado',color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  cancelled: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  blocked:   { label: 'Bloqueado', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

// Simple bar component (no external chart lib needed)
const Bar = ({ pct, color = 'var(--color-barber-gold)', label, sublabel }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs w-16 shrink-0 text-right" style={{ color: 'var(--color-barber-gray)' }}>{label}</span>
    <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-barber-light)' }}>
      <div className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
        style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }}>
        {pct > 20 && <span className="text-xs font-bold text-black">{sublabel}</span>}
      </div>
    </div>
    {pct <= 20 && <span className="text-xs font-bold w-6" style={{ color }}>{sublabel}</span>}
  </div>
);

const Dashboard = () => {
  const { data: d = {}, isLoading: loading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (loading) return (
    <AdminSidebar>
      <div className="text-center py-20" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
    </AdminSidebar>
  );

  const summaryCards = [
    { label: 'Cortes Hoje',       value: d.cutsToday ?? '—',    icon: Scissors,   color: '#cba052' },
    { label: 'Faturamento Hoje',  value: fmt(d.revenueToday),    icon: DollarSign, color: '#22c55e' },
    { label: 'Novos Clientes',    value: d.newClients ?? '—',    icon: Users,      color: '#60a5fa' },
    { label: 'Ticket Médio',      value: fmt(d.ticketMedio),     icon: TrendingUp, color: '#a78bfa' },
  ];

  return (
    <AdminSidebar>
      <div className="animate-in fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
          </div>
          <Link to="/admin/cashier" className="btn-primary text-sm">Ver Caixa</Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(c => (
            <div key={c.label} className="card" style={{ borderLeft: `3px solid ${c.color}` }}>
              <div className="flex items-center gap-2 mb-2">
                <c.icon size={16} style={{ color: c.color }} />
                <p className="text-xs font-medium" style={{ color: 'var(--color-barber-gray)' }}>{c.label}</p>
              </div>
              <p className="text-2xl font-display font-bold" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Movimento por Dia da Semana */}
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--color-barber-gray)' }}>
              <Calendar size={14} /> Dia Mais Movimentado
            </h2>
            {d.busiestDay && (
              <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--color-barber-gold)' }}>
                🏆 {d.busiestDay}
              </p>
            )}
            <div className="space-y-2">
              {(d.weekdayData || []).map(item => (
                <Bar key={item.day} label={item.day.substring(0, 3)} sublabel={item.count} pct={item.pct} />
              ))}
            </div>
          </div>

          {/* Horário mais cheio */}
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--color-barber-gray)' }}>
              <Clock size={14} /> Horário Mais Cheio
            </h2>
            {d.busiestHour && (
              <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--color-barber-gold)' }}>
                🏆 {d.busiestHour}
              </p>
            )}
            <div className="space-y-2">
              {(d.hourData || []).map(item => (
                <Bar key={item.h} label={item.h} sublabel={item.count} pct={item.pct} color="#818cf8" />
              ))}
            </div>
          </div>

          {/* Serviço Mais Vendido */}
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--color-barber-gray)' }}>
              <BarChart2 size={14} /> Serviços Mais Vendidos
            </h2>
            {d.serviceData?.length > 0 ? (
              <div className="space-y-2">
                {d.serviceData.map((svc, i) => (
                  <Bar key={svc.name} label={svc.name.substring(0, 10)} sublabel={svc.count}
                    pct={svc.pct} color={i === 0 ? '#d4af37' : '#22c55e'} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: 'var(--color-barber-gray)' }}>Sem dados ainda</p>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Today's Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <Scissors size={16} style={{ color: 'var(--color-barber-gold)' }} /> Agenda de Hoje
              </h2>
              <Link to="/admin/agenda" className="text-xs" style={{ color: 'var(--color-barber-gold)' }}>Ver tudo →</Link>
            </div>
            {d.recentAppointments?.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--color-barber-gray)' }}>Nenhum agendamento hoje</p>
            ) : (
              <div className="space-y-3">
                {(d.recentAppointments || []).map(a => {
                  const st = statusStyle[a.status] || statusStyle.pending;
                  return (
                    <div key={a._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{a.client}</p>
                        <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>{a.service}{a.barber ? ` · ${a.barber}` : ''}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-bold" style={{ color: 'var(--color-barber-gold)' }}>{a.time}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Clients */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <Star size={16} style={{ color: 'var(--color-barber-gold)' }} /> Top Clientes
              </h2>
              <Link to="/admin/ranking" className="text-xs" style={{ color: 'var(--color-barber-gold)' }}>Ver ranking →</Link>
            </div>
            {d.topClients?.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--color-barber-gray)' }}>Sem dados ainda</p>
            ) : (
              <div className="space-y-3">
                {(d.topClients || []).map((c, i) => {
                  const tier = getTier(c.total_cuts || 0);
                  const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}º`;
                  return (
                    <div key={c._id} className="flex items-center gap-3">
                      <span className="text-xl">{medal}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{c.name}</p>
                        <span className="text-xs font-bold" style={{ color: tier.color }}>{tier.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: 'var(--color-barber-gold)' }}>{c.total_cuts} cortes</p>
                        <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>{c.points} pts</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default Dashboard;

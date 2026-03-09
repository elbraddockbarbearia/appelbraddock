import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Scissors, DollarSign, Award } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

const now = new Date();
const padMonth = (m) => String(m).padStart(2, '0');
const monthStart = `${now.getFullYear()}-${padMonth(now.getMonth() + 1)}-01`;
const monthEnd   = `${now.getFullYear()}-${padMonth(now.getMonth() + 1)}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

const COLORS = ['#d4af37', '#818cf8', '#34d399', '#fb923c', '#f472b6', '#60a5fa'];
const barberColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length] || COLORS[0];
const initials = (name) => name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Comissao = () => {
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate]     = useState(monthEnd);
  const [report, setReport]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/barbers/report/commission?startDate=${startDate}&endDate=${endDate}`);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const totalRevenue    = report.reduce((s, b) => s + b.totalRevenue, 0);
  const totalCommission = report.reduce((s, b) => s + b.commission, 0);
  const totalCuts       = report.reduce((s, b) => s + b.totalCuts, 0);
  const topBarber       = [...report].sort((a, b) => b.totalCuts - a.totalCuts)[0];

  return (
    <AdminSidebar>
      <div className="animate-in fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Comissões</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>Relatório de faturamento por profissional</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="input-field py-1.5 pl-3 pr-3 text-sm w-40" />
            <span style={{ color: 'var(--color-barber-gray)' }}>até</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="input-field py-1.5 pl-3 pr-3 text-sm w-40" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-barber-gold)', borderLeftStyle: 'solid' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
              <Scissors size={13} className="inline mr-1" />Total de Cortes
            </p>
            <p className="text-2xl font-display font-bold" style={{ color: 'var(--color-barber-gold)' }}>{totalCuts}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#22c55e', borderLeftStyle: 'solid' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
              <DollarSign size={13} className="inline mr-1" />Faturamento Total
            </p>
            <p className="text-2xl font-display font-bold" style={{ color: '#22c55e' }}>{fmt(totalRevenue)}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#818cf8', borderLeftStyle: 'solid' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
              <TrendingUp size={13} className="inline mr-1" />Total de Comissões
            </p>
            <p className="text-2xl font-display font-bold" style={{ color: '#818cf8' }}>{fmt(totalCommission)}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#fb923c', borderLeftStyle: 'solid' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
              <Award size={13} className="inline mr-1" />Mais Cortes
            </p>
            <p className="text-lg font-display font-bold" style={{ color: '#fb923c' }}>
              {topBarber?.barber?.name?.split(' ')[0] || '—'}
            </p>
          </div>
        </div>

        {/* Per-barber breakdown */}
        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
        ) : report.length === 0 ? (
          <div className="card text-center py-12">
            <TrendingUp size={40} className="mx-auto mb-4" style={{ color: 'var(--color-barber-gray)' }} />
            <p style={{ color: 'var(--color-barber-gray)' }}>Nenhum atendimento concluído neste período.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.sort((a, b) => b.totalRevenue - a.totalRevenue).map((row, i) => {
              const color = barberColor(row.barber?.name);
              const commPct = row.barber?.commission_rate || 0;
              const barShare = totalRevenue > 0 ? (row.totalRevenue / totalRevenue) * 100 : 0;
              return (
                <div key={i} className="card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-black shrink-0"
                      style={{ backgroundColor: color }}>
                      {initials(row.barber?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight truncate">{row.barber?.name}</h3>
                      {row.barber?.nickname && (
                        <p className="text-sm" style={{ color: 'var(--color-barber-gold)' }}>"{row.barber.nickname}"</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-display font-bold" style={{ color: '#22c55e' }}>{fmt(row.totalRevenue)}</p>
                      <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>{row.totalCuts} corte(s)</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: 'var(--color-barber-light)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barShare}%`, backgroundColor: color }} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-barber-gray)' }}>
                      Comissão ({commPct}%)
                    </span>
                    <span className="font-bold" style={{ color: '#818cf8' }}>{fmt(row.commission)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default Comissao;

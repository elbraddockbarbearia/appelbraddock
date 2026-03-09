import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Scissors, TrendingUp, Bell } from 'lucide-react';
import BarberSidebar from '../../components/BarberSidebar';
import api from '../../services/api';

const barberApi = () => {
  const token = localStorage.getItem('barberToken');
  return {
    get: (url) => api.get(url, { headers: { Authorization: `Bearer ${token}` } }),
  };
};

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const BarberDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const bApi = barberApi();

  useEffect(() => {
    const token = localStorage.getItem('barberToken');
    if (!token) { navigate('/barber/login'); return; }

    Promise.all([
      bApi.get('/barber/me/stats'),
      bApi.get('/barber/me/notifications'),
    ]).then(([s, n]) => {
      setStats(s.data);
      setUnread(n.data.unreadCount || 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <BarberSidebar unreadCount={unread}>
      <div className="text-center py-20" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
    </BarberSidebar>
  );

  return (
    <BarberSidebar unreadCount={unread}>
      <div className="animate-in fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">
            Olá, {stats?.barber?.nickname ? `"${stats.barber.nickname}"` : stats?.barber?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>
            Aqui está o resumo do seu mês
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-barber-gold)', borderLeftStyle: 'solid' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
              <Scissors size={13} className="inline mr-1" />Cortes no Mês
            </p>
            <p className="text-3xl font-display font-bold" style={{ color: 'var(--color-barber-gold)' }}>{stats?.totalCuts || 0}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#22c55e', borderLeftStyle: 'solid' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>Faturamento</p>
            <p className="text-2xl font-display font-bold" style={{ color: '#22c55e' }}>{fmt(stats?.totalRevenue)}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#818cf8', borderLeftStyle: 'solid' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
              <TrendingUp size={13} className="inline mr-1" />Minha Comissão
            </p>
            <p className="text-2xl font-display font-bold" style={{ color: '#818cf8' }}>{fmt(stats?.commission)}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#fb923c', borderLeftStyle: 'solid' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
              <CalendarDays size={13} className="inline mr-1" />Hoje
            </p>
            <p className="text-3xl font-display font-bold" style={{ color: '#fb923c' }}>{stats?.todayCount || 0}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-barber-gray)' }}>agendamento(s)</p>
          </div>
        </div>

        {/* Today's schedule */}
        {stats?.todayAppointments?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CalendarDays size={18} style={{ color: 'var(--color-barber-gold)' }} />
              Agenda de Hoje
            </h2>
            <div className="space-y-3">
              {stats.todayAppointments.map(a => (
                <div key={a._id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-barber-black)' }}>
                  <div>
                    <p className="font-semibold">{a.client_id?.name || 'Cliente'}</p>
                    <p className="text-sm" style={{ color: 'var(--color-barber-gray)' }}>{a.service?.name || 'Serviço'}</p>
                  </div>
                  <p className="font-bold text-lg" style={{ color: 'var(--color-barber-gold)' }}>{a.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications flash */}
        {unread > 0 && (
          <button onClick={() => navigate('/barber/notificacoes')}
            className="card w-full flex items-center gap-3 mt-4 cursor-pointer"
            style={{ border: '1px solid rgba(212,175,55,0.3)', backgroundColor: 'rgba(212,175,55,0.05)' }}>
            <Bell size={22} style={{ color: 'var(--color-barber-gold)' }} />
            <p className="font-semibold">Você tem <span style={{ color: 'var(--color-barber-gold)' }}>{unread} notificação(ões)</span> não lida(s)</p>
          </button>
        )}
      </div>
    </BarberSidebar>
  );
};

export default BarberDashboard;

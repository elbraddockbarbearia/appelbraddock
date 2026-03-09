import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Scissors, Star, ChevronRight, CalendarDays } from 'lucide-react';

const mockHistory = [
  { id: 1, date: '07/03/2026', time: '09:30', service: 'Corte + Barba', price: 60, status: 'completed' },
  { id: 2, date: '20/02/2026', time: '10:00', service: 'Corte',          price: 40, status: 'completed' },
  { id: 3, date: '05/02/2026', time: '15:00', service: 'Barba',          price: 25, status: 'completed' },
];

const statusLabel = {
  completed:  { label: 'Concluído', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  cancelled:  { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  pending:    { label: 'Pendente',  color: '#cba052', bg: 'rgba(203,160,82,0.1)' },
};

const ClientHistory = () => {
  const navigate = useNavigate();
  
  const getClient = () => {
    try {
      const stored = localStorage.getItem('client');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return null;
  };

  const client = getClient();

  if (!client) {
    return <Navigate to="/login" replace />;
  }

  // Use dynamic cuts/points if available
  const CUTS_DONE  = client.totalCuts || 0;
  const CUTS_GOAL  = 10;
  const progressPct = (CUTS_DONE / CUTS_GOAL) * 100;
  const cutsToFree = CUTS_GOAL - CUTS_DONE;

  return (
    <div className="min-h-screen pb-10 px-5 pt-8 max-w-sm mx-auto">

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--color-barber-gold)' }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      {/* Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold">{client.nickname || client.name}</h2>
          <p className="text-sm" style={{ color: 'var(--color-barber-gray)' }}>{client.phone}</p>
        </div>
        <div
          className="h-14 w-14 rounded-full flex items-center justify-center font-display font-bold text-xl"
          style={{
            background: 'linear-gradient(135deg, #cba052, #a67d36)',
            color: '#111111',
            boxShadow: '0 0 20px rgba(203,160,82,0.4)'
          }}
        >
          {client.nickname ? client.nickname.substring(0, 2).toUpperCase() : client.name.substring(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Loyalty Card */}
      <div
        className="card mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1f0a 100%)',
          borderColor: 'rgba(203,160,82,0.4)',
        }}
      >
        {/* Decorative scissors */}
        <Scissors
          className="absolute -right-4 -top-4 rotate-45 opacity-5"
          size={80}
          style={{ color: 'var(--color-barber-gold)' }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star size={18} className="fill-current" style={{ color: 'var(--color-barber-gold)' }} />
              <span className="font-display font-bold" style={{ color: 'var(--color-barber-gold)' }}>
                VIP Fidelidade
              </span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: 'rgba(203,160,82,0.15)', color: 'var(--color-barber-gold)' }}>
              {CUTS_DONE}/{CUTS_GOAL} cortes
            </span>
          </div>

          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Faltam <strong style={{ color: 'white' }}>{cutsToFree} {cutsToFree === 1 ? 'corte' : 'cortes'}</strong> para ganhar 1 serviço grátis!
          </p>

          {/* Progress Bar */}
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #cba052, #dfb974)'
              }}
            />
          </div>

          <div className="flex justify-between mt-1.5 text-xs" style={{ color: 'var(--color-barber-gray)' }}>
            <span>0</span>
            <span>{CUTS_GOAL} cortes = 1 grátis 🎁</span>
          </div>
        </div>
      </div>

      {/* Schedule New Button */}
      <button
        onClick={() => navigate('/schedule')}
        className="btn-primary w-full mb-6"
      >
        <CalendarDays size={18} />
        Agendar Novo Horário
      </button>

      {/* History List */}
      <h3 className="text-lg font-bold mb-3">Histórico de Visitas</h3>

      {mockHistory.length === 0 ? (
        <p className="text-center py-8" style={{ color: 'var(--color-barber-gray)' }}>Nenhum agendamento encontrado.</p>
      ) : (
        <div className="space-y-3">
          {mockHistory.map(item => {
            const s = statusLabel[item.status] || statusLabel.pending;
            return (
              <div
                key={item.id}
                className="card py-4 flex items-center justify-between"
                style={{ padding: '1rem 1.25rem' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(203,160,82,0.1)' }}
                  >
                    <Scissors size={18} style={{ color: 'var(--color-barber-gold)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.service}</p>
                    <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>
                      {item.date} às {item.time}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-barber-gold)' }}>
                    R$ {item.price}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ color: s.color, backgroundColor: s.bg }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default ClientHistory;

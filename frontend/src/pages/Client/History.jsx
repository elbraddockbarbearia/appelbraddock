import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Scissors, Star, CalendarDays, CreditCard } from 'lucide-react';
import api from '../../services/api';

const statusLabel = {
  completed:  { label: 'Concluído', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  cancelled:  { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  pending:    { label: 'Pendente',  color: '#cba052', bg: 'rgba(203,160,82,0.1)' },
  blocked:    { label: 'Bloqueado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const ClientHistory = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(() => {
    try {
      const stored = localStorage.getItem('client');
      return stored ? JSON.parse(stored) : null;
    } catch(e) {
      return null;
    }
  });
  
  useEffect(() => {
    if (clientData) {
      // Fetch fresh client data
      api.get('/auth/me').then(res => {
        setClientData(res.data);
        localStorage.setItem('client', JSON.stringify(res.data));
      }).catch(console.error);

      // Fetch appointments
      api.get('/appointments/client')
        .then(res => setAppointments(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  if (!clientData) {
    return <Navigate to="/login" replace />;
  }

  const CUTS_DONE  = clientData.total_cuts || 0;
  const CUTS_GOAL  = 10;
  const progressPct = Math.min(((CUTS_DONE % CUTS_GOAL) / CUTS_GOAL) * 100, 100);
  const cutsToFree = Math.max(CUTS_GOAL - (CUTS_DONE % CUTS_GOAL), 0) || CUTS_GOAL;

  const formatDateLabel = (isoDate) => {
    if (!isoDate) return '';
    try {
      const parts = isoDate.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return isoDate;
    } catch (e) {
      return isoDate;
    }
  };

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
          <h2 className="text-2xl font-display font-bold">{clientData.nickname || clientData.name}</h2>
          <p className="text-sm" style={{ color: 'var(--color-barber-gray)' }}>{clientData.phone}</p>
        </div>
        <div
          className="h-14 w-14 rounded-full flex items-center justify-center font-display font-bold text-xl"
          style={{
            background: 'linear-gradient(135deg, #cba052, #a67d36)',
            color: '#111111',
            boxShadow: '0 0 20px rgba(203,160,82,0.4)'
          }}
        >
          {clientData.nickname ? clientData.nickname.substring(0, 2).toUpperCase() : clientData.name.substring(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Plan Card */}
      {clientData.plano && (clientData.plano.ativo || clientData.plano.cortesRestantes > 0 || clientData.plano.dataVencimento) && (
        <div className="card mb-6 border" style={{ borderColor: clientData.plano.ativo ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard size={18} style={{ color: clientData.plano.ativo ? '#22c55e' : '#ef4444' }} />
              <span className="font-display font-bold lg:text-lg">Plano Mensalidade</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{
              background: clientData.plano.ativo ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: clientData.plano.ativo ? '#22c55e' : '#ef4444'
            }}>
              {clientData.plano.ativo ? 'ATIVO' : 'VENCIDO'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>Cortes Restantes</p>
              <p className="text-2xl font-bold mt-1">{clientData.plano.cortesRestantes || 0} <span className="text-sm font-normal text-barber-gray">/ {clientData.plano.cortesTotais || 4}</span></p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>Data de Vencimento</p>
              <p className="font-medium mt-1 text-sm">{clientData.plano.dataVencimento ? formatDateLabel(clientData.plano.dataVencimento) : '--'}</p>
            </div>
          </div>
          
          {!clientData.plano.ativo && (
            <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
              Seu plano expirou! Fale com a barbearia para renovar e continuar usando seus cortes.
            </div>
          )}
        </div>
      )}

      {/* Loyalty Card */}
      <div
        className="card mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1f0a 100%)',
          borderColor: 'rgba(203,160,82,0.4)',
        }}
      >
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
              {CUTS_DONE % CUTS_GOAL}/{CUTS_GOAL} cortes
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Faltam <strong style={{ color: 'white' }}>{cutsToFree} {cutsToFree === 1 ? 'corte' : 'cortes'}</strong> para ganhar 1 serviço grátis!
          </p>
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

      {loading ? (
        <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-barber-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 bg-[#111] rounded-xl border border-[#222]">
          <p style={{ color: 'var(--color-barber-gray)' }}>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(item => {
            const s = statusLabel[item.status] || statusLabel.pending;
            const isPlan = item.price === 0;
            return (
              <div
                key={item._id}
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
                    <p className="font-semibold text-sm">{item.service?.name || 'Serviço'}</p>
                    <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>
                      {formatDateLabel(item.date)} às {item.time}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isPlan ? (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold text-green-400 border border-green-500/30" style={{ background: 'rgba(34,197,94,0.1)' }}>
                      Mensalidade
                    </span>
                  ) : (
                    <span className="text-sm font-bold" style={{ color: 'var(--color-barber-gold)' }}>
                      R$ {item.price?.toFixed(2) || '0.00'}
                    </span>
                  )}
                  <span
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium mt-1"
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

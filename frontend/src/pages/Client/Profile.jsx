import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Scissors, Phone, Mail, CalendarDays, LogOut, Cake, ChevronRight } from 'lucide-react';
import { getTier, getTierProgress, cutsToNextTier } from '../../utils/loyalty';

const getClient = () => {
  try {
    const stored = localStorage.getItem('client');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing client', e);
  }
  return null;
};

const ProfileRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid var(--color-barber-light)' }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(203,160,82,0.1)' }}>
        <Icon size={16} style={{ color: 'var(--color-barber-gold)' }} />
      </div>
      <span className="text-sm" style={{ color: 'var(--color-barber-gray)' }}>{label}</span>
    </div>
    <span className="text-sm font-semibold">{value || <span style={{ color: 'var(--color-barber-gray)' }}>Não informado</span>}</span>
  </div>
);

const ClientProfile = () => {
  const navigate = useNavigate();
  const client = getClient();

  if (!client) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('client');
    localStorage.removeItem('clientToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen px-5 pt-8 pb-12 max-w-sm mx-auto" style={{ backgroundColor: 'var(--color-barber-black)' }}>

      {/* Back */}
      <button onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: 'var(--color-barber-gold)' }}>
        <ArrowLeft size={18} /> Voltar
      </button>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center font-display font-black text-2xl mb-4"
          style={{
            background: 'linear-gradient(135deg, #cba052, #a67d36)',
            color: '#111111',
            boxShadow: '0 0 30px rgba(203,160,82,0.4)',
          }}
        >
          {client.nickname ? client.nickname.substring(0, 2).toUpperCase() : client.name.substring(0, 2).toUpperCase()}
        </div>
        <h1 className="text-2xl font-display font-bold">{client.nickname || client.name}</h1>
        {/* Tier Badge */}
        {(() => {
          const tier = getTier(client.totalCuts || 0);
          return (
            <span className="mt-2 px-4 py-1 rounded-full text-sm font-bold"
              style={{ backgroundColor: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
              {tier.label}
            </span>
          );
        })()}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card text-center py-5">
          <p className="text-3xl font-display font-black" style={{ color: 'var(--color-barber-gold)' }}>{client.totalCuts}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-barber-gray)' }}>Total de Cortes</p>
        </div>
        <div className="card text-center py-5">
          <p className="text-3xl font-display font-black" style={{ color: 'var(--color-barber-gold)' }}>{client.points}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-barber-gray)' }}>Pontos VIP</p>
        </div>
      </div>

      {/* Tier Progress Card */}
      {(() => {
        const cuts = client.totalCuts || 0;
        const tier = getTier(cuts);
        const progress = getTierProgress(cuts);
        const remaining = cutsToNextTier(cuts);
        return (
          <div className="card mb-6" style={{ border: `1px solid ${tier.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: tier.color }}>Nível de Fidelidade</h2>
              <span className="font-bold text-lg" style={{ color: tier.color }}>{tier.label}</span>
            </div>
            {/* Progress bar */}
            {remaining > 0 && (
              <>
                <div className="h-2 rounded-full mb-2 overflow-hidden" style={{ backgroundColor: 'var(--color-barber-light)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress}%`, backgroundColor: tier.color }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>
                  Falta {remaining} corte{remaining > 1 ? 's' : ''} para o próximo nível!
                </p>
              </>
            )}
            {remaining === 0 && (
              <p className="text-xs font-bold" style={{ color: tier.color }}>Nível máximo atingido! 💎</p>
            )}
            {/* Benefits */}
            <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid var(--color-barber-light)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-barber-gray)' }}>Seus benefícios:</p>
              {tier.benefits.map(b => (
                <p key={b} className="text-xs" style={{ color: tier.color }}>✓ {b}</p>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Info Card */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-barber-gray)' }}>Dados Pessoais</h2>
        <ProfileRow icon={Phone} label="Telefone" value={client.phone} />
        {client.email && <ProfileRow icon={Mail}  label="E-mail"   value={client.email} />}
        {client.birthday && <ProfileRow icon={Cake}  label="Nascimento"   value={client.birthday.split('-').reverse().join('/')} />}
      </div>

      {/* Quick Actions */}
      <div className="card mb-6 space-y-1 p-2">
        <Link
          to="/schedule"
          className="flex items-center justify-between p-3 rounded-lg transition-colors"
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-barber-light)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
        >
          <div className="flex items-center gap-3">
            <CalendarDays size={18} style={{ color: 'var(--color-barber-gold)' }} />
            <span className="text-sm font-medium">Agendar Horário</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--color-barber-gray)' }} />
        </Link>
        <Link
          to="/history"
          className="flex items-center justify-between p-3 rounded-lg transition-colors"
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-barber-light)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
        >
          <div className="flex items-center gap-3">
            <Scissors size={18} style={{ color: 'var(--color-barber-gold)' }} />
            <span className="text-sm font-medium">Ver Fidelidade & Histórico</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--color-barber-gray)' }} />
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors"
        style={{
          backgroundColor: 'rgba(239,68,68,0.08)',
          color: '#ef4444',
          border: '1px solid rgba(239,68,68,0.2)',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
      >
        <LogOut size={16} />
        Sair da Conta
      </button>

    </div>
  );
};

export default ClientProfile;

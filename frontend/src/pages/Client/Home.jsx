import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, User, Star, MapPin, Clock, ChevronRight, LogIn, UserPlus, LogOut } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const getClient = () => {
    try {
      const stored = localStorage.getItem('client');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return null;
  };
  const client = getClient();
  const isLoggedIn = !!client;

  // Calculate cuts to free reward if logged in
  const cutsToFree = client ? Math.max(0, 10 - (client.total_cuts || 0)) : 10;

  const handleLogout = () => {
    localStorage.removeItem('client');
    localStorage.removeItem('clientToken');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen pb-8" style={{ backgroundColor: 'var(--color-barber-black)' }}>

      {/* Hero Header */}
      <header className="pt-14 pb-10 px-6 text-center relative overflow-hidden">
        {/* Logout Button (if logged in) */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="absolute top-6 right-6 p-2 rounded-full transition-colors z-10"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            title="Sair da Conta"
          >
            <LogOut size={18} />
          </button>
        )}

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(203,160,82,0.07)' }}
        />
        <div className="relative">
          <p className="text-xs tracking-[0.35em] uppercase mb-3" style={{ color: 'var(--color-barber-gray)' }}>
            Bem-vindo à
          </p>
          <h1
            className="text-5xl font-display font-black tracking-wide uppercase mb-2"
            style={{ color: 'var(--color-barber-gold)', textShadow: '0 0 40px rgba(203,160,82,0.3)' }}
          >
            El Braddock
          </h1>
          <p className="text-sm tracking-[0.4em] uppercase" style={{ color: 'var(--color-barber-gray)' }}>
            Barbearia Premium
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-5 flex flex-col items-center gap-5 max-w-sm mx-auto w-full">

        {/* Personalized Greeting */}
        {client && (
          <div className="w-full text-left bg-gradient-to-br from-[#1a1a1a] to-[#2a1f0a] border border-[#cba052]/30 p-4 rounded-xl shadow-lg relative overflow-hidden">
            <Star size={80} className="absolute -right-6 -bottom-6 text-[#cba052] opacity-5 rotate-12" />
            <h2 className="text-xl font-display font-bold mb-1">
              Olá, <span style={{ color: 'var(--color-barber-gold)' }}>{client.nickname || client.name.split(' ')[0]}</span>!
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Faltam <strong className="text-white">{cutsToFree} {cutsToFree === 1 ? 'corte' : 'cortes'}</strong> para você ganhar 1 serviço grátis. 🎁
            </p>
          </div>
        )}

        {/* Primary CTA */}
        <Link
          to="/schedule"
          className="btn-primary w-full text-lg font-bold py-4 rounded-xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <Calendar size={22} />
          Agendar Horário
        </Link>

        {/* Login/Register or Profile shortcuts */}
        {isLoggedIn ? (
          /* Logged in: show Meu Perfil + Fidelidade as DIFFERENT destinations */
          <div className="grid grid-cols-2 gap-3 w-full">
            {/* Meu Perfil → profile page (dados, stats, sair) */}
            <Link
              to="/profile"
              className="card flex flex-col items-center justify-center py-6 gap-2 group transition-all duration-200"
              style={{ borderColor: 'var(--color-barber-light)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-barber-gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-barber-light)'}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                style={{ backgroundColor: 'rgba(203,160,82,0.12)' }}
              >
                <User size={22} style={{ color: 'var(--color-barber-gold)' }} />
              </div>
              <span className="text-sm font-semibold">Meu Perfil</span>
              <span className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>Dados & conta</span>
            </Link>

            {/* Fidelidade → history page (pontos, histórico de cortes) */}
            <Link
              to="/history"
              className="card flex flex-col items-center justify-center py-6 gap-2 group transition-all duration-200"
              style={{ borderColor: 'var(--color-barber-light)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-barber-gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-barber-light)'}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                style={{ backgroundColor: 'rgba(203,160,82,0.12)' }}
              >
                <Star size={22} className="fill-current" style={{ color: 'var(--color-barber-gold)' }} />
              </div>
              <span className="text-sm font-semibold">Fidelidade</span>
              <span className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>Pontos & história</span>
            </Link>
          </div>
        ) : (
          /* Not logged in: show Login + Cadastrar */
          <div className="grid grid-cols-2 gap-3 w-full">
            <Link
              to="/login"
              className="card flex flex-col items-center justify-center py-6 gap-2 transition-all duration-200"
              style={{ borderColor: 'var(--color-barber-light)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-barber-gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-barber-light)'}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ backgroundColor: 'rgba(203,160,82,0.12)' }}>
                <LogIn size={22} style={{ color: 'var(--color-barber-gold)' }} />
              </div>
              <span className="text-sm font-semibold">Entrar</span>
              <span className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>Já tenho conta</span>
            </Link>

            <Link
              to="/register"
              className="card flex flex-col items-center justify-center py-6 gap-2 transition-all duration-200"
              style={{ borderColor: 'var(--color-barber-light)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-barber-gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-barber-light)'}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ backgroundColor: 'rgba(203,160,82,0.12)' }}>
                <UserPlus size={22} style={{ color: 'var(--color-barber-gold)' }} />
              </div>
              <span className="text-sm font-semibold">Cadastrar</span>
              <span className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>Criar conta</span>
            </Link>
          </div>
        )}

        {/* Info Card */}
        <div className="card w-full">
          <h3 className="font-semibold text-xs mb-4 flex items-center gap-2 uppercase tracking-wider" style={{ color: 'var(--color-barber-gold)' }}>
            <Clock size={14} /> Informações
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-barber-gray)' }} />
              <div>
                <p className="text-sm font-semibold">Segunda a Sábado</p>
                <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>09:00 às 19:30</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-barber-gray)' }} />
              <div>
                <p className="text-sm font-semibold">Av. Dep. José da Costa França</p>
                <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>Lote 2, Quadra 14, Loja — São João de Meriti</p>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/5521999999999"
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-between w-full text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors"
            style={{ color: 'var(--color-barber-gold)', backgroundColor: 'rgba(203,160,82,0.08)', borderRadius: '10px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(203,160,82,0.14)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(203,160,82,0.08)'}
          >
            <span>💬 Falar no WhatsApp</span>
            <ChevronRight size={16} />
          </a>
        </div>

      </main>
    </div>
  );
};

export default Home;

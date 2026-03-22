import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Phone, ArrowLeft, Scissors, Lock } from 'lucide-react';
import api from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = new URLSearchParams(location.search).get('next') || '/history';
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError('Informe seu telefone e senha.');
      return;
    }
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login/client', { phone: phone.trim(), password });
      localStorage.setItem('clientToken', data.token);
      localStorage.setItem('client', JSON.stringify(data.client));
      navigate(nextPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Telefone ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ backgroundColor: 'var(--color-barber-black)' }}>
      <div className="w-full max-w-sm">

        {/* Back */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'var(--color-barber-gold)' }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/logos/Logo-ElBraddock-Dourado.png" 
            alt="El Braddock" 
            className="w-32 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(203,160,82,0.2)]" 
          />
          <h1 className="text-2xl font-display font-bold">Entrar</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>Acesse seu perfil e histórico de cortes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-barber-gray)' }}>
              WhatsApp / Telefone
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-barber-gray)' }} />
              <input
                type="tel"
                className="input-field pl-9"
                placeholder="(21) 99999-9999"
                value={phone}
                onChange={e => { setPhone(e.target.value); if (error) setError(''); }}
                autoFocus
                required
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-barber-gray)' }}>
              Use o número cadastrado no El Braddock.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-barber-gray)' }}>
              Senha
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-barber-gray)' }} />
              <input
                type="password"
                className="input-field pl-9"
                placeholder="Sua senha"
                value={password}
                onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-barber-gray)' }}>
          Não tem conta?{' '}
          <Link to="/register" className="font-semibold" style={{ color: 'var(--color-barber-gold)' }}>
            Cadastrar agora
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;

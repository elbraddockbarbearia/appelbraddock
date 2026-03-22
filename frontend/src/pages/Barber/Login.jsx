import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const BarberLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/barber/login', { email, password });
      localStorage.setItem('barberToken', data.token);
      localStorage.setItem('barber', JSON.stringify(data.barber));
      navigate('/barber');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-barber-black)' }}>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <img 
            src="/logos/Logo-ElBraddock-Dourado.png" 
            alt="El Braddock" 
            className="w-48 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(203,160,82,0.2)]" 
          />
          <p className="text-sm tracking-widest uppercase mt-1" style={{ color: 'var(--color-barber-gray)' }}>
            Portal do Barbeiro
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-6 text-center">Entrar</h2>

          {error && (
            <div className="p-3 rounded-lg mb-5 text-sm text-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>E-mail</label>
              <input type="email" className="input-field" placeholder="seu@email.com" required
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>Senha</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-12" placeholder="••••••••" required
                  value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: 'var(--color-barber-gray)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BarberLogin;

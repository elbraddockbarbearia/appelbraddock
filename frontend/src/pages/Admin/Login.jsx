import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor, informe a senha de administrador.');
      return;
    }
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { password });
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      setError('Senha incorreta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #ef4444, #991b1b)', boxShadow: '0 0 30px rgba(239,68,68,0.2)' }}
          >
            <ShieldAlert size={28} style={{ color: '#fff' }} />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Acesso Restrito</h1>
          <p className="text-sm mt-1" style={{ color: '#a3a3a3' }}>Área exclusiva para administradores</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#a3a3a3' }} />
              <input
                type="password"
                className="input-field pl-9 w-full bg-[#111] border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Senha Master"
                value={password}
                onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                autoFocus
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white transition-opacity"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Verificando...' : 'Acessar Painel'}
          </button>
        </form>
        
        <button 
          onClick={() => navigate('/')} 
          className="w-full mt-6 text-sm text-center text-[#a3a3a3] hover:text-white transition-colors"
        >
          Voltar para Início
        </button>

      </div>
    </div>
  );
};

export default AdminLogin;

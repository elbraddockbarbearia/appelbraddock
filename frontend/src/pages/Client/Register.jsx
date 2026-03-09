import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Phone, Mail, ArrowLeft, Scissors, Lock, Cake, Smile } from 'lucide-react';
import api from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = new URLSearchParams(location.search).get('next') || '/history';
  const [form, setForm] = useState({
    name: '', nickname: '', phone: '', email: '', birthday: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.password.trim() || !form.nickname.trim()) {
      setError('Por favor, preencha os campos obrigatórios (*).');
      return;
    }
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', form);
      // Store JWT token and client profile
      localStorage.setItem('clientToken', data.token);
      localStorage.setItem('client', JSON.stringify(data.client));
      navigate(nextPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
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
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #cba052, #a67d36)', boxShadow: '0 0 30px rgba(203,160,82,0.3)' }}
          >
            <Scissors size={28} style={{ color: '#111' }} />
          </div>
          <h1 className="text-2xl font-display font-bold">Criar Conta</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>Cadastre-se para agendar e acumular pontos</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-barber-gray)' }}>Nome completo *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-barber-gray)' }} />
              <input type="text" className="input-field pl-9" placeholder="Ex: João da Silva" value={form.name} onChange={handleChange('name')} required />
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-barber-gray)' }}>Como quer ser chamado? *</label>
            <div className="relative">
              <Smile size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-barber-gray)' }} />
              <input type="text" className="input-field pl-9" placeholder="Ex: João, Jão, Silva..." value={form.nickname} onChange={handleChange('nickname')} required />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-barber-gray)' }}>WhatsApp / Telefone *</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-barber-gray)' }} />
              <input type="tel" className="input-field pl-9" placeholder="(21) 99999-9999" value={form.phone} onChange={handleChange('phone')} required />
            </div>
          </div>

          {/* Email - optional */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-barber-gray)' }}>
              E-mail <span className="text-xs opacity-60">(opcional)</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-barber-gray)' }} />
              <input type="email" className="input-field pl-9" placeholder="exemplo@email.com" value={form.email} onChange={handleChange('email')} />
            </div>
          </div>

          {/* Birthday - optional */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-barber-gray)' }}>
              Data de Aniversário <span className="text-xs opacity-60">(opcional)</span>
            </label>
            <div className="relative">
              <Cake size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-barber-gray)' }} />
              <input type="date" className="input-field pl-9" style={{ colorScheme: 'dark' }} value={form.birthday} onChange={handleChange('birthday')} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-barber-gray)' }}>Senha *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-barber-gray)' }} />
              <input type="password" className="input-field pl-9" placeholder="Crie uma senha" value={form.password} onChange={handleChange('password')} required />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-barber-gray)' }}>
          Já tem cadastro?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-barber-gold)' }}>Entrar</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
